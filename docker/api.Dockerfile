FROM php:8.4-cli-alpine AS base

RUN apk add --no-cache \
      bash \
      git \
      unzip \
      libzip-dev \
      oniguruma-dev \
      icu-dev \
      libpng-dev \
      autoconf \
      g++ \
      make \
      mysql-client \
  && docker-php-ext-install pdo_mysql mbstring zip bcmath intl gd \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del autoconf g++ make

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# ─── dev ─────────────────────────────────────────────────
FROM base AS dev
EXPOSE 8000
CMD ["sh", "-c", "if [ ! -f vendor/autoload.php ]; then composer install --no-interaction; fi && php artisan serve --host=0.0.0.0 --port=8000"]

# ─── prod ────────────────────────────────────────────────
FROM base AS prod
COPY apps/api /var/www/html
RUN composer install --no-dev --optimize-autoloader --no-interaction \
  && chown -R www-data:www-data storage bootstrap/cache
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
