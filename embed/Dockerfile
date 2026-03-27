FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model at build time
RUN python -c "from model2vec import StaticModel; StaticModel.from_pretrained('minishlab/potion-multilingual-128M')"

COPY main.py .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
