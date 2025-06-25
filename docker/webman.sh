#!/bin/bash
git clone https://github.com/Tinywan/docker-php-webman.git
cd https://github.com/Tinywan/docker-php-webman.git
docker build -t tinywan/docker-php-webman:8.3.4 .

# run 
docker run --rm -it -d --name webman -p 8787:8787 -v /Users/apple/api:/app tinywan/docker-php-webman:8.3.4
#docker exec -it webman sh
#cd /app
#composer config -g repos.packagist composer https://mirrors.cloud.tencent.com/composer/
#composer create-project workerman/webman:~2.0 .
#php start.php start
