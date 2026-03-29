FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer cache)
RUN pip install --no-cache-dir "pydantic>=2.0.0" "openai>=1.14.0" "fastapi>=0.110.0" "uvicorn>=0.29.0" "httpx>=0.27.0" "pyyaml>=6.0" "python-multipart>=0.0.9"

# Copy environment source
COPY legal_env.py .
COPY app.py .
COPY inference.py .
COPY openenv.yaml .

# Copy data
COPY data/ ./data/

# Non-root user for HF Spaces compatibility
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
