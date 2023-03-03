#!/bin/bash

docker_runner() {
    docker run \
        -e APS_CLIENT_ID=$APS_CLIENT_ID \
        -e APS_CLIENT_SECRET=$APS_CLIENT_SECRET \
        -e DB_HOST=$DB_HOST \
        -e DB_NAME=$TEST_DB_NAME \
        -e DB_PASSWORD=$TEST_DB_PASSWORD \
        -e DB_PORT=$TEST_DB_PORT \
        -e DB_USER=$TEST_DB_USER \
        -e SECRET_KEY=$SECRET_KEY \
        -e DJANGO_SUPERUSER_PASSWORD=$TEST_DJANGO_SUPERUSER_PASSWORD \
        -e WEBHOOK_HOST=$TEST_WEBHOOK_HOST \
        -v /opt/volumes/django/media:/app/media/ \
        -v /opt/volumes/django/static:/app/static/ \
        --detach -p 8888:8000 --name django-test gitlab.sminex.com:5050/web-bim/sminex-stamp-admin:tst
}


if [ "$(docker ps -aq -f name=django-test)" ]; then
        docker rm -f django-test
        docker_runner
else
    docker_runner
fi

docker exec -i django-test python manage.py migrate