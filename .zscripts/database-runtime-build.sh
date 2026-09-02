#!/bin/bash

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/z/my-project}"
BUILD_DIR="${BUILD_DIR:?BUILD_DIR is required}"

# Prisma provider-aware packaging.
# - postgres://... (schema.prisma): require DATABASE_URL; push schema to the
#   external Postgres; no embedded file is copied (SQLite file: is impossible
#   for a postgresql datasource).
# - file:... (legacy embedded deploy): keep the old SQLite copy behaviour.
DATABASE_URL="${DATABASE_URL:-}"
case "$DATABASE_URL" in
    file:*)
        SOURCE_DB_DIR="$PROJECT_DIR/db"
        SOURCE_DB_PATH="$SOURCE_DB_DIR/custom.db"
        TARGET_DB_DIR="$BUILD_DIR/db"
        TARGET_DB_PATH="$TARGET_DB_DIR/custom.db"

        mkdir -p "$TARGET_DB_DIR"
        if [ -f "$SOURCE_DB_PATH" ]; then
            echo "🗄️  复制 Preview 数据库到构建产物..."
            cp -a "$SOURCE_DB_DIR/." "$TARGET_DB_DIR/"
        else
            echo "ℹ️  未找到 Preview 数据库 db/custom.db，将初始化空的生产数据库"
        fi

        echo "🗄️  同步构建产物中的数据库结构..."
        ( cd "$PROJECT_DIR" && DATABASE_URL="file:$TARGET_DB_PATH" bun run db:push )

        if [ ! -f "$TARGET_DB_PATH" ]; then
            echo "❌ 数据库初始化命令执行成功，但未生成 $TARGET_DB_PATH"
            exit 1
        fi
        echo "✅ 构建产物数据库已准备完成 (SQLite embedded)"
        ls -lah "$TARGET_DB_DIR"
        ;;
    postgres*)
        echo "🗄️  provider=postgresql — 推送到外部数据库 DATABASE_URL"
        ( cd "$PROJECT_DIR" && bun run db:push )
        echo "✅ 外部 Postgres 结构已同步"
        ;;
    *)
        echo "❌ DATABASE_URL 未设置或不匹配 (需要 postgres://... 或 file:...)"
        exit 1
        ;;
esac
