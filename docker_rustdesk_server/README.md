导入images文件
#docker load -i rustdesk_server.tar

改名
#docker tag 112233AAABBDDSSCC rustdesk/rustdesk-server:latest

#cat ./hbbs/id_ed25519.pub
复制输出的32位字符串作为加密密钥
