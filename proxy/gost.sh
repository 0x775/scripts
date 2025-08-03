docker run -d --name secure-proxy \
  -p 1080:1080 -p 3389:8080 \
  ginuerzh/gost \
  -L "socks5://demo:qazwsx1a@:1080?dns=8.8.8.8,114.114.114.114" \
  -L "http://demo:qazwsx1aa@:8080?dns=8.8.8.8,114.114.114.114"
