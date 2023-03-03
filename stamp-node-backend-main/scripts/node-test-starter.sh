#!/bin/bash

docker_runner() {
    docker run \
        -e ADMIN_BASE_URL=$TEST_ADMIN_BASE_URL \
        -e EMAILS=$TEST_EMAILS \
        -e SMTP_HOST=$SMTP_HOST \
        -e SMTP_PORT=$SMTP_PORT \
        -e SMTP_USER=$SMTP_USER \
        -e SMTP_PASS=$SMTP_PASS \
        -e CLIENT_ID=$CLIENT_ID \
        -e CLIENT_SECRET=$CLIENT_SECRET \
        -e HOSTNAME=$TEST_HOSTNAME \
        --detach -p 3333:3002 --name node-test gitlab.sminex.com:5050/web-bim/stamp-node-backend:tst
}

if [ "$(docker ps -aq -f name=node-test)" ]; then
    docker rm -f node-test
    docker_runner
else
    docker_runner
fi
