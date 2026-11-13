# syntax=docker/dockerfile:1.7
# Next.js standalone 이미지 — iwinv VPS 배포용(서버: /home/ubuntu/web/daeyanging · 공용 edge-caddy 뒤).
# 로컬 확인:
#   docker build --secret id=dotenv,src=.env.production -t web-local . && docker run --rm -p 3000:3000 web-local
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 빌드 때 필요한 환경변수(NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 등)는 BuildKit 시크릿으로 받아 같은 RUN 안에서 지운다 — 이미지 층에 남지 않는다.
RUN --mount=type=secret,id=dotenv,required=false \
    if [ -s /run/secrets/dotenv ]; then cp /run/secrets/dotenv .env.production.local; fi \
 && npm run build \
 && rm -f .env.production.local .next/standalone/.env*

FROM node:${NODE_VERSION}-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
