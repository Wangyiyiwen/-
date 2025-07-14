#!/bin/bash

# 智能货币兑换策略系统停止脚本

echo "🛑 停止智能货币兑换策略系统..."

# 从PID文件读取进程ID
if [ -f /tmp/exchange_system_pids.txt ]; then
    PIDS=$(cat /tmp/exchange_system_pids.txt)
    echo "停止进程: $PIDS"
    kill $PIDS 2>/dev/null
    rm -f /tmp/exchange_system_pids.txt
fi

# 强制停止所有相关进程
echo "清理所有相关进程..."
pkill -f sentiment-analysis-backend 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "✅ 系统已完全停止"
