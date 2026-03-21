# Symfony website on Docker

## Usage

- Retrieve packages and run build tools

```bash
composer install
yarn install
yarm encore dev
```

- Create & start the containers

```bash
sudo docker-compose up -d --build
```

- Open the website on [localhost:8000](http://localhost:8000/)

- Follow the logs

```bash
sudo docker-compose logs -f
```

- Shut down the containers

```bash
sudo docker-compose up -d --build
```

## Steps to reproduce

### Pre-requisite

- Docker

- git

- PHP / Composer

```bash
sudo apt update
sudo apt install curl php-cli php-mbstring unzip php-curl php-xml php-zip
sudo apt-get install php-curl
php -v
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
composer -V
```

See. [digitalocean tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-ubuntu-18-04)

### Symfony project

- Use Composer to create the project from a skeleton

```bash
composer create-project symfony/website-skeleton sf4-website
```

- (this is not the goal here but ) you can try locally the site with `composer require server --dev` and run the unit tests with `php bin/phpunit`.

- Install encore with Flex

```bash
composer require encore
yarn install
```

- Install bootstrap

```bash
yarn add bootstrap --dev
yarn add jquery popper.js --dev
yarn add sass-loader@^7.0.1 node-sass --dev
```

- Uncomment `.enableSassLoader()` in `webpack.config.js`
