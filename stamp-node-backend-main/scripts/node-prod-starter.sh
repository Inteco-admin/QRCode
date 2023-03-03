#!/bin/bash

docker_runner() {
    docker run \
        -e ADMIN_BASE_URL=$ADMIN_BASE_URL \
        -e EMAILS=$EMAILS \
        -e SMTP_HOST=$SMTP_HOST \
        -e SMTP_PORT=$SMTP_PORT \
        -e SMTP_USER=$SMTP_USER \
        -e SMTP_PASS=$SMTP_PASS \
        -e CLIENT_ID=$CLIENT_ID \
        -e CLIENT_SECRET=$CLIENT_SECRET \
        -e HOSTNAME=$HOSTNAME \
        --detach -p 3002:3002 --name node gitlab.sminex.com:5050/web-bim/stamp-node-backend
}

if [ "$(docker ps -aq -f name=node)" ]; then
    docker rm -f node
    docker_runner
else
    docker_runner
fi
