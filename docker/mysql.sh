#docker pull mysql:8.0.24
#mkdir -p /var/data/mysql
docker run -p 3306:3306 --name mysql8.0.24 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0.24
