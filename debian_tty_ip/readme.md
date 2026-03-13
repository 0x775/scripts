debian启动到TTY的能显示ip，方便ssh登录到系统

sudo chmod +x /usr/local/bin/update-issue.sh
sudo cp /etc/systemd/system/show-ip.service

# 重载 systemd 配置
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable show-ip.service

# 立即运行测试（无需重启）
sudo systemctl start show-ip.service

# 查看当前 /etc/issue 内容确认是否成功
cat /etc/issue
