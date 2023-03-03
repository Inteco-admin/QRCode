## Stamp server repo

# Запуск проекта в девелопменте:

```
docker compose up -d --build
```

Адрес запущенной админ-панели: http://localhost:8000/admin

Применить миграции:

```
docker compose exec web python manage.py migrate
```

Создать суперпользователя:

```
docker compose exec web python manage.py createsuperuser
```

Создать миграции:

```
docker compose exec web python manage.py makemigrations
```

### Для запуска без Postgres:

```
docker compose up -d --no-deps --build web
```

В этом случае необходимо задать переменную DB_HOST в значение `host.docker.internal` для подключения к базе данных по localhost.

# Запуск проекта в продакшене:

```
docker build -t *django-image-name*:latest .
docker run -d --name *django-container-name* --env-file .env -p 8000:8000 *django-image-name*
```

Адрес запущенной админ-панели: http://localhost:8000/admin

Применить миграции:

```
docker exec -it *django-container-name* python manage.py migrate
```

Создать суперпользователя:

```
docker exec -it *django-container-name* python manage.py createsuperuser
```

Создать миграции:

```
docker exec -it *django-container-name* python manage.py makemigrations
```

# Пример .env файла:

```
APS_CLIENT_ID=xxx
APS_CLIENT_SECRET=xxx
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="stamps_db"
DB_PORT="5432"
SECRET_KEY="django-insecure-4ier#Em+)wtqv#Eu_^UL%&x<AqT3b6/F483]wcL.m0_oxnH+]c:"
```
