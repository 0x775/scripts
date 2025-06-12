docker run -d \
  --name dev-env \
  -p 5901:5901 \          # VNC端口
  -p 8080:8080 \          # 可选：开发服务器端口
  -e VNC_PASSWORD=your_strong_password \
  -e RESOLUTION=1680x1050x24 \  # 根据显示器调整
  -v ${PWD}/code:/home/developer/code \  # 挂载代码目录
  debian-i3-dev