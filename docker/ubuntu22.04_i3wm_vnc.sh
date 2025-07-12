#https://github.com/Fullaxx/ubuntu-desktop

docker run -d -p 5901:5901 -e VNCPASS='vncpass' fullaxx/ubuntu-desktop:i3

#vnc连接后注意,如果在win系统下,默认的i3 mod是win键; vnc客户端在非全屏的情况下mod会和win系统冲突(vnc-view全屏情况不会冲突)
#解决办法是修改 ~/.config/i3/config 里面的 mod 为 mod1(alt键)   set $mod Mod1 ; 默认是Mod4 win键  
