FROM node:latest

WORKDIR /build

COPY package*.json ./

RUN apt update -y && apt install -y libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2
RUN npm install --loglevel verbose

COPY . .

CMD npm start
