FROM node:18.12.1-alpine AS builder

WORKDIR /usr/app

RUN yarn add pm2
COPY package.json .
COPY yarn.lock .
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 80
USER node
CMD ["yarn", "build"]