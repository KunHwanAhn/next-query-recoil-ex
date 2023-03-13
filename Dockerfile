FROM node:16.17.0-alpine3.15

ENV PORT 80

# Install yarn
RUN apk add yarn

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn

# Copying source files
COPY . /usr/src/app

RUN yarn next telemetry disable

# Building app
ARG BUILD_ENV
RUN yarn build -e $BUILD_ENV
EXPOSE $PORT

# Running the app
CMD [ "yarn", "start" ]
