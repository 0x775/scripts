#debian 12
# 安装基础工具
apt update && apt install -y ca-certificates curl

# 创建密钥存储目录
install -m 0755 -d /etc/apt/keyrings

# 获取官方密钥
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# 添加官方存储库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新软件源
apt update

# 安装docker
apt install -y docker-ce docker-ce-cli

#运行容器
docker run -d --restart=always --name secure-proxy \
  -p 1080:1080 -p 3389:8080 \
  ginuerzh/gost \
  -L "socks5://demo:qazwsx1a@:1080?dns=8.8.8.8,114.114.114.114" \
  -L "http://demo:qazwsx1a@:8080?dns=8.8.8.8,114.114.114.114"
