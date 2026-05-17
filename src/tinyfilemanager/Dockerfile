FROM php:7.4.26-apache-buster

# Buster is EOL — point to the archive mirror
RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list && \
    sed -i 's|http://security.debian.org/debian-security|http://archive.debian.org/debian-security|g' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list && \
    apt-get update && apt-get install -y libzip-dev zip curl jq \
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

RUN mkdir -p /var/www/html/data && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html
