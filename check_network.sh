#!/bin/bash

# 云服务器网络配置检查脚本

echo "🔍 检查云服务器网络配置..."
echo ""

# 获取公网IP
echo "📡 获取公网IP地址..."
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)
if [ -n "$PUBLIC_IP" ]; then
    echo "✅ 公网IP: $PUBLIC_IP"
else
    echo "❌ 无法获取公网IP，请手动查询"
fi
echo ""

# 检查端口监听状态
echo "🔌 检查端口监听状态..."
echo "检查端口 3000 (前端):"
netstat -tlnp | grep :3000 || echo "❌ 端口 3000 未监听"

echo "检查端口 5000 (后端API):"
netstat -tlnp | grep :5000 || echo "❌ 端口 5000 未监听"
echo ""

# 检查防火墙状态
echo "🔥 检查防火墙状态..."
if command -v ufw >/dev/null 2>&1; then
    echo "UFW防火墙状态:"
    sudo ufw status
elif command -v firewalld >/dev/null 2>&1; then
    echo "FirewallD状态:"
    sudo firewall-cmd --state
    sudo firewall-cmd --list-ports
else
    echo "未检测到常见防火墙管理工具"
fi
echo ""

# 检查iptables规则
echo "📋 检查iptables规则..."
if command -v iptables >/dev/null 2>&1; then
    echo "当前iptables INPUT规则:"
    sudo iptables -L INPUT -n --line-numbers | head -10
else
    echo "iptables未安装或无权限访问"
fi
echo ""

# 提供配置建议
echo "⚙️  配置建议："
echo ""

if [ -n "$PUBLIC_IP" ]; then
    echo "🌐 访问地址："
    echo "   前端: http://$PUBLIC_IP:3000"
    echo "   API:  http://$PUBLIC_IP:5000"
    echo ""
fi

echo "🔧 如果无法访问，请执行以下步骤："
echo ""
echo "1. 开放防火墙端口："
echo "   # Ubuntu/Debian (UFW)"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 5000"
echo ""
echo "   # CentOS/RHEL (FirewallD)"
echo "   sudo firewall-cmd --permanent --add-port=3000/tcp"
echo "   sudo firewall-cmd --permanent --add-port=5000/tcp"
echo "   sudo firewall-cmd --reload"
echo ""
echo "   # 直接使用iptables"
echo "   sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT"
echo "   sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT"
echo ""

echo "2. 云服务商安全组配置："
echo "   - 阿里云: ECS控制台 → 安全组 → 添加安全组规则"
echo "   - 腾讯云: CVM控制台 → 安全组 → 入站规则"
echo "   - 华为云: ECS控制台 → 安全组 → 入方向规则"
echo "   - AWS: EC2 → Security Groups → Inbound Rules"
echo ""
echo "   规则配置："
echo "   - 端口范围: 3000, 5000"
echo "   - 协议: TCP"
echo "   - 源地址: 0.0.0.0/0 (或指定可信IP)"
echo ""

echo "3. 重启服务："
echo "   bash /home/ubuntu/-/start_system.sh"
echo ""

echo "📞 测试连接："
echo "   curl http://$PUBLIC_IP:5000/health"
echo ""
