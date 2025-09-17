--------------------------------------qemu.kvm安装
#检测CPU是否支持虚拟化扩展(出现vmx或svm一个或多个，则支持虚拟化)
egrep -c '(vmx|svm)' /proc/cpuinfo

#安装软件
sudo apt-get update
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager -y

#systemctl 命令启动并启用 libvirtd 服务
sudo systemctl enable --now libvirtd

#用户添加到 libvirt 和 kvm 组
sudo usermod -aG libvirt,kvm $USER

#修改创建Network Bridge (让虚拟出来的系统和局域网同ip段,局域网其它机器可访问)
#下面ens33修改为实际ubuntu系统网卡名称
cat /etc/netplan/01-network-manager-all.yaml
# Let NetworkManager manage all devices on this system
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    ens33:
      dhcp4: no      # 关闭物理网卡 DHCP
  bridges:
    br0:
      interfaces: [ens33]
      dhcp4: yes     # 网桥通过 DHCP 获取 IP
      parameters:
        stp: false   # 关闭生成树（家庭网络可关）
        forward-delay: 0

#应用生效
netplan apply

---------------------------------------------------------------------- 安装系统
#创建系统盘
qemu-img create -f qcow2 os.qcow2 50G

#启动虚拟机系统,开启vnc,使用ubuntu ip 及 5901 连接
qemu-system-x86_64 \
  -enable-kvm \
  -m 4G \
  -cpu host \
  -smp 2 \
  -drive file=os.qcow2,format=qcow2 \
  -cdrom /mnt/hgfs/E/ISO/win7/en_windows_7_enterprise_with_sp1_x64_dvd_u_677651.iso \
  -boot d \
  -vnc :1 \
  -net nic -net user \
  -usb -device usb-tablet \
  -name "Windows7"

---------------------------------------------------------------------- 启动系统
#start
qemu-system-x86_64 \
  -enable-kvm \
  -m 4G \
  -cpu host \
  -smp 2 \
  -drive file=win7_1.qcow2,format=qcow2 \
  -vnc :1 \
  -netdev bridge,id=hn0,br=br0 -device e1000,netdev=hn0,mac=52:54:00:12:34:56 \
  -usb -device usb-tablet \
  -name "Windows7_1"
