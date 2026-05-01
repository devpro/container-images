FROM php:7.4-apache

RUN apt-get update && apt-get install -y libzip-dev zip curl jq \
    && docker-php-ext-install zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Last commit before the CVE-2021-40964 patch (PR #636) was merged
# This is functionally equivalent to "2.4.6"
ARG VULNERABLE_COMMIT=c1718ff4c5569ecd7e2c062aa6236def7ba28614
RUN curl -L \
  "https://raw.githubusercontent.com/prasathmani/tinyfilemanager/${VULNERABLE_COMMIT}/tinyfilemanager.php" \
  -o index.php

RUN chown -R www-data:www-data /var/www/html
