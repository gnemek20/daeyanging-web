# iwinv 무중단 배포(blue/green)

서버 iwinv(115.68.227.61)의 모든 웹·API 서비스가 같이 쓰는 배포 방식이다. 이 폴더는 서버 파일의 사본이다(서버가 원본).

| 서버 위치 | 이 폴더 | 하는 일 |
|---|---|---|
| `/opt/webdeploy/gate` | `gate` | GitHub Actions 배포 키의 강제 명령. 이미지를 받아 태그를 붙이고 `switch` 를 부른다 |
| `/opt/webdeploy/switch` | `switch` | 무중단 교체. 아래 순서 |
| `/home/ubuntu/web/<서비스>/docker-compose.yml` | `gen_compose.py` 로 만든다 | 환경마다 `<env>-blue` / `<env>-green` 두 자리 |
| `/usr/local/bin/bg-migrate`, `bg-watch` | 같은 이름 | 손으로 교체하며 바깥 응답을 0.2초마다 확인 |

API 서비스(daeyanging-api, dictector-api)는 각자 폴더의 `gate` 가 이미지를 받고, 교체는 같은 `switch` 로 넘긴다.

## switch 순서

1. 비어 있는 자리(blue/green)에 새 태그로 띄운다. 지금 돌고 있는 컨테이너는 건드리지 않는다.
2. 헬스 확인 — 이미지에 HEALTHCHECK 가 있으면 healthy, 없으면 컨테이너 안에서 `http://127.0.0.1:3000/` 응답.
   실패하거나 재시작하면 새 것만 멈추고 끝(서비스는 그대로, 태그 기록도 되돌림).
3. `/opt/edge/sites/*.caddy` 에서 `web-<서비스>-<env>[-blue|-green]:<포트>` 를 새 컨테이너 이름으로 바꾸고
   `caddy reload` — 진행 중인 요청은 옛 설정으로 끝까지 처리된다. 설정이 틀리면 파일을 되돌리고 중단.
4. 5초 뒤부터 옛 컨테이너에 들어온 연결(ESTABLISHED)을 세어 두 번 연속 0 이면 멈춘다(최대 `DRAIN_MAX` 초, 기본 120).
   지우지 않고 멈춰 두므로 되돌리기가 빠르다.

두 자리는 네트워크 별칭 `web-<서비스>-<env>` 를 같이 가진다. 안쪽에서 그 이름으로 부르는 쪽
(예: 사이트 → `web-daeyanging-api-prod:8000`)은 바뀌는 것이 없다.

## 자주 쓰는 명령(서버)

```bash
# 되돌리기 / 특정 태그로 교체 — 무중단
sudo -u ubuntu /opt/webdeploy/switch <서비스> <prod|dev> <태그>
docker images web-<서비스>                 # 태그 목록
# 바깥 응답을 지켜보며 교체(실패 응답 수를 알려 줌)
bg-migrate <서비스> <prod|dev> https://<주소>/ [태그]
cat /home/ubuntu/web/<서비스>/.env         # <ENV>_COLOR, <ENV>_TAG_BLUE/GREEN, DRAIN_MAX
```

## 대상이 아닌 것

- `whatsin-api`(/home/ubuntu/whatsin), `danggok-challenge`(/home/ubuntu/danggok): 서버에서 소스로 직접 빌드하는 별도 방식
- `kotama-*`(디스코드 봇): 두 개를 동시에 띄우면 봇이 두 번 응답하므로 blue/green 이 맞지 않는다
