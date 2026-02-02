#!/bin/bash

# =================================================================
# 脚本名称: setup_i3.sh
# 适用系统: Debian 12 (Bookworm) 最小化安装版
# 功能: 自动化配置阿里云源、i3wm、Fcitx5中文输入法、更纱黑体及urxvt优化
# =================================================================

set -e

# --- 全局变量定义 ---
REAL_USER=${SUDO_USER:-$(whoami)}
USER_HOME=$(eval echo ~$REAL_USER)
I3_CONFIG="$USER_HOME/.config/i3/config"
XINITRC="$USER_HOME/.xinitrc"
XRESOURCES="$USER_HOME/.Xresources"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- 函数 1: 配置阿里云源并安装 i3 核心环境 ---
setup_base_i3() {
    echo -e "${BLUE}>>> 步骤 1: 配置阿里云源并安装核心组件...${NC}"
    
    # 配置软件源
    cat <<EOF | sudo tee /etc/apt/sources.list
deb https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
EOF

    sudo apt update
    sudo apt install -y --no-install-recommends \
        xserver-xorg-core xserver-xorg-input-libinput xinit \
        i3-wm i3status i3lock dmenu rxvt-unicode dbus-x11

    # 初始化 .xinitrc
    if [ ! -f "$XINITRC" ]; then
        echo "exec i3" > "$XINITRC"
        chown "$REAL_USER":"$REAL_USER" "$XINITRC"
    fi
    echo -e "${GREEN}基础环境安装完成。${NC}"
}

# --- 函数 2: 设置 Fcitx5 中文输入法 ---
setup_fcitx5() {
    echo -e "${BLUE}>>> 步骤 2: 安装配置 Fcitx5 输入法 (含 Firefox 支持)...${NC}"
    
    # 安装输入法及其前端 (增加 gtk 模块解决 Firefox 无法输入问题)
    sudo apt install -y --no-install-recommends \
        fcitx5 fcitx5-pinyin fcitx5-frontend-qt5 fcitx5-config-qt \
        fcitx5-frontend-gtk3

    # 配置环境变量到 .xinitrc (在 exec i3 之前)
    sed -i '/# Fcitx5 Env Start/,/# Fcitx5 Env End/d' "$XINITRC" # 避免重复添加
    sed -i "1i # Fcitx5 Env Start\nexport GTK_IM_MODULE=fcitx\nexport QT_IM_MODULE=fcitx\nexport XMODIFIERS=@im=fcitx\nexport SDL_IM_MODULE=fcitx\nexport GLFW_IM_MODULE=ibus\n# Fcitx5 Env End" "$XINITRC"

    # 设置 i3 自动启动 fcitx5
    mkdir -p "$(dirname "$I3_CONFIG")"
    if [ -f "$I3_CONFIG" ]; then
        if ! grep -q "fcitx5 -d" "$I3_CONFIG"; then
            echo "exec --no-startup-id fcitx5 -d" >> "$I3_CONFIG"
        fi
    else
        echo "exec --no-startup-id fcitx5 -d" > "$I3_CONFIG"
    fi
    
    chown "$REAL_USER":"$REAL_USER" "$XINITRC" || true
    chown -R "$REAL_USER":"$REAL_USER" "$(dirname "$I3_CONFIG")" || true
    echo -e "${GREEN}Fcitx5 配置完成。${NC}"
}

# --- 函数 3: 设置更纱黑体字体环境与 urxvt 优化 ---
setup_fonts_urxvt() {
    echo -e "${BLUE}>>> 步骤 3: 安装更纱黑体并优化 urxvt 渲染...${NC}"
    
    # 1. 下载并安装更纱黑体 (手工安装)
    #sudo apt install -y wget p7zip-full
    FONT_DIR="/usr/local/share/fonts/sarasa"
    if [ ! -d "$FONT_DIR" ]; then
        sudo mkdir -p "$FONT_DIR"
        echo "正在下载更纱黑体 (v1.0.36)..."
        #wget https://github.com/be5invis/Sarasa-Gothic/releases/download/v1.0.36/SarasaMonoSC-TTF-1.0.36.7z -O /tmp/sarasa.7z
        #sudo 7z e /tmp/sarasa.7z -o"$FONT_DIR" "SarasaMonoSC-Bold.ttf" "SarasaMonoSC-Regular.ttf" -y
        cp ~/*.ttf $FONT_DIR
        sudo fc-cache -fv
        rm /tmp/sarasa.7z
    fi

    # 2. 配置 .Xresources 解决 urxvt 中文间距
    cat > "$XRESOURCES" <<EOF
URxvt.locale: zh_CN.UTF-8
URxvt.saveLines: 5000
URxvt.cursorBlink: true
URxvt.font: xft:Sarasa Mono SC:size=12:antialias=true
URxvt.boldFont: xft:Sarasa Mono SC:bold:size=12:antialias=true
URxvt.letterSpace: -1
URxvt.background: #1c1c1c
URxvt.foreground: #eeeeee
EOF
    chown "$REAL_USER":"$REAL_USER" "$XRESOURCES"

    # 3. 确保 .xinitrc 加载 Xresources
    if ! grep -q "xrdb -merge" "$XINITRC"; then
        sed -i '/exec i3/i xrdb -merge ~/.Xresources' "$XINITRC"
    fi

    # 4. 修改 i3 标题栏字体
    if [ -f "$I3_CONFIG" ]; then
        sed -i 's/^font pango:.*/font pango:Sarasa Mono SC 12/' "$I3_CONFIG"
    fi

    # 5. 生成中文 Locale
    echo "生成 zh_CN.UTF-8 Locale..."
    sudo sed -i 's/# zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen
    sudo locale-gen

    echo -e "${GREEN}字体与 urxvt 优化完成。${NC}"
}

# --- 菜单界面 ---
show_menu() {
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}   Debian 12 i3wm 自动化安装脚本        ${NC}"
    echo -e "${GREEN}==========================================${NC}"
    echo "1) 安装基础 i3wm 环境 (含阿里云源)"
    echo "2) 安装 Fcitx5 中文输入法 (含 Firefox 修复)"
    echo "3) 安装更纱黑体并优化 urxvt/Locale"
    echo "4) 全部执行 (1+2+3)"
    echo "q) 退出"
    echo -n "请选择操作 [1-4/q]: "
}

# --- 执行逻辑 ---
while true; do
    show_menu
    read choice
    case $choice in
        1) setup_base_i3 ;;
        2) setup_fcitx5 ;;
        3) setup_fonts_urxvt ;;
        4) 
            setup_base_i3
            setup_fcitx5
            setup_fonts_urxvt
            echo -e "${GREEN}>>> 全部安装任务已完成！请重启系统或执行 startx。${NC}"
            exit 0
            ;;
        q) exit 0 ;;
        *) echo -e "${RED}输入错误，请重新选择。${NC}" ;;
    esac
done
