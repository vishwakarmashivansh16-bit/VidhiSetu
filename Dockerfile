FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "pydantic>=2.0.0" "openai>=1.14.0" "fastapi>=0.110.0" "uvicorn>=0.29.0" "httpx>=0.27.0" "pyyaml>=6.0" "python-multipart>=0.0.9"

COPY legal_env.py .
COPY app.py .
COPY inference.py .
COPY openenv.yaml .
COPY data/legalDb.json ./data/

RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
