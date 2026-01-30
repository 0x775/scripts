#!/bin/bash

# 确保脚本在遇到错误时停止
set -e

echo "开始执行 Debian 12 i3wm 最小化安装及中文环境配置..."

# 1. 配置阿里云软件源
echo "正在配置阿里云 Debian 12 软件源..."
cat > /etc/apt/sources.list <<EOF
deb https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
EOF

# 2. 更新系统并安装 X 环境及 i3wm
echo "安装 Xserver 和 i3 核心组件..."
apt update
apt install -y --no-install-recommends \
    xserver-xorg-core xserver-xorg-input-libinput xinit \
    i3-wm i3status i3lock dmenu rxvt-unicode

# 3. 安装中文字体和 Fcitx5 输入法
echo "安装中文支持及 Fcitx5..."
apt install -y --no-install-recommends \
    fonts-noto-cjk \
    fcitx5 fcitx5-pinyin fcitx5-frontend-qt5 fcitx5-config-qt

# 4. 配置环境变量 (~/.xinitrc)
# 获取当前实际用户（防止在 sudo 模式下写错目录）
REAL_USER=${SUDO_USER:-$(whoami)}
USER_HOME=$(eval echo ~$REAL_USER)

echo "配置 $USER_HOME/.xinitrc ..."
cat > "$USER_HOME/.xinitrc" <<EOF
# 设置输入法环境变量
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
export SDL_IM_MODULE=fcitx
export GLFW_IM_MODULE=ibus

# 启动 i3
exec i3
EOF
chown "$REAL_USER":"$REAL_USER" "$USER_HOME/.xinitrc"

# 5. 设置 i3 自动启动 fcitx5
echo "配置 i3 自动启动 Fcitx5..."
I3_CONFIG_DIR="$USER_HOME/.config/i3"
mkdir -p "$I3_CONFIG_DIR"

# 如果配置文件不存在，先生成默认配置（可选，通常第一次运行i3会生成）
# 这里直接追加启动命令到配置文件末尾
if [ -f "$I3_CONFIG_DIR/config" ]; then
    # 检查是否已经写过，避免重复追加
    if ! grep -q "fcitx5 -d" "$I3_CONFIG_DIR/config"; then
        echo "exec --no-startup-id fcitx5 -d" >> "$I3_CONFIG_DIR/config"
    fi
else
    # 如果此时 config 还没生成，先写一行
    echo "exec --no-startup-id fcitx5 -d" > "$I3_CONFIG_DIR/config"
fi
chown -R "$REAL_USER":"$REAL_USER" "$USER_HOME/.config"

echo "----------------------------------------------------"
echo "安装完成！"
echo "1. 请以普通用户身份运行 'startx' 进入桌面。"
echo "2. 进入 i3 后，请在终端运行 'fcitx5-config-tool' 来添加拼音输入法。"
echo "3. 默认切换快捷键为 Ctrl+Space。"
echo "----------------------------------------------------"
