#!/bin/bash
# 获取非 127.0.0.1 的 IPv4 地址，取第一个
IP_ADDR=$(hostname -I | awk '{print $1}')

# 如果没有获取到 IP，显示提示信息
if [ -z "$IP_ADDR" ]; then
    IP_ADDR="Network Unavailable"
fi

# 写入 /etc/issue
# \n 表示换行，\l 表示终端线路名 (由 getty 自动替换)
cat > /etc/issue <<EOF
Debian GNU/Linux 12 
IPv4 Address: $IP_ADDR 

EOF
