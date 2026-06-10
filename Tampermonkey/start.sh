#!/bin/bash

# 设置环境变量（请根据实际环境修改）
export REDIS_ADDR="localhost:6379"
export REDIS_PASSWORD="your_password_here"
export REDIS_DB="0"
export PORT="8080"

# 运行 Go 程序
go run main.go