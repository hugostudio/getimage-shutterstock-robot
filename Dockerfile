#FROM node:19-alpine3.16

FROM node:16-alpine

ARG HTTP_PORT

EXPOSE ${HTTP_PORT}/tcp

# Update everything and install needed dependencies
RUN apk add --update graphicsmagick imagemagick tzdata git tini su-exec

# Install n8n and the packages it needs to build it correctly.
RUN apk --update add --virtual build-dependencies python3 build-base ca-certificates && \
    npm config set python "$(which python3)" && \
    npm_config_user=root npm install -g full-icu && \
    apk del build-dependencies \
    && rm -rf /root /tmp/* /var/cache/apk/* && mkdir /root;

WORKDIR /robotBase

COPY . /robotBase

RUN chmod -R 777 /usr/local/lib/node_modules
RUN chmod -R 777 /robotBase

RUN npm install -g npm@9.3.1 && npm install && npm run build