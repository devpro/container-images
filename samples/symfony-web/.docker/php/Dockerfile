ARG PHP_VERSION=7.2

FROM php:${PHP_VERSION}-fpm-alpine AS overboard_php

# RUN apk add bash

RUN ln -s $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini

RUN set -eux; \
	apk add --no-cache --virtual .build-deps \
		icu-dev \
		mysql-client \
		zip \
	; \
	\
	docker-php-ext-install -j$(nproc) \
		intl \
		pdo_mysql \
	;
