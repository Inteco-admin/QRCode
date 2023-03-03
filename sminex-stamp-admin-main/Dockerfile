# Pull base image
FROM python:3.10.9-slim-bullseye
# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Set work directory
WORKDIR /app
# Install dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
# Copy project
COPY . .

RUN mkdir -p static && mkdir -p media
# Run server

CMD python /app/manage.py collectstatic ; gunicorn stamps.wsgi:application --bind 0.0.0.0:8000
