#!/bin/bash

# 智能货币兑换策略系统启动脚本

echo "🚀 启动智能货币兑换策略系统..."

# 检查并安装Python依赖
echo "📦 检查Python依赖..."
python3 -c "import flask, flask_cors, transformers, torch" 2>/dev/null || {
    echo "⚠️  安装缺失的Python依赖..."
    python3 -m pip install flask flask-cors transformers torch --user
}

# 启动Python后端服务（情感分析）
echo "🧠 启动情感分析后端服务..."
cd /home/rprp/Github/-/frontend/scripts
python3 sentiment-analysis-backend.py &
SENTIMENT_PID=$!
echo "情感分析服务PID: $SENTIMENT_PID"

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
sleep 10

# 检查后端服务是否正常 (重试机制)
for i in {1..6}; do
    if curl -s http://localhost:5000 >/dev/null 2>&1; then
        echo "✅ 情感分析后端服务启动成功"
        break
    else
        echo "⏳ 等待后端服务响应... ($i/6)"
        sleep 5
    fi
    if [ $i -eq 6 ]; then
        echo "❌ 情感分析后端服务启动超时，但服务可能仍在初始化中"
    fi
done

# 启动Next.js前端
echo "🌐 启动前端服务..."
cd /home/rprp/Github/-/frontend
npm run dev &
FRONTEND_PID=$!
echo "前端服务PID: $FRONTEND_PID"

echo ""
echo "🎉 系统启动完成！"
echo ""
echo "📊 访问地址："
echo "   前端界面: http://localhost:3000"
echo "   情感分析API: http://localhost:5000"
echo ""
echo "🛑 停止服务命令："
echo "   kill $SENTIMENT_PID $FRONTEND_PID"
echo ""
echo "💡 使用说明："
echo "   1. 打开浏览器访问 http://localhost:3000"
echo "   2. 使用'系统监控'标签页进行新闻情感分析和CSV导入"
echo "   3. 使用'购钞策略'标签页制定换汇策略"
echo "   4. 查看'结果展示'页面获取最优策略建议"
echo ""

# 保存PID到文件以便后续停止
echo "$SENTIMENT_PID $FRONTEND_PID" > /tmp/exchange_system_pids.txt

# 等待用户输入来停止服务
echo "按 Ctrl+C 停止所有服务..."
trap 'echo "🛑 正在停止服务..."; kill $SENTIMENT_PID $FRONTEND_PID 2>/dev/null; rm -f /tmp/exchange_system_pids.txt; echo "✅ 所有服务已停止"; exit 0' INT

wait
