"""대양ING 백엔드 API (FastAPI).

지금 하는 일
- 홈페이지 상담 문의를 hyunwoo.kim@daeyanging.com 으로 메일 발송(+ 대시보드용 문의 기록)
- 방문 기록 저장과 집계(/events, /stats) — 대시보드(/dashboard)가 쓴다
- 대시보드 로그인 인증번호 메일(/otp/request, /otp/verify) — DASHBOARD_EMAILS 에 있는 주소만
- 사이트(Next.js 서버 액션)만 부른다. iwinv 의 전용 내부 네트워크(daeyanging-internal)에만 붙어 있어
  인터넷과 서버의 다른 컨테이너에서는 닿지 않고, 그래도 공유 토큰(X-Api-Key)을 한 번 더 확인한다.
- 환경변수(서버 /home/ubuntu/web/daeyanging-api/prod.env, 이미지·저장소에는 없음):
    API_TOKEN   사이트와 나눠 쓰는 토큰(필수)
    SMTP_PASS   Zoho 앱 비밀번호(필수)
    SMTP_USER   보내는 계정(기본 hyunwoo.kim@daeyanging.com)
    SMTP_HOST   기본 smtppro.zoho.com · SMTP_PORT 기본 465(SSL)
    MAIL_TO     문의를 받을 주소(쉼표로 여러 개, 기본 SMTP_USER)
    DASHBOARD_EMAILS  대시보드에 들어올 수 있는 주소(쉼표로 여러 개) — 저장소가 공개라 여기에만 둔다
    DB_PATH     SQLite 파일(기본 /data/daeyanging.db, 서버의 ./data 를 /data 로 붙임)
"""

from __future__ import annotations

import logging
import os
import re
import secrets
import smtplib
import ssl
from email.headerregistry import Address
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from html import escape
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator

from . import store

log = logging.getLogger("daeyanging.api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

SMTP_USER = os.environ.get("SMTP_USER", "hyunwoo.kim@daeyanging.com")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtppro.zoho.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
MAIL_TO = [a.strip() for a in os.environ.get("MAIL_TO", SMTP_USER).split(",") if a.strip()]
SENDER_NAME = "대양ING 홈페이지"

EMAIL_RE = re.compile(r"^[^\s@<>()\",;:]+@[^\s@<>()\",;:]+\.[^\s@<>()\",;:]{2,}$")
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]+")

DASHBOARD_EMAILS = {a.strip().lower() for a in os.environ.get("DASHBOARD_EMAILS", "").split(",") if a.strip()}

app = FastAPI(title="daeyanging-api", docs_url=None, redoc_url=None, openapi_url=None)
store.init()


def one_line(v: str) -> str:
    """메일 머리글에 들어갈 값: 줄바꿈·제어 문자를 공백으로."""
    return CONTROL_RE.sub(" ", v).strip()


class Inquiry(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=80)]
    email: Annotated[str, Field(min_length=3, max_length=200)]
    message: Annotated[str, Field(min_length=1, max_length=6000)]
    # 사이트의 "의류 창업이 처음이에요" — 켜지면 메일 제목을 [첫 창업 문의]로 바꿔 받은편지함에서 바로 구별한다
    first_time: bool = False
    client_ip: Annotated[str | None, Field(default=None, max_length=64)] = None

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = one_line(v)
        if not v:
            raise ValueError("name is empty")
        return v

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = one_line(v)
        if not EMAIL_RE.match(v):
            raise ValueError("invalid email")
        return v

    @field_validator("message")
    @classmethod
    def _message(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("message is empty")
        return v


def require_token(x_api_key: str | None) -> None:
    expected = os.environ.get("API_TOKEN", "")
    if not expected or not x_api_key or not secrets.compare_digest(x_api_key, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "unauthorized")


def build_message(q: Inquiry) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = f"{'[첫 창업 문의]' if q.first_time else '[홈페이지 문의]'} {q.name}"
    msg["From"] = formataddr((SENDER_NAME, SMTP_USER))
    msg["To"] = ", ".join(MAIL_TO)
    user, _, domain = q.email.partition("@")
    msg["Reply-To"] = Address(display_name=q.name, username=user, domain=domain)
    msg["Message-ID"] = make_msgid(domain=SMTP_USER.partition("@")[2] or None)
    first = "구분: 의류 창업이 처음인 분\n" if q.first_time else ""
    text = f"성함 / 회사명: {q.name}\n이메일: {q.email}\n{first}\n{q.message}\n"
    html = (
        f"<p><b>성함 / 회사명</b>: {escape(q.name)}<br><b>이메일</b>: {escape(q.email)}"
        f"{'<br><b>구분</b>: 의류 창업이 처음인 분' if q.first_time else ''}</p>"
        f'<hr><p style="white-space:pre-wrap">{escape(q.message)}</p>'
    )
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    return msg


def send(msg: EmailMessage) -> None:
    password = os.environ.get("SMTP_PASS")
    if not password:
        raise RuntimeError("SMTP_PASS is not set")
    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=20) as s:
            s.login(SMTP_USER, password)
            s.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
            s.starttls(context=ctx)
            s.login(SMTP_USER, password)
            s.send_message(msg)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# 동기 함수라 FastAPI 가 스레드 풀에서 돌린다(SMTP 대기 중에도 다른 요청을 막지 않음).
@app.post("/inquiries", status_code=status.HTTP_202_ACCEPTED)
def create_inquiry(q: Inquiry, x_api_key: Annotated[str | None, Header()] = None) -> dict[str, bool]:
    require_token(x_api_key)
    try:
        send(build_message(q))
    except Exception as err:  # noqa: BLE001 — 원인은 로그에만 남기고 사이트에는 실패만 알린다
        log.error("inquiry mail failed (ip=%s): %s: %s", q.client_ip, type(err).__name__, err)
        record_inquiry(q, mailed=False)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "mail failed") from None
    log.info("inquiry mail sent (ip=%s)", q.client_ip)
    record_inquiry(q, mailed=True)
    return {"ok": True}


def record_inquiry(q: Inquiry, mailed: bool) -> None:
    # 기록이 실패해도 문의 메일 자체에는 영향을 주지 않는다
    try:
        store.add_inquiry(q.name, q.email, q.first_time, q.client_ip or "", mailed)
    except Exception as err:  # noqa: BLE001
        log.error("inquiry record failed: %s: %s", type(err).__name__, err)


# ───────── 방문 기록 ─────────


class PageView(BaseModel):
    path: Annotated[str, Field(min_length=1, max_length=300)]
    ref: Annotated[str, Field(max_length=200)] = ""
    ip: Annotated[str, Field(max_length=64)] = ""
    ua: Annotated[str, Field(max_length=500)] = ""


@app.post("/events", status_code=status.HTTP_202_ACCEPTED)
def create_event(e: PageView, x_api_key: Annotated[str | None, Header()] = None) -> dict[str, bool]:
    require_token(x_api_key)
    if store.is_bot(e.ua) or not e.path.startswith("/"):
        return {"ok": False}
    store.add_pageview(one_line(e.path), one_line(e.ref), e.ip, e.ua)
    return {"ok": True}


@app.get("/stats")
def get_stats(
    days: Annotated[int, Query(ge=1, le=366)] = 30, x_api_key: Annotated[str | None, Header()] = None
) -> dict:
    require_token(x_api_key)
    return store.stats(days)


# ───────── 대시보드 로그인(메일 인증번호) ─────────


class OtpRequest(BaseModel):
    email: Annotated[str, Field(min_length=3, max_length=200)]


class OtpVerify(OtpRequest):
    code: Annotated[str, Field(min_length=6, max_length=6, pattern=r"^\d{6}$")]


@app.post("/otp/request", status_code=status.HTTP_202_ACCEPTED)
def otp_request(r: OtpRequest, x_api_key: Annotated[str | None, Header()] = None) -> dict[str, bool]:
    """허용된 주소면 인증번호 메일을 보낸다. 허용되지 않은 주소도 같은 응답을 돌려준다(목록을 알 수 없게)."""
    require_token(x_api_key)
    email = one_line(r.email).lower()
    if email not in DASHBOARD_EMAILS:
        log.warning("dashboard code requested for a non-allowed address")
        return {"ok": True}
    code = store.new_otp(email)
    if code is None:  # 1분 안에 다시 요청
        return {"ok": True}
    msg = EmailMessage()
    msg["Subject"] = f"[대양ING 대시보드] 인증번호 {code}"
    msg["From"] = formataddr((SENDER_NAME, SMTP_USER))
    msg["To"] = email
    msg["Message-ID"] = make_msgid(domain=SMTP_USER.partition("@")[2] or None)
    msg.set_content(
        f"대양ING 대시보드 로그인 인증번호: {code}\n\n"
        "10분 동안 쓸 수 있습니다. 직접 요청하지 않았다면 이 메일은 무시하세요.\n"
    )
    try:
        send(msg)
    except Exception as err:  # noqa: BLE001
        log.error("dashboard code mail failed: %s: %s", type(err).__name__, err)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "mail failed") from None
    log.info("dashboard code sent")
    return {"ok": True}


@app.post("/otp/verify")
def otp_verify(r: OtpVerify, x_api_key: Annotated[str | None, Header()] = None) -> dict[str, bool]:
    require_token(x_api_key)
    email = one_line(r.email).lower()
    ok = email in DASHBOARD_EMAILS and store.check_otp(email, r.code)
    log.info("dashboard login %s", "ok" if ok else "rejected")
    return {"ok": ok}
