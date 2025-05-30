docker run -d  -p 5900:5900  -p 6080:6080  -e SCREEN_SIZE=1680x1050x24 --name playwright-client  --shm-size=2gb -v /data:/data  playwright-vnc

