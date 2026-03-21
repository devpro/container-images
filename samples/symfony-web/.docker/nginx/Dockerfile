ARG NGINX_VERSION=1.15

FROM nginx:${NGINX_VERSION}-alpine

RUN apk add bash

COPY default.conf /etc/nginx/conf.d/default.conf
