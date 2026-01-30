#!/bin/bash

set -e

echo "开始安装更纱黑体并优化 urxvt/i3 中文环境..."

# 1. 安装更纱黑体 (Debian 官方仓库包含此包)
echo "正在安装更纱黑体..."
#sudo apt update
#sudo apt install -y fonts-sarasa-gothic
#稳定版的官方仓库是没有sarasa,下面是人工拷贝安装
#https://github.com/be5invis/Sarasa-Gothic/releases/tag/v1.0.36
#https://github.com/be5invis/Sarasa-Gothic/releases/download/v1.0.36/SarasaMonoSC-TTF-1.0.36.7z
#1: mkdir -p /usr/local/share/fonts/sarasa/
#2: cp SarasaMonoSC-Bold.ttf SarasaMonoSC-Regular.ttf /usr/local/share/fonts/sarasa/
#3: sudo fc-cache -fv

# 2. 配置 urxvt (通过 .Xresources)
# 这一步是解决 urxvt 中文间距巨大、乱码的关键
REAL_USER=${SUDO_USER:-$(whoami)}
USER_HOME=$(eval echo ~$REAL_USER)

echo "配置 $USER_HOME/.Xresources ..."
cat > "$USER_HOME/.Xresources" <<EOF
! --- 终端编码与基础设置 ---
URxvt.locale: zh_CN.UTF-8
URxvt.saveLines: 5000
! 禁止闪烁
URxvt.cursorBlink: true

! --- 更纱黑体字体配置 ---
! Sarasa Mono SC 是更纱等宽黑体，适合终端，英文也是等宽的
URxvt.font: xft:Sarasa Mono SC:size=12:antialias=true
URxvt.boldFont: xft:Sarasa Mono SC:bold:size=12:antialias=true

! 解决中文间距过宽或过窄的微调 (视情况可设为 -1)
URxvt.letterSpace: -1

! --- 终端配色 (极简灰/黑) ---
URxvt.background: #1c1c1c
URxvt.foreground: #eeeeee
EOF
chown "$REAL_USER":"$REAL_USER" "$USER_HOME/.Xresources"

# 3. 确保每次启动 X 都会加载配置
echo "更新 .xinitrc ..."
# 在 exec i3 之前加入 xrdb 加载命令
if ! grep -q "xrdb -merge" "$USER_HOME/.xinitrc"; then
    sed -i '/exec i3/i xrdb -merge ~/.Xresources' "$USER_HOME/.xinitrc"
fi

# 4. 修改 i3 自身的显示字体
echo "修改 i3 配置文件字体..."
I3_CONFIG="$USER_HOME/.config/i3/config"
if [ -f "$I3_CONFIG" ]; then
    # 替换原本的 font 行为更纱黑体
    sed -i 's/^font pango:.*/font pango:Sarasa Fixed SC 12/' "$I3_CONFIG"
else
    # 如果文件不存在，写入基础字体配置
    mkdir -p "$USER_HOME/.config/i3"
    echo "font pango:Sarasa Fixed SC 10" > "$I3_CONFIG"
    chown -R "$REAL_USER":"$REAL_USER" "$USER_HOME/.config"
fi

# 5. 生成中文 Locale (防止底层环境不支持 UTF-8)
echo "检查并生成 UTF-8 Locale..."
sudo sed -i 's/# zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen
sudo sed -i 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
sudo locale-gen

echo "----------------------------------------------------"
echo "配置完成！"
echo "提示：进入 i3 后，如果 urxvt 字体未生效，请执行：xrdb -merge ~/.Xresources"
echo "更纱黑体已设为：Sarasa Mono SC (终端用) 和 Sarasa Fixed SC (i3栏用)"
echo "----------------------------------------------------"
