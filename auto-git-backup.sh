#!/bin/bash

REPOS=(
  "/d/project/dianshang/shop_www"
  "/d/project/dianshang/www"
)
BRANCH="backup/auto-save"
INTERVAL=300

backup_repo() {
  local repo="$1"
  local state_file="$repo/.git/auto-backup.state"

  echo "🔄 $(date): 检查 $repo"

  cd "$repo" || { echo "❌ 跳过：目录不存在"; return 1; }

  # 生成当前工作区指纹（只包含 tracked 文件）
  # 使用 git ls-files + sha1sum 确保稳定
  CURRENT_HASH=$(git ls-files -z | xargs -0 sha1sum 2>/dev/null | sha1sum | cut -d' ' -f1)

  # 读取上次备份的指纹
  if [ -f "$state_file" ]; then
    LAST_HASH=$(cat "$state_file")
  else
    LAST_HASH=""
  fi

  # 如果指纹相同，跳过
  if [ "$CURRENT_HASH" = "$LAST_HASH" ]; then
    echo "   → 文件内容无变化，跳过备份"
    return 0
  fi

  # 检查远程是否存在 backup 分支
  if ! git ls-remote --exit-code origin "refs/heads/$BRANCH" >/dev/null 2>&1; then
    echo "   → 初始化远程备份分支"
    # 用当前 HEAD 创建远程 backup 分支
    git push origin "$(git rev-parse HEAD):refs/heads/$BRANCH"
    echo "   ✅ 远程备份分支已创建"
    return 0
  fi

  # 获取远程 backup 分支的最新 commit
  PARENT=$(git ls-remote origin "refs/heads/$BRANCH" | cut -f1)
  if [ -z "$PARENT" ]; then
    echo "   ❌ 无法获取远程 backup 分支 HEAD"
    return 1
  fi

  echo "   📝 检测到以下文件变更："
  git status --porcelain | head -n 10 | while read -r line; do
    file=$(echo "$line" | cut -c4-)
    echo "     • $file"
  done

  # 暂存当前文件（仅用于快照）
  git add .
  TREE=$(git write-tree)

  # 创建新 commit（parent = 远程 backup 的最新 commit）
  COMMIT=$(git commit-tree "$TREE" -p "$PARENT" -m "[AUTO-SAVE] $(date '+%Y-%m-%d %H:%M:%S')")

  # 直接推送新 commit 到远程 backup 分支
  if git push origin "$COMMIT:refs/heads/$BRANCH"; then
    echo "   ✅ 备份成功"
    echo "$CURRENT_HASH" > "$state_file"  # 更新状态
  else
    echo "   ❌ 推送失败"
  fi
}

echo "🚀 自动 Git 备份已启动（每 ${INTERVAL} 秒检查一次）"
while true; do
  for repo in "${REPOS[@]}"; do
    backup_repo "$repo"
  done
  echo
  sleep "$INTERVAL"
done