# Forex Copilot - 智能货币兑换策略系统

**Group 5: Forex Copilot**

一个基于深度学习和实时数据的智能换汇策略分析系统，帮助用户在最佳时机以最优成本进行货币兑换。

## 🌟 系统特性

- **🤖 AI驱动预测**: 集成Transformer-LSTM模型，结合价格趋势和新闻情感分析
- **📊 实时汇率**: 多源实时汇率API，确保数据准确性
- **🎯 智能策略**: 多渠道成本分析，个性化推荐最优兑换方案
- **📱 现代化界面**: Next.js + TypeScript构建的响应式Web应用
- **🔄 自动化部署**: 一键启动/停止脚本，零配置运行

## 💱 支持货币

从人民币（CNY）换向亚洲地区主流货币：
- 🇯🇵 日元（JPY）
- 🇸🇬 新加坡元（SGD）  
- 🇭🇰 港元（HKD）
- 🇰🇷 韩元（KRW）
- 🇹🇭 泰国铢（THB）
- 🇲🇾 马来西亚元（MYR）

## 🚀 快速开始

### 系统要求

- Node.js 18+ 
- Python 3.8+
- bash shell (Linux/macOS)

### 一键启动

```bash
# 克隆项目
git clone xxx
cd ./-

# 一键启动系统
./start_system.sh
```

启动脚本会自动：
1. 安装所有依赖
2. 配置环境变量  
3. 启动前端服务器 (localhost:3000)
4. 启动后端API服务 (localhost:5002)
5. 启动预测模型服务

### 一键停止

```bash
./stop_system.sh
```

### 手动安装（可选）

如果需要手动控制安装过程：

```bash
# 1. 安装前端依赖
cd frontend
npm install
# 或使用 yarn/pnpm
# yarn install
# pnpm install

# 2. 安装Python依赖
cd ../结合新闻情感预测
pip install -r requirements.txt

# 3. 启动服务
cd ../frontend
npm run dev
```

## 📦 项目结构

```
forex-copilot/
├── 📝 README.md                    # 项目说明文档
├── 🚀 start_system.sh             # 一键启动脚本
├── 🛑 stop_system.sh              # 一键停止脚本
├── ⚙️ setup_env.sh                # 环境配置脚本
│
├── 🎨 frontend/                    # Next.js前端应用
│   ├── package.json               # 前端依赖配置
│   ├── app/                       # Next.js应用目录
│   ├── components/                # React组件
│   ├── scripts/                   # 后端服务脚本
│   │   ├── advanced-finance-backend.py
│   │   └── test_real_time_rates.py
│   └── ...
│
├── 🧠 结合新闻情感预测/            # AI预测模型
│   ├── requirements.txt           # Python依赖
│   ├── predict_api_*.py          # 各种预测API
│   ├── *.csv                     # 历史数据
│   └── news_sentiment/           # 新闻情感数据
│
├── 📊 Rate LSTM/                   # LSTM模型数据
├── 📚 doc/                         # 项目文档
├── 💾 code/                        # 核心代码
└── 📋 logs/                        # 系统日志
```

## 🔧 核心功能

### 1. 智能预测引擎

- **Transformer-LSTM模型**: 结合价格时序和市场情感的多模态预测
- **新闻情感分析**: 实时分析金融新闻对汇率的影响
- **技术指标计算**: RSI、MACD、布林带等专业指标

### 2. 实时汇率服务

- **多源数据**: 集成多个汇率API确保数据可靠性
- **自动降级**: API故障时自动切换备用数据源
- **缓存优化**: 智能缓存减少API调用次数

### 3. 策略分析系统

- **多渠道比较**: 银行、机场、ATM、在线兑换等多种渠道
- **成本分析**: 综合手续费、汇率差价、风险评估
- **个性化推荐**: 基于用户偏好的智能推荐算法

### 4. 用户界面

- **响应式设计**: 支持桌面和移动设备
- **实时更新**: 汇率和预测数据实时刷新
- **交互可视化**: 图表展示汇率趋势和预测结果

## 🌐 API接口

### 前端API (localhost:3000/api/)

```bash
# 汇率预测
POST /api/rate-prediction
Body: {
  "fromCurrency": "CNY",
  "toCurrency": "JPY", 
  "days": 20,
  "modelType": "transformer"
}

# 实时汇率
POST /api/real-time-rate  
Body: {
  "fromCurrency": "CNY",
  "toCurrency": "JPY"
}
```

### 后端服务API (localhost:5002/)

```bash
# 健康检查
GET /health

# 高级策略分析
POST /analyze_advanced_strategy

# 实时汇率查询
POST /get_real_time_rate

# 可用渠道查询
POST /get_available_channels
```

## 📊 系统监控

访问以下地址查看系统状态：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5002/health
- **系统日志**: `./logs/backend.log`

## 🔧 配置说明

### 环境变量

系统会自动配置以下环境变量：

```bash
# 汇率API配置
EXCHANGE_RATE_API_KEY=your_api_key_here

# 数据库配置  
DB_PATH=./data/exchange_rates.db

# 服务端口
FRONTEND_PORT=3000
BACKEND_PORT=5002
```

### 自定义配置

1. **汇率API密钥**: 编辑 `frontend/.env.local` 添加API密钥
2. **模型参数**: 修改 `结合新闻情感预测/predict_api_*.py` 中的模型配置
3. **界面主题**: 编辑 `frontend/tailwind.config.ts` 自定义样式

## 🧪 测试

```bash
# 测试实时汇率API
cd frontend/scripts
python3 test_real_time_rates.py

# 测试前端组件
cd frontend
npm run test

# 测试预测模型
cd 结合新闻情感预测
python3 predict_api_multimodal_transformer.py JPY 5
```

## 🚨 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   lsof -i :5002
   
   # 杀死进程
   ./stop_system.sh
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存重新安装
   rm -rf frontend/node_modules
   rm frontend/package-lock.json
   ./start_system.sh
   ```

3. **Python模块找不到**
   ```bash
   # 重新安装Python依赖
   cd 结合新闻情感预测
   pip install -r requirements.txt --force-reinstall
   ```

4. **实时汇率获取失败**
   ```bash
   # 检查网络连接
   ./check_network.sh
   
   # 手动测试API
   curl -X POST http://localhost:5002/get_real_time_rate \
     -H "Content-Type: application/json" \
     -d '{"from_currency": "CNY", "to_currency": "JPY"}'
   ```

### 日志查看

```bash
# 查看系统启动日志
tail -f nohup.out

# 查看后端服务日志  
tail -f logs/backend.log

# 查看前端开发日志
cd frontend && npm run dev
```

## 📈 性能优化

- **缓存策略**: 汇率数据缓存30秒，减少API调用
- **模型优化**: 预测模型支持批量处理，提高吞吐量
- **前端优化**: 使用Next.js SSR和组件懒加载

## 🔒 安全说明

- API密钥通过环境变量管理，不在代码中硬编码
- 所有外部API调用都有超时和错误处理
- 用户输入经过验证和过滤
- 生产环境建议使用HTTPS

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`  
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 📞 联系我们

- **项目维护**: Group 5 Team
- **技术支持**: 通过GitHub Issues提交问题
- **功能建议**: 欢迎提交Enhancement请求

---

**🎯 让智能化的数据分析为您的换汇决策提供最佳指导！**

   

   

   

   

   

   

   