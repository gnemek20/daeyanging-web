# 대양ING 백엔드 API(FastAPI) — iwinv 배포용(서버: /home/ubuntu/web/daeyanging-api · 강제 명령 ./gate)
# 로컬 확인: docker build -t daeyanging-api server && docker run --rm -p 8000:8000 -e API_TOKEN=dev daeyanging-api
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app ./app
RUN useradd --system --uid 10001 api
USER api
EXPOSE 8000
# compose 의 healthcheck 가 /health 를 찌른다(이미지에 curl 이 없어 파이썬으로)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health',timeout=4).status==200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-server-header", "--log-level", "info"]
