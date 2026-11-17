"""서비스별 blue/green compose 파일을 만든다(서버 /home/ubuntu/web/<서비스>/docker-compose.yml 로 올린다)."""
import os, sys

OUT = sys.argv[1]

HEAD = """# {title} — 배포: GitHub Actions → {gate}
# 무중단 교체(blue/green, /opt/webdeploy/switch): 환경마다 자리가 둘(<env>-blue / <env>-green)이고 한 번에 하나만 돈다.
#   둘 다 네트워크 별칭 web-{svc}-<env> 를 가진다 — 안쪽에서 그 이름으로 부르는 쪽은 바뀌는 것이 없다.
#   바깥(Caddy)은 switch 가 /opt/edge/sites 의 주소를 지금 자리 컨테이너 이름으로 바꾼다.
# 태그와 지금 자리는 같은 폴더 .env(<ENV>_TAG_BLUE / <ENV>_TAG_GREEN / <ENV>_COLOR), 실행 비밀값은 <env>.env(chmod 600 · 저장소에 없음).
# 되돌리기: /opt/webdeploy/switch {svc} <env> <옛 태그>   · 태그 목록: docker images web-{svc}
"""


def pair(svc, env, base_anchor, networks, extra=""):
    """<env>-blue / <env>-green 두 서비스"""
    out = ""
    E = env.upper()
    for color in ("blue", "green"):
        out += f"  {env}-{color}:\n"
        out += f"    <<: *{base_anchor}\n"
        out += f"    image: web-{svc}:${{{E}_TAG_{color.upper()}:-not-deployed}}\n"
        out += f"    container_name: web-{svc}-{env}-{color}\n"
        out += f"    env_file: ./{env}.env\n"
        out += extra
        out += "    networks:\n"
        for n in networks(env):
            out += f"      {n}: {{ aliases: [web-{svc}-{env}] }}\n"
    return out


def web_simple(svc, title, envs=("prod",), nets=("edge",)):
    s = HEAD.format(title=title, gate=f"/opt/webdeploy/gate {svc}", svc=svc)
    s += f"name: web-{svc}\n"
    s += "x-web: &web\n  mem_limit: 512m\n  restart: unless-stopped\n  expose: [\"3000\"]\n"
    s += "services:\n"
    for env in envs:
        s += pair(svc, env, "web", lambda e: nets)
    s += "networks:\n"
    for n in nets:
        s += f"  {n}:\n    external: true\n"
    return s


files = {
    "hyunwoo": web_simple("hyunwoo", "hyunwoo 웹(Next.js standalone 이미지)"),
    "maple": web_simple("maple", "maple 웹(Next.js standalone 이미지)"),
    "moodcella": web_simple("moodcella", "moodcella 웹(Next.js standalone 이미지)"),
    "whatsin": web_simple("whatsin", "whatsin 웹(Next.js standalone 이미지)"),
    "dictector": web_simple("dictector", "dictector 웹(Next.js standalone 이미지)", envs=("prod", "dev")),
    "daeyanging": web_simple(
        "daeyanging",
        "daeyanging.com 웹(Next.js standalone 이미지, 공용 edge-caddy 뒤) — daeyanging-net 은 백엔드 API 와만 나누는 내부 네트워크",
        nets=("edge", "daeyanging-net"),
    ),
}

# 대양ING 백엔드 API — 인터넷 길 없음(daeyanging-net 에서 web-daeyanging-api-prod 로만 부른다)
s = HEAD.format(
    title="대양ING 백엔드 API(FastAPI, 저장소 server/) — 메일 발송 + 대시보드 데이터(./data → /data, SQLite)",
    gate="/home/ubuntu/web/daeyanging-api/gate",
    svc="daeyanging-api",
)
s += """name: web-daeyanging-api
x-api: &api
  restart: unless-stopped
  mem_limit: 256m
  expose: ["8000"]
  volumes:
    - ./data:/data          # 방문·문의 기록, 대시보드 인증번호(daeyanging.db) — 두 자리가 같은 파일을 쓴다(WAL)
  healthcheck:
    test: ["CMD", "python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health',timeout=4).status==200 else 1)"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 20s
    start_interval: 2s
services:
"""
s += pair("daeyanging-api", "prod", "api", lambda e: ("daeyanging-net",))
s += "networks:\n  daeyanging-net:\n    external: true\n"
files["daeyanging-api"] = s

# dictector API — 환경마다 bgutil 이 따로 있고, 그 환경 전용 네트워크에서 bgutil-provider 로 부른다
s = HEAD.format(
    title="dictector 백엔드 API(FastAPI 이미지) — bgutil PO 토큰 제공자는 환경마다 따로",
    gate="/home/ubuntu/web/dictector-api/gate",
    svc="dictector-api",
)
s += """name: web-dictector-api
x-api: &api
  restart: unless-stopped
  mem_limit: 2g
  expose: ["8080"]
  healthcheck:
    test: ["CMD", "curl", "-fsS", "http://127.0.0.1:8080/health"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 90s
    start_interval: 3s
x-bgutil: &bgutil
  image: brainicism/bgutil-ytdlp-pot-provider:latest
  restart: unless-stopped
  mem_limit: 256m
services:
"""
s += pair("dictector-api", "prod", "api", lambda e: ("edge", "prod-net"))
s += pair("dictector-api", "dev", "api", lambda e: ("edge", "dev-net"))
s += """  bgutil-prod:
    <<: *bgutil
    container_name: web-dictector-api-prod-bgutil
    networks:
      prod-net: { aliases: [bgutil-provider] }
  bgutil-dev:
    <<: *bgutil
    container_name: web-dictector-api-dev-bgutil
    networks:
      dev-net: { aliases: [bgutil-provider] }
networks:
  edge:
    external: true
  prod-net: {}
  dev-net: {}
"""
files["dictector-api"] = s

for name, text in files.items():
    os.makedirs(os.path.join(OUT, name), exist_ok=True)
    open(os.path.join(OUT, name, "docker-compose.yml"), "w", encoding="utf-8", newline="\n").write(text)
print("\n".join(files))
