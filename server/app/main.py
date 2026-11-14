"""대양ING 백엔드 API (FastAPI).

지금 하는 일: 홈페이지 상담 문의를 hyunwoo.kim@daeyanging.com 으로 메일 발송.
- 사이트(Next.js 서버 액션)만 부른다. iwinv 의 전용 내부 네트워크(daeyanging-internal)에만 붙어 있어
  인터넷과 서버의 다른 컨테이너에서는 닿지 않고, 그래도 공유 토큰(X-Api-Key)을 한 번 더 확인한다.
- 환경변수(서버 /home/ubuntu/web/daeyanging-api/prod.env, 이미지·저장소에는 없음):
    API_TOKEN   사이트와 나눠 쓰는 토큰(필수)
    SMTP_PASS   Zoho 앱 비밀번호(필수)
    SMTP_USER   보내는 계정(기본 hyunwoo.kim@daeyanging.com)
    SMTP_HOST   기본 smtppro.zoho.com · SMTP_PORT 기본 465(SSL)
    MAIL_TO     문의를 받을 주소(쉼표로 여러 개, 기본 SMTP_USER)
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

from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field, field_validator

log = logging.getLogger("daeyanging.api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

SMTP_USER = os.environ.get("SMTP_USER", "hyunwoo.kim@daeyanging.com")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtppro.zoho.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
MAIL_TO = [a.strip() for a in os.environ.get("MAIL_TO", SMTP_USER).split(",") if a.strip()]
SENDER_NAME = "대양ING 홈페이지"

EMAIL_RE = re.compile(r"^[^\s@<>()\",;:]+@[^\s@<>()\",;:]+\.[^\s@<>()\",;:]{2,}$")
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]+")

app = FastAPI(title="daeyanging-api", docs_url=None, redoc_url=None, openapi_url=None)


def one_line(v: str) -> str:
    """메일 머리글에 들어갈 값: 줄바꿈·제어 문자를 공백으로."""
    return CONTROL_RE.sub(" ", v).strip()


class Inquiry(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=80)]
    email: Annotated[str, Field(min_length=3, max_length=200)]
    message: Annotated[str, Field(min_length=1, max_length=5000)]
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
    msg["Subject"] = f"[홈페이지 문의] {q.name}"
    msg["From"] = formataddr((SENDER_NAME, SMTP_USER))
    msg["To"] = ", ".join(MAIL_TO)
    user, _, domain = q.email.partition("@")
    msg["Reply-To"] = Address(display_name=q.name, username=user, domain=domain)
    msg["Message-ID"] = make_msgid(domain=SMTP_USER.partition("@")[2] or None)
    text = f"성함 / 회사명: {q.name}\n이메일: {q.email}\n\n{q.message}\n"
    html = (
        f"<p><b>성함 / 회사명</b>: {escape(q.name)}<br><b>이메일</b>: {escape(q.email)}</p>"
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
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "mail failed") from None
    log.info("inquiry mail sent (ip=%s)", q.client_ip)
    return {"ok": True}
