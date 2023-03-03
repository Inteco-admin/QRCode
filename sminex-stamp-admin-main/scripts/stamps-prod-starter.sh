#!/bin/bash

docker_runner() {
    docker run \
        -e APS_CLIENT_ID=$APS_CLIENT_ID \
        -e APS_CLIENT_SECRET=$APS_CLIENT_SECRET \
        -e DB_HOST=$DB_HOST \
        -e DB_NAME=$DB_NAME \
        -e DB_PASSWORD=$DB_PASSWORD \
        -e DB_PORT=$DB_PORT \
        -e DB_USER=$DB_USER \
        -e SECRET_KEY=$SECRET_KEY \
        -e DJANGO_SUPERUSER_PASSWORD=$DJANGO_SUPERUSER_PASSWORD \
        -e WEBHOOK_HOST=$WEBHOOK_HOST \
        -v /opt/volumes/django/media:/app/media/ \
        -v /opt/volumes/django/static:/app/static/ \
        --detach --net host --name django gitlab.sminex.com:5050/web-bim/sminex-stamp-admin
}

if [ "$(docker ps -aq -f name=django)" ]; then
    docker rm -f django
    docker_runner

else
    docker_runner
fi

docker exec -i django python manage.py migrate
