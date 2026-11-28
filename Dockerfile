# syntax=docker/dockerfile:1
# Đóng gói production: build frontend (React + Vite) rồi chạy backend Python (chỉ thư viện chuẩn) phục vụ cả UI + API.
#   docker build -t ta-tro-ly .
#   docker run -p 8000:8000 -e APP_PASSWORD=... -e MODEL_PROVIDER=gemini -e MODEL_NAME=... -e API_KEY=... ta-tro-ly
# Railway / Render: tự đọc Dockerfile, cấp $PORT; điền biến môi trường theo .env.example trên dashboard.

# ---------- Stage 1: build frontend ----------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: backend Python ----------
FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8000 \
    WEB_RUNTIME_DIR=/app/data/runtime
WORKDIR /app

# Khung chỉ dùng thư viện chuẩn; requirements.txt hiện không có gói nào (giữ bước này cho khi nhóm thêm SDK).
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Chỉ chép thứ server cần lúc chạy: mã backend + 2 file dữ liệu đã tổng hợp (không chép data BTC gốc, eval, evidence…).
COPY codebase/ ./codebase/
COPY data/open_answers.json data/class_stats.json ./data/
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Chạy bằng user thường. Dữ liệu import + bản nháp (SQLite) ở /app/data/runtime — gắn volume vào đây để không mất khi redeploy.
RUN useradd --create-home --uid 10001 app \
 && mkdir -p /app/data/runtime \
 && chown -R app:app /app/data/runtime
USER app

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/api/health' % os.environ.get('PORT','8000'), timeout=4)" || exit 1

CMD ["python", "codebase/web.py"]
