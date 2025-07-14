# 智能货币兑换策略系统 - 使用指南

## 🚀 快速启动

### 方法一：一键启动（推荐）
```bash
cd /home/rprp/Github/-
./start_system.sh
```

### 方法二：手动启动
1. 启动情感分析后端：
```bash
cd /home/rprp/Github/-/frontend/scripts
python3 sentiment-analysis-backend.py &
```

2. 启动前端：
```bash
cd /home/rprp/Github/-/frontend
npm run dev
```

## 🛑 停止系统

### 一键停止
```bash
cd /home/rprp/Github/-
./stop_system.sh
```

### 手动停止
按 `Ctrl+C` 或者运行：
```bash
pkill -f sentiment-analysis-backend
pkill -f next
```

## 📊 系统功能

### 1. 新闻情感分析
- 访问: http://localhost:3000
- 点击"情感分析"标签页
- 输入新闻文本，点击"分析情感"
- 查看AI分析结果并可保存到历史

### 2. CSV新闻批量导入
- 在"系统监控"标签页
- 找到"Import News Data"区域
- 上传包含新闻内容的CSV文件
- 系统自动分析所有新闻并更新市场情感

### 3. 购钞策略分析
- 在"购钞策略"标签页
- 输入购钞需求
- 获取AI推荐的最优策略

### 4. 实时数据监控
- 查看市场波动率
- 监控情感指数变化
- 追踪新闻数量统计

## 📁 测试文件

系统已准备了测试CSV文件：
- 位置: `/home/rprp/Github/-/test-news.csv`
- 包含5条测试新闻，可用于测试批量导入功能

## 🔧 技术架构

- **前端**: Next.js + React + TypeScript (端口3000)
- **后端**: Flask + FinBERT + BART (端口5000)
- **AI模型**: 
  - FinBERT: 金融文本情感分析
  - BART-large-cnn: 文本摘要

## ⚠️ 注意事项

1. 首次启动会下载AI模型，需要等待几分钟
2. 确保端口3000和5000未被占用
3. 建议使用Chrome或Firefox浏览器
4. 如遇到问题，先运行 `./stop_system.sh` 清理环境

## 🆘 常见问题

**Q: 端口被占用怎么办？**
A: 运行 `./stop_system.sh` 清理所有进程

**Q: 情感分析不工作？**
A: 检查Python依赖是否安装，运行启动脚本会自动安装

**Q: 前端页面无法访问？**
A: 确保前端服务正常启动，检查 http://localhost:3000

**Q: CSV导入失败？**
A: 确保CSV文件包含 `content`、`text` 或 `article_text` 列
