package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8" // 改用 v8
)

var rdb *redis.Client

type ReportRequest struct {
	Key  string `json:"key"`
	Data string `json:"data"`
}

type Response struct {
	Retcode int    `json:"retcode"`
	Msg     string `json:"msg,omitempty"`
}

func main() {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")

	redisDB := 0
	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		db, err := strconv.Atoi(dbStr)
		if err != nil {
			log.Fatalf("REDIS_DB 无效: %v", err)
		}
		redisDB = db
	}

	rdb = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       redisDB,
	})

	ctx := context.Background()
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Fatalf("无法连接 Redis (地址:%s, DB:%d): %v", redisAddr, redisDB, err)
	}
	log.Printf("已连接 Redis (地址:%s, DB:%d)", redisAddr, redisDB)

	http.HandleFunc("/report", corsMiddleware(reportHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("服务器启动在 :%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func reportHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, Response{Retcode: -1, Msg: "仅支持 POST 请求"})
		return
	}

	var req ReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, Response{Retcode: -1, Msg: "无效的 JSON 格式"})
		return
	}

	if req.Key == "" {
		writeJSON(w, http.StatusBadRequest, Response{Retcode: -1, Msg: "缺少 key 参数"})
		return
	}
	if req.Data == "" {
		writeJSON(w, http.StatusBadRequest, Response{Retcode: -1, Msg: "缺少 data 参数"})
		return
	}

	ctx := context.Background()
	err := rdb.Set(ctx, req.Key, req.Data, 10*24*time.Hour).Err()
	if err != nil {
		log.Printf("Redis 写入失败: key=%s, err=%v", req.Key, err)
		writeJSON(w, http.StatusInternalServerError, Response{Retcode: -1, Msg: "数据存储失败"})
		return
	}

	writeJSON(w, http.StatusOK, Response{Retcode: 200})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}