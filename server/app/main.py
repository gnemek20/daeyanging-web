"""대양ING 백엔드 API (FastAPI).

지금 하는 일
- 홈페이지 상담 문의를 hyunwoo.kim@daeyanging.com 으로 메일 발송(첨부 파일 포함, + 대시보드용 문의 기록)
  보낸 분께는 같은 계정으로 접수 확인 메일(자동 발송, 보낸 분이 적은 글은 싣지 않음)
- 문의 기록(내용·첨부 포함) 조회와 처리 표시(/inquiries, /inquiries/{id}…) — 대시보드가 쓴다
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
    BREVO_SMTP_LOGIN / BREVO_SMTP_KEY  바깥으로 가는 자동 메일(접수 확인 · 대시보드 인증번호)을 보낼 Brevo SMTP.
                없거나 실패하면 Zoho 로 보낸다. (Brevo 에 daeyanging.com 도메인 인증 완료)
    MAIL_DUMP_DIR  (로컬 확인용) 있으면 메일을 보내지 않고 이 폴더에 .eml 로 저장한다
"""

from __future__ import annotations

import logging
import mimetypes
import os
import re
import secrets
import smtplib
import ssl
import time
from contextlib import contextmanager
from datetime import datetime
from email.headerregistry import Address
from email.message import EmailMessage
from email.utils import format_datetime, formataddr, make_msgid
from html import escape
from pathlib import Path
from typing import Annotated, Iterator, Protocol
from zoneinfo import ZoneInfo

from fastapi import FastAPI, File, Form, Header, HTTPException, Path as PathParam, Query, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, ValidationError, field_validator

from . import store

log = logging.getLogger("daeyanging.api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

SMTP_USER = os.environ.get("SMTP_USER", "hyunwoo.kim@daeyanging.com")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtppro.zoho.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
MAIL_TO = [a.strip() for a in os.environ.get("MAIL_TO", SMTP_USER).split(",") if a.strip()]
MAIL_DUMP_DIR = os.environ.get("MAIL_DUMP_DIR", "")
# 바깥으로 가는 자동 메일(접수 확인 · 대시보드 인증번호)은 Brevo SMTP 로. 키가 없으면 Zoho 로 보낸다.
BREVO_SMTP_HOST = os.environ.get("BREVO_SMTP_HOST", "smtp-relay.brevo.com")
BREVO_SMTP_PORT = int(os.environ.get("BREVO_SMTP_PORT", "587"))
BREVO_SMTP_LOGIN = os.environ.get("BREVO_SMTP_LOGIN", "")
BREVO_SMTP_KEY = os.environ.get("BREVO_SMTP_KEY", "")
SENDER_NAME = "대양ING 홈페이지"
COMPANY_NAME = "대양ING"
SITE_URL = "https://daeyanging.com"
SITE_ADDRESS = "서울특별시 종로구 김상옥로 59, 한아빌딩 3층"
KST = ZoneInfo("Asia/Seoul")

EMAIL_RE = re.compile(r"^[^\s@<>()\",;:]+@[^\s@<>()\",;:]+\.[^\s@<>()\",;:]{2,}$")
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]+")

# 첨부: 사이트(lib/inquiryForm.ts)와 같은 기준 — 모든 이미지 형식 + PDF, 10개, 합계 15MB
FILES_MAX = 10
FILES_MAX_TOTAL = 15 * 1024 * 1024
FILE_EXT = {
    "jpg", "jpeg", "jfif", "png", "gif", "webp", "avif", "heic", "heif", "bmp", "tif", "tiff", "svg", "ico",
    "psd", "ai", "eps", "raw", "cr2", "nef", "arw", "dng", "pdf",
}  # fmt: skip

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


# ───────── 메일 ─────────

Attachment = tuple[str, str, bytes]  # 파일 이름, 형식(type/subtype), 내용


def ref_no(inquiry_id: int) -> str:
    """접수 번호: DY-YYMMDD-0012 (한국 날짜 + 기록 번호)."""
    day = f"{datetime.now(KST):%y%m%d}"
    return f"DY-{day}-{inquiry_id:04d}" if inquiry_id else f"DY-{day}"


def mid() -> str:
    return make_msgid(domain=SMTP_USER.partition("@")[2] or None)


def set_body(msg: EmailMessage, text: str, html: str | None = None) -> None:
    """본문: 메일 프로그램처럼 quoted-printable 로(파이썬 기본 base64 는 스팸 필터의 감점 요인),
    안쪽 부분에 남는 MIME-Version 머리글은 지운다(스크립트가 보낸 티)."""
    msg.set_content(text, cte="quoted-printable")
    if html is not None:
        msg.add_alternative(html, subtype="html", cte="quoted-printable")
    tidy(msg)


def tidy(msg: EmailMessage) -> None:
    for part in msg.walk():
        if part is not msg:
            del part["MIME-Version"]


def new_message() -> EmailMessage:
    """모든 메일의 공통 머리글. Date 가 없으면 스팸 필터가 의심하므로 직접 붙인다(한국 시간)."""
    msg = EmailMessage()
    msg["Date"] = format_datetime(datetime.now(KST))
    msg["Message-ID"] = mid()
    return msg


def build_message(q: Inquiry, ref: str = "", mode: str = "", files: list[Attachment] | None = None) -> EmailMessage:
    files = files or []
    msg = new_message()
    msg["Subject"] = f"{'[첫 창업 문의]' if q.first_time else '[홈페이지 문의]'} {q.name}" + (f" · {ref}" if ref else "")
    msg["From"] = formataddr((SENDER_NAME, SMTP_USER))
    msg["To"] = ", ".join(MAIL_TO)
    user, _, domain = q.email.partition("@")
    msg["Reply-To"] = Address(display_name=q.name, username=user, domain=domain)
    meta = [("성함 / 회사명", q.name), ("이메일", q.email)]
    if ref:
        meta.append(("접수 번호", ref))
    if mode:
        meta.append(("작성 방식", "양식으로 작성" if mode == "form" else "자유롭게 작성"))
    if q.first_time:
        meta.append(("구분", "의류 창업이 처음인 분"))
    if files:
        meta.append(("첨부", f"{len(files)}개 — " + ", ".join(n for n, _, _ in files)))
    text = "\n".join(f"{k}: {v}" for k, v in meta) + f"\n\n{q.message}\n"
    html = (
        "<p>" + "<br>".join(f"<b>{escape(k)}</b>: {escape(v)}" for k, v in meta) + "</p>"
        f'<hr><p style="white-space:pre-wrap">{escape(q.message)}</p>'
    )
    set_body(msg, text, html)
    for name, ctype, data in files:
        maintype, _, subtype = ctype.partition("/")
        msg.add_attachment(data, maintype=maintype or "application", subtype=subtype or "octet-stream", filename=name)
    tidy(msg)
    return msg


def build_receipt(to: str, ref: str) -> EmailMessage:
    """보낸 분께 가는 접수 확인 메일.

    보낸 분이 적은 글(이름 포함)은 싣지 않는다 — 아무 주소나 적어 넣어 우리 계정으로 남에게 광고를 보내는 데 쓰이지 않게.
    스팸으로 분류되지 않도록 사람이 직접 쓴 메일과 같은 모양으로 둔다: 꾸밈 없는 HTML(문단만), 링크 없음,
    자동 발송 머리글(Auto-Submitted 등) 없음.
    """
    now = datetime.now(KST)
    when = f"{now.year}년 {now.month}월 {now.day}일 {now:%H:%M}"
    msg = new_message()
    msg["Subject"] = f"[{COMPANY_NAME}] 문의가 접수되었습니다"
    msg["From"] = formataddr((COMPANY_NAME, SMTP_USER))
    msg["To"] = to
    paras = [
        [f"안녕하세요, {COMPANY_NAME}입니다."],
        ["홈페이지로 보내 주신 문의가 정상적으로 접수되었습니다.", "담당자가 내용을 빠르게 확인한 뒤, 이 메일 주소로 답변드리겠습니다."],
        [f"접수 번호: {ref}", f"접수 일시: {when}"],
        ["※ 이 메일은 문의 접수를 알려 드리기 위해 자동으로 발송되었습니다."],
        [COMPANY_NAME, SITE_ADDRESS, SITE_URL.removeprefix("https://")],
    ]
    text = "\n\n".join("\n".join(p) for p in paras) + "\n"
    html = (
        '<div style="font-size:14px;line-height:1.7">'
        + "".join("<p>" + "<br>".join(escape(line) for line in p) + "</p>" for p in paras)
        + "</div>"
    )
    set_body(msg, text, html)
    return msg


class Sender(Protocol):
    def send_message(self, msg: EmailMessage) -> object: ...


class _Dump:
    """로컬 확인용: 보내는 대신 .eml 파일로 저장(MAIL_DUMP_DIR)."""

    def __init__(self, folder: Path) -> None:
        folder.mkdir(parents=True, exist_ok=True)
        self.folder = folder

    def send_message(self, msg: EmailMessage) -> None:
        path = self.folder / f"{time.strftime('%Y%m%d-%H%M%S')}-{secrets.token_hex(3)}.eml"
        path.write_bytes(msg.as_bytes())
        log.info("mail saved to %s (to=%s)", path, msg["To"])


@contextmanager
def mailer() -> Iterator[Sender]:
    """SMTP 연결 하나로 여러 통을 보낸다."""
    if MAIL_DUMP_DIR:
        yield _Dump(Path(MAIL_DUMP_DIR))
        return
    password = os.environ.get("SMTP_PASS")
    if not password:
        raise RuntimeError("SMTP_PASS is not set")
    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        s: smtplib.SMTP = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=60)
    else:
        s = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=60)
        s.starttls(context=ctx)
    with s:
        s.login(SMTP_USER, password)
        yield s


def send(msg: EmailMessage) -> None:
    with mailer() as s:
        s.send_message(msg)


def send_auto(msg: EmailMessage, what: str) -> None:
    """바깥 주소로 가는 자동 메일(접수 확인 · 대시보드 인증번호): Brevo 로 보낸다.

    Zoho 메일함 SMTP 로 보내면 Gmail 이 스팸으로 분류해서, 자동 발송용 서버(Brevo, daeyanging.com 도메인 인증됨)를 쓴다.
    Brevo 가 실패하면(하루 한도 초과·키 문제 등) Zoho 로 다시 보낸다 — 스팸함에 갈 수는 있어도 안 가는 일은 없게.
    """
    if MAIL_DUMP_DIR or not BREVO_SMTP_KEY:
        send(msg)
        return
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP(BREVO_SMTP_HOST, BREVO_SMTP_PORT, timeout=30) as s:
            s.starttls(context=ctx)
            s.login(BREVO_SMTP_LOGIN, BREVO_SMTP_KEY)
            s.send_message(msg)
        log.info("%s mail sent via brevo", what)
    except Exception as err:  # noqa: BLE001
        log.warning("%s mail via brevo failed, falling back to zoho: %s: %s", what, type(err).__name__, err)
        send(msg)
        log.info("%s mail sent via zoho (fallback)", what)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ───────── 상담 문의 ─────────


def record_inquiry(q: Inquiry, mailed: bool, mode: str = "") -> int:
    # 기록이 실패해도 문의 메일 자체에는 영향을 주지 않는다
    try:
        return store.add_inquiry(q.name, q.email, q.first_time, q.client_ip or "", mailed, q.message, mode)
    except Exception as err:  # noqa: BLE001
        log.error("inquiry record failed: %s: %s", type(err).__name__, err)
        return 0


# 이전 사이트 배포(첨부 없는 JSON)와의 호환용. 새 폼은 /inquiries/v2 를 쓴다.
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


def clean_filename(name: str) -> str:
    name = CONTROL_RE.sub(" ", name).replace("/", "_").replace("\\", "_").strip()
    return name[-120:] or "file"


def file_allowed(name: str, ctype: str) -> bool:
    ext = name.lower().rsplit(".", 1)[-1] if "." in name else ""
    return ctype.startswith("image/") or ctype == "application/pdf" or ext in FILE_EXT


# 새 문의 폼: 작성 방식 + 첨부 파일(multipart/form-data).
# 문의 메일을 보낸 뒤 같은 연결로 보낸 분께 접수 확인 메일. 확인 메일이 실패해도 문의는 접수된 것으로 본다.
@app.post("/inquiries/v2", status_code=status.HTTP_202_ACCEPTED)
def create_inquiry_v2(
    name: Annotated[str, Form()],
    email: Annotated[str, Form()],
    message: Annotated[str, Form()],
    mode: Annotated[str, Form()] = "form",
    first_time: Annotated[str, Form()] = "0",
    client_ip: Annotated[str, Form()] = "",
    files: Annotated[list[UploadFile] | None, File()] = None,
    x_api_key: Annotated[str | None, Header()] = None,
) -> dict[str, object]:
    require_token(x_api_key)
    try:
        q = Inquiry(name=name, email=email, message=message, first_time=first_time == "1", client_ip=client_ip[:64] or None)
    except ValidationError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "invalid fields") from None
    mode = "free" if mode == "free" else "form"

    attachments: list[Attachment] = []
    total = 0
    for f in files or []:
        if not f.size:
            continue
        fname = clean_filename(f.filename or "file")
        ctype = (f.content_type or "").lower()
        if not file_allowed(fname, ctype):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "file type")
        data = f.file.read(FILES_MAX_TOTAL + 1 - total)
        total += len(data)
        if total > FILES_MAX_TOTAL or len(attachments) >= FILES_MAX:
            raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "files too large")
        if not ctype.count("/") or ctype == "application/octet-stream":
            ctype = mimetypes.guess_type(fname)[0] or "application/octet-stream"
        attachments.append((fname, ctype, data))

    # 메일보다 먼저 남긴다 — 메일이 실패해도 대시보드에서 내용과 첨부를 볼 수 있게
    inquiry_id = record_inquiry(q, mailed=False, mode=mode)
    ref = ref_no(inquiry_id)
    if inquiry_id:
        try:
            store.save_files(inquiry_id, ref, attachments)
        except Exception as err:  # noqa: BLE001
            log.error("inquiry files save failed (ref=%s): %s: %s", ref, type(err).__name__, err)
    try:
        send(build_message(q, ref, mode, attachments))
        log.info("inquiry mail sent (ip=%s, ref=%s, files=%d, %dKB)", q.client_ip, ref, len(attachments), total // 1024)
    except Exception as err:  # noqa: BLE001 — 원인은 로그에만 남기고 사이트에는 실패만 알린다
        log.error("inquiry mail failed (ip=%s, ref=%s): %s: %s", q.client_ip, ref, type(err).__name__, err)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "mail failed") from None
    # 접수 확인 메일: 실패해도 문의는 접수된 것으로 본다
    try:
        send_auto(build_receipt(q.email, ref), f"receipt {ref}")
    except Exception as err:  # noqa: BLE001
        log.error("receipt mail failed (ref=%s): %s: %s", ref, type(err).__name__, err)
    if inquiry_id:
        try:
            store.set_mailed(inquiry_id, True)
        except Exception as err:  # noqa: BLE001
            log.error("inquiry record update failed: %s: %s", type(err).__name__, err)
    return {"ok": True, "ref": ref}


# ───────── 대시보드: 문의 보기 ─────────


@app.get("/inquiries")
def list_inquiries(
    status_: Annotated[str, Query(alias="status", pattern="^(all|new|done)$")] = "all",
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
    offset: Annotated[int, Query(ge=0)] = 0,
    x_api_key: Annotated[str | None, Header()] = None,
) -> dict:
    require_token(x_api_key)
    return store.list_inquiries(status_, limit, offset)


@app.get("/inquiries/{inquiry_id}")
def get_inquiry(inquiry_id: Annotated[int, PathParam(ge=1)], x_api_key: Annotated[str | None, Header()] = None) -> dict:
    require_token(x_api_key)
    q = store.get_inquiry(inquiry_id)
    if not q:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "not found")
    return q


@app.get("/inquiries/{inquiry_id}/files/{n}")
def get_inquiry_file(
    inquiry_id: Annotated[int, PathParam(ge=1)],
    n: Annotated[int, PathParam(ge=0, le=FILES_MAX)],
    x_api_key: Annotated[str | None, Header()] = None,
) -> FileResponse:
    require_token(x_api_key)
    q = store.get_inquiry(inquiry_id)
    path = store.file_path(inquiry_id, n)
    if not q or n >= len(q["files"]) or not os.path.isfile(path):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "not found")
    meta = q["files"][n]
    return FileResponse(path, media_type=meta["type"] or "application/octet-stream", filename=meta["name"])


class Handled(BaseModel):
    handled: bool


@app.post("/inquiries/{inquiry_id}/handled")
def set_handled(
    inquiry_id: Annotated[int, PathParam(ge=1)], h: Handled, x_api_key: Annotated[str | None, Header()] = None
) -> dict[str, bool]:
    require_token(x_api_key)
    if not store.set_handled(inquiry_id, h.handled):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "not found")
    return {"ok": True}


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
    msg = new_message()
    msg["Subject"] = f"[대양ING 대시보드] 인증번호 {code}"
    msg["From"] = formataddr((SENDER_NAME, SMTP_USER))
    msg["To"] = email
    set_body(
        msg,
        f"대양ING 대시보드 로그인 인증번호: {code}\n\n"
        "10분 동안 쓸 수 있습니다. 직접 요청하지 않았다면 이 메일은 무시하세요.\n"
    )
    try:
        send_auto(msg, "dashboard code")
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
