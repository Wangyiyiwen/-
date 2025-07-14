#!/bin/bash

# 自动配置环境变量脚本

echo "🔧 自动配置环境变量..."

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)

if [ -n "$PUBLIC_IP" ]; then
    echo "📡 检测到公网IP: $PUBLIC_IP"
    
    # 创建生产环境配置
    cat > /home/ubuntu/-/frontend/.env.local << EOF
# Python 情感分析 API 配置
PYTHON_SENTIMENT_API_URL=http://$PUBLIC_IP:5000/score

# Next.js 配置
NEXT_PUBLIC_API_URL=http://$PUBLIC_IP:3000

# 自动生成时间: $(date)
EOF
    
    echo "✅ 已生成生产环境配置文件 .env.local"
    echo "📝 配置内容:"
    cat /home/ubuntu/-/frontend/.env.local
    
else
    echo "❌ 无法获取公网IP，使用本地配置"
    
    # 创建本地环境配置
    cat > /home/ubuntu/-/frontend/.env.local << EOF
# Python 情感分析 API 配置
PYTHON_SENTIMENT_API_URL=http://localhost:5000/score

# Next.js 配置
NEXT_PUBLIC_API_URL=http://localhost:3000

# 本地开发配置
EOF
    
    echo "✅ 已生成本地开发配置文件 .env.local"
fi

echo ""
echo "🎯 下一步："
echo "1. 确保端口 3000 和 5000 已开放"
echo "2. 运行启动脚本: bash /home/ubuntu/-/start_system.sh"

if [ -n "$PUBLIC_IP" ]; then
    echo "3. 访问地址: http://$PUBLIC_IP:3000"
else
    echo "3. 访问地址: http://localhost:3000"
fi
