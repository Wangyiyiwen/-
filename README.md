**Forex Copilot - Intelligent Currency Exchange Strategy System**

**Group 5: Forex Copilot**

An intelligent currency-exchange strategy analysis system based on deep learning and real-time data, helping users exchange currencies at the optimal time and lowest cost.

## 🌟 System Features

* **🤖 AI-Driven Forecasting**: Integrates a Transformer-LSTM model combining price trends and news sentiment analysis.
* **📊 Real-Time Rates**: Multi-source real-time exchange-rate APIs ensure data accuracy.
* **🎯 Smart Strategies**: Multi-channel cost analysis and personalized recommendations for the best exchange options.
* **📱 Modern Interface**: A responsive web application built with Next.js and TypeScript.
* **🔄 Automated Deployment**: One-click scripts to start/stop the system with zero configuration.

## 💱 Supported Currencies

Exchange from Chinese Yuan (CNY) to major Asian currencies:

* 🇯🇵 Japanese Yen (JPY)
* 🇸🇬 Singapore Dollar (SGD)
* 🇭🇰 Hong Kong Dollar (HKD)
* 🇰🇷 South Korean Won (KRW)
* 🇹🇭 Thai Baht (THB)
* 🇲🇾 Malaysian Ringgit (MYR)

## 🚀 Quick Start

### System Requirements

* Node.js 18+
* Python 3.8+
* Bash shell (Linux/macOS)

### One-Click Launch

```bash
# Clone the repository
git clone <repo-url>
cd forex-copilot

# Start the system
./start_system.sh
```

The startup script will automatically:

1. Install all dependencies
2. Configure environment variables
3. Launch the front-end server (localhost:3000)
4. Launch the back-end API service (localhost:5002)
5. Launch the prediction model service

### One-Click Shutdown

```bash
./stop_system.sh
```

### Manual Installation (Optional)

If you prefer manual control over the setup:

```bash
# 1. Install front-end dependencies
cd frontend
npm install
# or yarn install
# or pnpm install

# 2. Install Python dependencies
cd ../news-sentiment-prediction
pip install -r requirements.txt

# 3. Start the services
# Front-end
cd ../frontend
npm run dev
# Back-end
# (Ensure Python environment is active)
python3 ../news-sentiment-prediction/predict_api_transformer.py
```

## 📦 Project Structure

```
forex-copilot/
├── README.md                  # Project documentation
├── start_system.sh            # One-click start script
├── stop_system.sh             # One-click stop script
├── setup_env.sh               # Environment configuration script
│
├── frontend/                  # Next.js front-end application
│   ├── package.json           # Front-end dependencies
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── scripts/               # Auxiliary backend scripts
│   │   ├── advanced-finance-backend.py
│   │   └── test_real_time_rates.py
│   └── ...
│
├── news-sentiment-prediction/ # AI prediction models
│   ├── requirements.txt       # Python dependencies
│   ├── predict_api_*.py       # Prediction API scripts
│   ├── *.csv                  # Historical datasets
│   └── news_sentiment/        # News sentiment datasets
│
├── Rate_LSTM/                 # LSTM model data
├── doc/                       # Documentation files
├── code/                      # Core code
└── logs/                      # System logs
```

## 🔧 Core Features

### 1. Intelligent Forecast Engine

* **Transformer-LSTM Model**: A multi-modal predictor combining price time series and market sentiment.
* **News Sentiment Analysis**: Analyzes financial news in real time to gauge market impact.
* **Technical Indicators**: Computes RSI, MACD, Bollinger Bands, and other professional metrics.

### 2. Real-Time Rate Service

* **Multi-Source Data**: Integrates multiple rate APIs for reliability.
* **Auto-Failover**: Switches to backup data sources if an API fails.
* **Cache Optimization**: Smart caching reduces external API calls.

### 3. Strategy Analysis System

* **Channel Comparison**: Compares banks, airports, ATMs, online exchangers, and more.
* **Cost Analysis**: Considers fees, rate spreads, and risk factors.
* **Personalized Recommendations**: Algorithms tailor suggestions to user preferences.

### 4. User Interface

* **Responsive Design**: Works on both desktop and mobile devices.
* **Real-Time Updates**: Live refresh of rates and forecasts.
* **Interactive Visuals**: Charts display rate trends and predicted outcomes.

## 🌐 API Endpoints

### Front-End API (localhost:3000/api/)

```bash
# Rate Prediction
POST /api/rate-prediction
Body: {
  "fromCurrency": "CNY",
  "toCurrency": "JPY",
  "days": 20,
  "modelType": "transformer"
}

# Real-Time Rate
POST /api/real-time-rate
Body: {
  "fromCurrency": "CNY",
  "toCurrency": "JPY"
}
```

### Back-End Service API (localhost:5002/)

```bash
# Health Check
GET /health

# Advanced Strategy Analysis
POST /analyze_advanced_strategy

# Real-Time Rate Query
POST /get_real_time_rate

# Available Channels
POST /get_available_channels
```

## 📊 System Monitoring

* **Front-End URL**: [http://localhost:3000](http://localhost:3000)
* **Back-End Health**: [http://localhost:5002/health](http://localhost:5002/health)
* **Logs**: `logs/backend.log`

## 🔧 Configuration

### Environment Variables

The startup script sets these by default:

```bash
EXCHANGE_RATE_API_KEY=your_api_key_here
DB_PATH=./data/exchange_rates.db
FRONTEND_PORT=3000
BACKEND_PORT=5002
```

### Custom Settings

1. **API Key**: Add to `frontend/.env.local`.
2. **Model Parameters**: Edit in `news-sentiment-prediction/predict_api_*.py`.
3. **UI Theme**: Configure in `frontend/tailwind.config.ts`.

## 🧪 Testing

```bash
# Test real-time rate API
cd frontend/scripts
python3 test_real_time_rates.py

# Run front-end component tests
cd frontend
npm run test

# Test prediction model
cd news-sentiment-prediction
python3 predict_api_multimodal_transformer.py JPY 5
```

## 🚨 Troubleshooting

### Common Issues

1. **Port in Use**

   ```bash
   lsof -i :3000
   lsof -i :5002
   ./stop_system.sh
   ```

2. **Dependency Installation Errors**

   ```bash
   rm -rf frontend/node_modules
   rm frontend/package-lock.json
   ./start_system.sh
   ```

3. **Missing Python Modules**

   ```bash
   cd news-sentiment-prediction
   pip install -r requirements.txt --force-reinstall
   ```

4. **Real-Time Rate Failures**

   ```bash
   ./check_network.sh
   curl -X POST http://localhost:5002/get_real_time_rate \
     -H "Content-Type: application/json" \
     -d '{"from_currency":"CNY","to_currency":"JPY"}'
   ```

### Viewing Logs

```bash
# Tail application logs
tail -f nohup.out

# Backend logs
tail -f logs/backend.log

# Front-end dev logs
cd frontend && npm run dev
```

## 📈 Performance Optimization

* **Caching**: Cache rates for 30 seconds to reduce API calls.
* **Model Batching**: Support batch predictions for higher throughput.
* **Front-End**: Employ Next.js SSR and lazy-loaded components.

## 🔒 Security

* API keys managed via environment variables—no hardcoding.
* External calls have timeouts and error handling.
* Input validation and sanitization for user requests.
* HTTPS recommended for production.

## 🤝 Contribution Guide

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License—see the [LICENSE](LICENSE) file for details.

## 📞 Contact

* **Maintainers**: Group 5 Team
* **Support**: Submit issues on GitHub
* **Feature Requests**: Open enhancement requests

---

**🎯 Let intelligent analytics guide your currency-exchange decisions!**
