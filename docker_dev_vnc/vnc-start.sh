#!/bin/bash
# 设置VNC密码
mkdir -p ~/.vnc
echo "$VNC_PASSWORD" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# 生成X启动脚本 (专为i3wm优化)
cat << EOF > ~/.vnc/xstartup
#!/bin/sh
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
export LANG=zh_CN.UTF-8
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx

# 启动i3wm
exec dbus-launch --exit-with-session i3
EOF
chmod +x ~/.vnc/xstartup

# 启动VNC服务器
vncserver $DISPLAY -geometry $RESOLUTION -depth 24

# 保持容器运行
tail -f /dev/null