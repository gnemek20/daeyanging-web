"""대시보드용 저장소(SQLite) — 방문 기록, 문의 기록, 대시보드 로그인 인증번호.

- 파일: DB_PATH(기본 /data/daeyanging.db). 서버에서는 /home/ubuntu/web/daeyanging-api/data 를 /data 로 붙여
  컨테이너를 새로 띄워도 남는다.
- 방문자는 IP 를 그대로 남기지 않는다: IP·브라우저·날짜를 섞은 해시(vid)만 남겨 "그날의 방문자 수"만 센다.
- 문의는 메일과 같은 내용 중 목록에 필요한 것(시각·이름·이메일·처음 창업 여부·IP·메일 성공 여부)만 남긴다.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import threading
import time
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Iterator

DB_PATH = os.environ.get("DB_PATH", "/data/daeyanging.db")
KST = timezone(timedelta(hours=9))
_lock = threading.Lock()

SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY,
  ts INTEGER NOT NULL,          -- 유닉스 초
  day TEXT NOT NULL,            -- 한국 시간 YYYY-MM-DD
  path TEXT NOT NULL,
  ref TEXT NOT NULL DEFAULT '', -- 들어온 곳(호스트만)
  vid TEXT NOT NULL,            -- 그날의 방문자 해시
  device TEXT NOT NULL,
  browser TEXT NOT NULL,
  os TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pageviews_day ON pageviews(day);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY,
  ts INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  first_time INTEGER NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  mailed INTEGER NOT NULL       -- 메일 발송 성공 1 / 실패 0
);
CREATE TABLE IF NOT EXISTS otps (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at INTEGER NOT NULL
);
"""


@contextmanager
def db() -> Iterator[sqlite3.Connection]:
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def init() -> None:
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    with _lock, db() as con:
        con.executescript(SCHEMA)


# ───────── 방문 기록 ─────────

BOT_RE = re.compile(
    r"bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|httpx|go-http|java/|axios|node-fetch|scrapy|facebookexternalhit|yeti|daumoa|scrap",
    re.I,
)


def is_bot(ua: str) -> bool:
    return not ua or bool(BOT_RE.search(ua))


def parse_ua(ua: str) -> tuple[str, str, str]:
    """(기기, 브라우저, 운영체제) — 대시보드 분류용으로 대략만"""
    u = ua.lower()
    device = "태블릿" if ("ipad" in u or ("android" in u and "mobile" not in u)) else "휴대폰" if "mobi" in u or "iphone" in u else "컴퓨터"
    if "kakaotalk" in u:
        browser = "카카오톡"
    elif "naver" in u and "whale" not in u:
        browser = "네이버 앱"
    elif "whale" in u:
        browser = "웨일"
    elif "samsungbrowser" in u:
        browser = "삼성 인터넷"
    elif "edg/" in u:
        browser = "엣지"
    elif "firefox" in u or "fxios" in u:
        browser = "파이어폭스"
    elif "crios" in u or ("chrome" in u and "chromium" not in u):
        browser = "크롬"
    elif "safari" in u:
        browser = "사파리"
    else:
        browser = "기타"
    if "iphone" in u or "ipad" in u or "ios" in u:
        os_ = "iOS"
    elif "android" in u:
        os_ = "안드로이드"
    elif "windows" in u:
        os_ = "윈도우"
    elif "mac os" in u or "macintosh" in u:
        os_ = "macOS"
    elif "linux" in u:
        os_ = "리눅스"
    else:
        os_ = "기타"
    return device, browser, os_


def visitor_id(ip: str, ua: str, day: str) -> str:
    # 날마다 바뀌는 해시: 같은 날 같은 사람만 하나로 묶이고, 날이 바뀌면 이어 붙일 수 없다
    key = (os.environ.get("API_TOKEN", "") + day).encode()
    return hmac.new(key, f"{ip}|{ua}".encode(), hashlib.sha256).hexdigest()[:16]


def add_pageview(path: str, ref: str, ip: str, ua: str) -> None:
    now = int(time.time())
    day = datetime.fromtimestamp(now, KST).strftime("%Y-%m-%d")
    device, browser, os_ = parse_ua(ua)
    with _lock, db() as con:
        con.execute(
            "INSERT INTO pageviews(ts, day, path, ref, vid, device, browser, os) VALUES (?,?,?,?,?,?,?,?)",
            (now, day, path, ref, visitor_id(ip, ua, day), device, browser, os_),
        )


# ───────── 문의 기록 ─────────


def add_inquiry(name: str, email: str, first_time: bool, ip: str, mailed: bool) -> None:
    with _lock, db() as con:
        con.execute(
            "INSERT INTO inquiries(ts, name, email, first_time, ip, mailed) VALUES (?,?,?,?,?,?)",
            (int(time.time()), name, email, int(first_time), ip, int(mailed)),
        )


# ───────── 대시보드 로그인 인증번호 ─────────

OTP_TTL = 10 * 60  # 10분
OTP_RESEND = 60  # 같은 주소로 다시 보내려면 1분 뒤
OTP_MAX_TRY = 5


def _hash_code(email: str, code: str) -> str:
    key = os.environ.get("API_TOKEN", "").encode()
    return hmac.new(key, f"{email}|{code}".encode(), hashlib.sha256).hexdigest()


def new_otp(email: str) -> str | None:
    """새 인증번호를 만들어 저장하고 돌려준다. 1분 안에 다시 요청하면 None."""
    now = int(time.time())
    with _lock, db() as con:
        row = con.execute("SELECT sent_at FROM otps WHERE email=?", (email,)).fetchone()
        if row and now - row["sent_at"] < OTP_RESEND:
            return None
        code = f"{secrets.randbelow(1_000_000):06d}"
        con.execute(
            "INSERT OR REPLACE INTO otps(email, code_hash, expires, attempts, sent_at) VALUES (?,?,?,0,?)",
            (email, _hash_code(email, code), now + OTP_TTL, now),
        )
        return code


def check_otp(email: str, code: str) -> bool:
    now = int(time.time())
    with _lock, db() as con:
        row = con.execute("SELECT code_hash, expires, attempts FROM otps WHERE email=?", (email,)).fetchone()
        if not row or row["expires"] < now or row["attempts"] >= OTP_MAX_TRY:
            return False
        if hmac.compare_digest(row["code_hash"], _hash_code(email, code)):
            con.execute("DELETE FROM otps WHERE email=?", (email,))  # 한 번 쓰면 끝
            return True
        con.execute("UPDATE otps SET attempts = attempts + 1 WHERE email=?", (email,))
        return False


# ───────── 대시보드 집계 ─────────


def stats(days: int) -> dict:
    today = datetime.now(KST).date()
    start = today - timedelta(days=days - 1)
    s = start.isoformat()
    since_ts = int(datetime.combine(start, datetime.min.time(), KST).timestamp())
    with db() as con:
        q = lambda sql, *a: [dict(r) for r in con.execute(sql, a).fetchall()]  # noqa: E731
        daily = {r["day"]: r for r in q(
            "SELECT day, COUNT(*) AS views, COUNT(DISTINCT vid) AS visitors FROM pageviews WHERE day>=? GROUP BY day", s
        )}
        inq_daily = {r["day"]: r["n"] for r in q(
            "SELECT strftime('%Y-%m-%d', ts, 'unixepoch', '+9 hours') AS day, COUNT(*) AS n FROM inquiries WHERE ts>=? GROUP BY day",
            since_ts,
        )}
        series = []
        for i in range(days):
            d = (start + timedelta(days=i)).isoformat()
            r = daily.get(d, {})
            series.append({"day": d, "views": r.get("views", 0), "visitors": r.get("visitors", 0), "inquiries": inq_daily.get(d, 0)})
        top = lambda col, n=8: q(  # noqa: E731
            f"SELECT {col} AS k, COUNT(*) AS views, COUNT(DISTINCT vid) AS visitors FROM pageviews WHERE day>=? GROUP BY {col} ORDER BY views DESC LIMIT {n}",
            s,
        )
        totals = q(
            "SELECT COUNT(*) AS views, COUNT(DISTINCT vid || day) AS visitors FROM pageviews WHERE day>=?", s
        )[0]
        inquiries = q(
            "SELECT ts, name, email, first_time, ip, mailed FROM inquiries WHERE ts>=? ORDER BY ts DESC LIMIT 100", since_ts
        )
        first_seen = con.execute("SELECT MIN(ts) FROM pageviews").fetchone()[0]
        groups = {
            "pages": top("path", 10),
            "referrers": top("ref", 10),
            "devices": top("device", 5),
            "browsers": top("browser", 8),
            "oses": top("os", 6),
        }
    return {
        "days": days,
        "since": s,
        "collecting_since": first_seen,
        "totals": {**totals, "inquiries": len(inquiries), "first_time": sum(i["first_time"] for i in inquiries)},
        "series": series,
        **groups,
        "inquiries": inquiries,
    }
