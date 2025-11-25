#启用PMA_ARBITRARY变量后，登录界面会出现服务器地址输入框
docker run -d --name my-phpmyadmin -p 88:80 -e PMA_ARBITRARY=1 phpmyadmin/phpmyadmin:latest
