FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY openenv/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY openenv/legal_env.py .
COPY openenv/app.py .
COPY openenv/inference.py .
COPY openenv/openenv.yaml .
COPY data/legalDb.json ./data/

RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
