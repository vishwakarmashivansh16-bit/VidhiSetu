FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project metadata first so pip can install entry points
COPY pyproject.toml .
COPY requirements.txt .
COPY legal_env.py .
COPY app.py .
COPY inference.py .
COPY openenv.yaml .
COPY data/legalDb.json ./data/

# Install package with entry points (start-api, run-inference)
RUN pip install --no-cache-dir -e .

RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
