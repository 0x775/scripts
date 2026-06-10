@echo off
REM set ...
set REDIS_ADDR=127.0.0.1:6379
set REDIS_PASSWORD=123456
set REDIS_DB=4
set PORT=8080

REM run.main
go run main.go
pause
