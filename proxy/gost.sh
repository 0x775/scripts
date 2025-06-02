docker run -d --name secure-proxy \
  -p 1080:1080 -p 3389:8080 \
  ginuerzh/gost \
  -L "socks5://demo:123456a@:1080?dns=8.8.8.8" \
  -L "http://demo:123456a@:8080?dns=8.8.8.8"
