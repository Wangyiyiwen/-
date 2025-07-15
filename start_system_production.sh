#!/bin/bash

echo "🚀 启动智能货币兑换策略系统（生产模式）..."

# 配置环境变量
echo "🔧 配置环境变量..."
source ./config.sh

# 检查Python依赖
echo "📦 检查Python依赖..."
if ! python3 -c "import torch, transformers, flask" 2>/dev/null; then
    echo "⚠️ 缺少Python依赖，正在安装..."
    pip3 install torch transformers flask flask-cors numpy pandas scikit-learn
fi

# 启动情感分析后端服务
echo "🧠 启动情感分析后端服务..."
cd "结合新闻情感预测"
nohup python3 predict_api.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "情感分析服务PID: $BACKEND_PID"
cd ..

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端服务健康状态
for i in {1..6}; do
    echo "⏳ 等待后端服务响应... ($i/6)"
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ 情感分析后端服务启动成功"
        break
    fi
    sleep 5
    if [ $i -eq 6 ]; then
        echo "❌ 情感分析后端服务启动失败"
        exit 1
    fi
done

# 测试API端点
echo "🧪 测试API端点..."
curl -s -X POST http://localhost:5000/score \
     -H "Content-Type: application/json" \
     -d '{"text": "test"}' > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API端点测试成功"
else
    echo "⚠️ API端点测试失败，但继续启动"
fi

# 启动前端服务（生产模式）
echo "🌐 启动前端服务（生产模式）..."
cd frontend

# 设置NODE_ENV为production
export NODE_ENV=production

# 启动生产服务器
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务PID: $FRONTEND_PID"

cd ..

# 创建PID文件
echo "$BACKEND_PID $FRONTEND_PID" > system.pid

echo ""
echo "🎉 系统启动完成！"
echo ""
echo "📊 访问地址："
echo "   前端界面: http://$PUBLIC_IP:3000"
echo "   情感分析API: http://$PUBLIC_IP:5000"
echo ""
echo "🌐 公网访问提示："
echo "   访问地址: http://$PUBLIC_IP:3000"
echo "   确保云服务器安全组已开放 3000 和 5000 端口"
echo ""
echo "🛑 停止服务命令："
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "💡 使用说明："
echo "   1. 打开浏览器访问 http://$PUBLIC_IP:3000"
echo "   2. 使用'系统监控'标签页进行新闻情感分析和CSV导入"
echo "   3. 使用'购钞策略'标签页制定换汇策略"
echo "   4. 查看'结果展示'页面获取最优策略建议"
echo ""
echo "⚠️  安全提示："
echo "   1. 请确保云服务器防火墙/安全组已开放端口 3000 和 5000"
echo "   2. 如使用阿里云/腾讯云等，需在控制台安全组中添加入站规则"
echo "   3. 建议仅对可信IP开放访问权限"
echo ""
echo "按 Ctrl+C 停止所有服务..."

# 等待中断信号
trap 'echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ 所有服务已停止"; exit 0' INT

# 保持脚本运行
tail -f /dev/null
