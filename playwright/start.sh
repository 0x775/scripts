#!/bin/bash

# 清理可能的锁文件
rm /tmp/.X99-lock 2>/dev/null || true

# 设置显示环境
export DISPLAY=:99

# 使用环境变量设置分辨率，或默认值
SCREENSIZE=${SCREEN_SIZE:-1280x1024x24}

# 启动虚拟显示器
Xvfb $DISPLAY -screen 0 $SCREENSIZE -ac +extension GLX +render -noreset > /dev/null 2>&1 &

# 等待 Xvfb 启动
sleep 2

# 创建 fluxbox 配置文件（如果不存在）
if [ ! -f /root/.fluxbox/init ]; then
    mkdir -p /root/.fluxbox
    
    # 创建基本配置
    cat << EOF > /root/.fluxbox/init
session.screen0.defaultDeco:	NORMAL
session.screen0.toolbar.visible:	true
session.screen0.toolbar.autoHide:	false
session.screen0.toolbar.widthPercent:	100
session.screen0.workspaces:	4
session.screen0.fullMaximization:	true
session.screen0.focusNewWindows:	true
session.screen0.focusModel:	ClickFocus
session.screen0.defaultColumns:	1
session.screen0.defaultRows:	1
EOF
fi


# 启动窗口管理器
fluxbox > /dev/null 2>&1 &

# 启动 VNC 服务器 - 使用密码文件
x11vnc -display $DISPLAY -forever -shared -rfbport 5900 -rfbauth /root/.vnc/passwd -bg > /dev/null 2>&1

# 启动 noVNC
websockify --web /usr/share/novnc 6080 localhost:5900 > /dev/null 2>&1 &

# 输出状态信息
echo "=============================================="
echo "VNC 服务已启动 - 分辨率: $SCREENSIZE"
echo "访问地址: http://<宿主机IP>:6080/vnc.html"
echo "VNC 密码: playwright"
echo "=============================================="

# 保持容器运行
tail -f /dev/null
