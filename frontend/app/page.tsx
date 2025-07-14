"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SimpleLineChart } from "@/components/ui/chart" // Import SimpleLineChart from chart.tsx
import { useToast } from "@/hooks/use-toast" // Import useToast hook
import {
  TrendingUp,
  DollarSign,
  Loader2,
  RefreshCw,
  BarChart3,
  Brain,
  Trophy,
  Target,
  Zap,
  Database,
  Activity,
  Newspaper,
  Clock,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Star,
  UploadCloud,
} from "lucide-react"

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  // Removed 'rate' property as it will be fetched dynamically
}

interface PurchaseRequest {
  amount: number // Amount of target currency to purchase
  fromCurrency: string // Base currency (e.g., CNY)
  toCurrency: string // Target currency (e.g., USD)
  urgency: "LOW" | "MEDIUM" | "HIGH"
  // Removed location
  preferredMethod: "CASH" | "DIGITAL" | "BOTH"
  maxFee: number
  // Removed purpose
  // Removed travelDate
  notes: string
}

interface OptimalStrategy {
  id: string
  channel: string
  channelType: string
  rate: number // Rate of fromCurrency per toCurrency (e.g., CNY per USD)
  fees: number // Percentage fee
  totalCost: number // Total cost in fromCurrency (e.g., CNY)
  savings: number // Savings in fromCurrency (e.g., CNY)
  timeRequired: string
  stepsInfo: { channelType: string; purpose: string }
  prosKeys: string[]
  consKeys: string[]
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  confidence: number
  alternatives: Array<{
    channel: string
    rate: number
    fees: number
    totalCost: number // Total cost in fromCurrency (e.g., CNY)
    timeRequired: string
  }>
  // New fields for financial data
  technicalIndicators?: {
    rsi: number
    macd: number
    bollinger: "UPPER" | "MIDDLE" | "LOWER"
    support: number
    resistance: number
  }
  marketSentiment?: {
    score: number
    trend: "BULLISH" | "BEARISH" | "NEUTRAL"
    volatility: number
  }
  marketConditions?: {
    volatility: number
    trend: string
    liquidity: string
    recommendation: string
  }
}

interface SystemModule {
  id: string
  nameKey: string // Changed from 'name' to 'nameKey' for translation
  status: "active" | "processing" | "idle" | "error"
  progress: number
  lastUpdate: Date
}

interface CompetitionRound {
  round: number
  userStrategy: ExchangeStrategy
  aiStrategy: ExchangeStrategy
  winner: "user" | "ai" | "tie"
  userProfit: number
  aiProfit: number
  marketCondition: string
  fromCurrency: string // Added for AI competition context
  toCurrency: string // Added for AI competition context
}

interface ExchangeStrategy {
  id: string
  name: string
  type: "AGGRESSIVE" | "CONSERVATIVE" | "BALANCED" | "CUSTOM"
  buyThreshold: number
  sellThreshold: number
  riskLevel: number
  expectedReturn: number
  confidence: number
}

interface GameSession {
  id: string
  rounds: CompetitionRound[]
  userScore: number
  aiScore: number
  currentRound: number
  totalRounds: number
  status: "waiting" | "playing" | "finished"
  startTime: Date
}

interface LanguageTexts {
  [key: string]: {
    zh: string
    en: string
  }
}

interface ExchangeRatePoint {
  time: string
  rate: number
  timestamp: number
}

interface MockChannel {
  id: string
  nameKey: string // Key for translation
  type: string
  baseRateModifier: number
  baseFeeRate: number
  timeFactors: { LOW: string; MEDIUM: string; HIGH: string }
  prosKeys: string[] // Keys for translation
  consKeys: string[] // Keys for translation
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  confidence: number
  supportsCash: boolean
  supportsDigital: boolean
}

const currencies: Currency[] = [
  { code: "USD", name: "美元", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "欧元", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "英镑", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "日元", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", name: "人民币", symbol: "¥", flag: "🇨🇳" },
  { code: "KRW", name: "韩元", symbol: "₩", flag: "🇰🇷" },
  { code: "AUD", name: "澳元", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "加元", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "瑞士法郎", symbol: "CHF", flag: "🇨🇭" },
  { code: "HKD", name: "港币", symbol: "HK$", flag: "🇭🇰" },
  { code: "SGD", name: "新加坡元", symbol: "S$", flag: "🇸🇬" },
  { code: "THB", name: "泰铢", symbol: "฿", flag: "🇹🇭" },
  { code: "MYR", name: "马来西亚林吉特", symbol: "RM", flag: "🇲🇾" },
  { code: "VND", name: "越南盾", symbol: "₫", flag: "🇻🇳" },
  { code: "PHP", name: "菲律宾比索", symbol: "₱", flag: "🇵🇭" },
]

const mockChannels: MockChannel[] = [
  {
    id: "major_bank",
    nameKey: "majorBankBranch",
    type: "BANK",
    baseRateModifier: 1.0,
    baseFeeRate: 0.5,
    timeFactors: { LOW: "1-2天", MEDIUM: "2-4小时", HIGH: "1小时" },
    prosKeys: ["rateDiscount", "safeReliable", "manyBranches", "largeAmountSupport"],
    consKeys: ["appointmentNeeded", "businessHoursLimit", "queuePossible"],
    riskLevel: "LOW",
    confidence: 92,
    supportsCash: true,
    supportsDigital: true,
  },
  {
    id: "online_bank",
    nameKey: "mobileBankingApp",
    type: "ONLINE",
    baseRateModifier: 1.002,
    baseFeeRate: 0.3,
    timeFactors: { LOW: "即时", MEDIUM: "即时", HIGH: "即时" },
    prosKeys: ["24hAvailable", "lowFees", "convenientOperation", "noQueue"],
    consKeys: ["digitalOnly", "amountLimit", "onlineBankingRequired"],
    riskLevel: "LOW",
    confidence: 90,
    supportsCash: false,
    supportsDigital: true,
  },
  {
    id: "airport_exchange",
    nameKey: "airportExchange",
    type: "AIRPORT",
    baseRateModifier: 0.985,
    baseFeeRate: 2.0,
    timeFactors: { LOW: "30分钟", MEDIUM: "30分钟", HIGH: "30分钟" },
    prosKeys: ["convenientForTravel", "instantCash", "noAppointment"],
    consKeys: ["worseRate", "highFees", "airportOnly"],
    riskLevel: "MEDIUM",
    confidence: 75,
    supportsCash: true,
    supportsDigital: false,
  },
  {
    id: "exchange_shop",
    nameKey: "exchangeShop",
    type: "EXCHANGE_SHOP",
    baseRateModifier: 0.995,
    baseFeeRate: 1.0,
    timeFactors: { LOW: "1小时", MEDIUM: "1小时", HIGH: "30分钟" },
    prosKeys: ["betterRate", "professionalService", "simpleProcedure"],
    consKeys: ["fewerBranches", "businessHoursLimit", "stockShortage"],
    riskLevel: "MEDIUM",
    confidence: 80,
    supportsCash: true,
    supportsDigital: false,
  },
  {
    id: "atm_overseas",
    nameKey: "overseasATMWithdrawal",
    type: "ATM",
    baseRateModifier: 0.998,
    baseFeeRate: 1.5,
    timeFactors: { LOW: "uponArrival", MEDIUM: "uponArrival", HIGH: "uponArrival" },
    prosKeys: ["cashUponArrival", "realtimeRate", "24hAvailable"],
    consKeys: ["overseasOperation", "amountLimit", "atmAvailability"],
    riskLevel: "MEDIUM",
    confidence: 85,
    supportsCash: true,
    supportsDigital: true,
  },
]

export default function CurrencyExchangeSystem() {
  const { toast } = useToast() // Initialize useToast hook

  // Language State
  const [language, setLanguage] = useState<"zh" | "en">("zh")

  // Active Tab State
  const [activeTab, setActiveTab] = useState("purchase")

  // Trading Pair State (for AI Competition)
  const [tradingPair, setTradingPair] = useState({
    from: "USD",
    to: "CNY",
  })

  // Exchange Rate History (for AI Competition chart)
  const [rateHistory, setRateHistory] = useState<ExchangeRatePoint[]>([])

  // Exchange Rate History (for Purchase Strategy chart)
  const [purchaseRateHistory, setPurchaseRateHistory] = useState<ExchangeRatePoint[]>([])

  // Fetched Rates State (CNY per X currency)
  const [fetchedRates, setFetchedRates] = useState<Record<string, number>>({})

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Language texts
  const texts: LanguageTexts = {
    systemTitle: { zh: "智能货币兑换策略系统", en: "Intelligent Currency Exchange Strategy System" },
    purchaseStrategy: { zh: "购钞策略", en: "Purchase Strategy" },
    systemMonitor: { zh: "系统监控", en: "System Monitor" },
    strategyAnalysis: { zh: "策略分析", en: "Strategy Analysis" },
    aiCompetition: { zh: "AI对战", en: "AI Competition" },
    resultsDisplay: { zh: "结果展示", en: "Results Display" },
    tradingPair: { zh: "交易货币对", en: "Trading Pair" },
    exchangeRateChart: { zh: "汇率走势图", en: "Exchange Rate Chart" },
    currentRate: { zh: "当前汇率", en: "Current Rate" },
    userStrategy: { zh: "你的策略配置", en: "Your Strategy Config" },
    aiStrategyAnalysis: { zh: "AI策略分析", en: "AI Strategy Analysis" },
    startCompetition: { zh: "开始AI对战", en: "Start AI Competition" },
    competitionInProgress: { zh: "对战进行中...", en: "Competition in Progress..." },
    round: { zh: "轮", en: "Round" },
    yourWins: { zh: "你的胜场", en: "Your Wins" },
    aiWins: { zh: "AI Wins", en: "AI Wins" },
    strategyType: { zh: "策略类型", en: "Strategy Type" },
    buyThreshold: { zh: "买入阈值", en: "Buy Threshold" },
    sellThreshold: { zh: "卖出阈值", en: "Sell Threshold" },
    riskLevel: { zh: "风险等级", en: "Risk Level" },
    expectedReturn: { zh: "预期收益", en: "Expected Return" },
    confidence: { zh: "置信度", en: "Confidence" },
    aggressive: { zh: "激进型", en: "Aggressive" },
    conservative: { zh: "保守型", en: "Conservative" },
    balanced: { zh: "平衡型", en: "Balanced" },
    custom: { zh: "自定义", en: "Custom" },
    restart: { zh: "重新开始", en: "Restart" },
    competing: { zh: "对战中...", en: "Competing..." },
    purchaseRequirement: { zh: "购钞需求输入", en: "Purchase Requirement Input" },
    purchaseRequirementDesc: {
      zh: "请详细填写您的购钞需求，我们将为您推荐最优策略",
      en: "Please fill in your purchase requirements in detail, we will recommend the optimal strategy for you",
    },
    optimalPurchaseStrategy: { zh: "最优购钞策略", en: "Optimal Purchase Strategy" },
    optimalPurchaseStrategyDesc: {
      zh: "基于您的需求分析的最佳方案",
      en: "Best solution based on your requirement analysis",
    },
    purchaseAmount: { zh: "购买金额", en: "Purchase Amount" },
    baseCurrency: { zh: "本币种类", en: "Base Currency" },
    targetCurrency: { zh: "目标货币", en: "Target Currency" },
    urgencyLevel: { zh: "紧急程度", en: "Urgency Level" },
    notUrgent: { zh: "不急 (1-3天)", en: "Not Urgent (1-3 days)" },
    normal: { zh: "一般 (当天)", en: "Normal (Same day)" },
    urgent: { zh: "紧急 (2小时内)", en: "Urgent (Within 2 hours)" },
    preferredMethod: { zh: "偏好方式", en: "Preferred Method" },
    cash: { zh: "现钞", en: "Cash" },
    digital: { zh: "电汇", en: "Wire Transfer" },
    both: { zh: "都可以", en: "Both" },
    // Removed location: { zh: "所在城市", en: "Location" },
    maxFee: { zh: "最大手续费 (%)", en: "Max Fee (%)" },
    // Removed purpose: { zh: "购汇用途", en: "Purpose" },
    // Removed travelDate: { zh: "出行日期 (可选)", en: "Travel Date (Optional)" },
    notes: { zh: "备注说明", en: "Notes" },
    getOptimalStrategy: { zh: "获取最优购钞策略", en: "Get Optimal Purchase Strategy" },
    analyzing: { zh: "智能分析中...", en: "Analyzing..." },
    waitingForAnalysis: { zh: "等待策略分析", en: "Waiting for Analysis" },
    fillRequirements: {
      zh: '请填写购钞需求并点击"获取最优购钞策略"',
      en: 'Please fill in purchase requirements and click "Get Optimal Purchase Strategy"',
    },
    // 用途选项 (Removed as purpose is removed)
    // tourism: { zh: "旅游", en: "Tourism" },
    // study: { zh: "留学", en: "Study Abroad" },
    // business: { zh: "商务出差", en: "Business Trip" },
    // investment: { zh: "投资理财", en: "Investment" },
    // immigration: { zh: "移民定居", en: "Immigration" },
    // other: { zh: "其他", en: "Other" },
    // New financial data translations
    past30DataPoints: { zh: "过去30个数据点", en: "Past 30 Data Points" },
    financialIndicators: { zh: "金融指标分析", en: "Financial Indicator Analysis" },
    technicalIndicators: { zh: "技术指标", en: "Technical Indicators" },
    marketSentiment: { zh: "市场情绪", en: "Market Sentiment" },
    marketOverview: { zh: "市场概况", en: "Market Overview" },
    rsi: { zh: "RSI", en: "RSI" },
    macd: { zh: "MACD", en: "MACD" },
    bollingerBands: { zh: "布林带", en: "Bollinger Bands" },
    supportLevel: { zh: "支撑位", en: "Support Level" },
    resistanceLevel: { zh: "阻力位", en: "Resistance Level" },
    sentimentScore: { zh: "情绪得分", en: "Sentiment Score" },
    trend: { zh: "趋势", en: "Trend" },
    volatility: { zh: "波动率", en: "Volatility" },
    currentVolatility: { zh: "当前波动率", en: "Current Volatility" },
    marketTrend: { zh: "市场趋势", en: "Market Trend" },
    liquidity: { zh: "流动性", en: "Liquidity" },
    suggestion: { zh: "建议", en: "Suggestion" },
    // New translations for results display
    recommendedChannel: { zh: "推荐渠道", en: "Recommended Channel" },
    confidenceLevel: { zh: "置信度", en: "Confidence Level" },
    exchangeRate: { zh: "汇率", en: "Exchange Rate" },
    fees: { zh: "手续费", en: "Fees" },
    completionTime: { zh: "完成时间", en: "Completion Time" },
    costDetails: { zh: "费用明细", en: "Cost Details" },
    purchaseTargetAmount: { zh: "购买目标货币数量", en: "Purchase Target Amount" },
    totalCost: { zh: "总成本", en: "Total Cost" },
    estimatedSavings: { zh: "预计节省", en: "Estimated Savings" },
    operationSteps: { zh: "操作步骤", en: "Operation Steps" },
    advantages: { zh: "优势", en: "Advantages" },
    precautions: { zh: "注意事项", en: "Precautions" },
    alternativeOptions: { zh: "备选方案", en: "Alternative Options" },
    selectThisPlan: { zh: "选择此方案", en: "Select This Plan" },
    reAnalyze: { zh: "重新分析", en: "Re-analyze" },
    // System Monitor
    systemModuleMonitoring: { zh: "系统模块监控", en: "System Module Monitoring" },
    realtimeMonitorDesc: {
      zh: "实时监控各模块运行状态和数据流",
      en: "Real-time monitoring of module status and data flow",
    },
    newsDataCollection: { zh: "新闻数据收集", en: "News Data Collection" }, // New translation key
    sentimentScoring: { zh: "情感打分", en: "Sentiment Scoring" }, // New translation key
    exchangeRateCollection: { zh: "汇率收集", en: "Exchange Rate Collection" }, // New translation key
    predictionModel: { zh: "预测模型", en: "Prediction Model" }, // New translation key
    strategyDatabase: { zh: "策略数据库", en: "Strategy Database" }, // New translation key
    marketVolatility: { zh: "市场波动率", en: "Market Volatility" },
    past24Hours: { zh: "过去24小时", en: "Past 24 Hours" },
    sentimentIndex: { zh: "情感指数", en: "Sentiment Index" },
    optimistic: { zh: "乐观", en: "Optimistic" },
    pessimistic: { zh: "悲观", en: "Pessimistic" },
    neutral: { zh: "中性", en: "Neutral" },
    newsCount: { zh: "新闻数量", en: "News Count" },
    todayRelatedNews: { zh: "今日相关新闻", en: "Today's Related News" },
    activeCurrencyPairs: { zh: "活跃货币对", en: "Active Currency Pairs" },
    supportedCurrencies: { zh: "支持的货币种类", en: "Supported Currencies" },
    // Strategy Analysis
    analysisWeightConfig: { zh: "分析权重配置", en: "Analysis Weight Configuration" },
    adjustAnalysisWeights: { zh: "调整不同分析维度的权重", en: "Adjust weights for different analysis dimensions" },
    sentimentAnalysis: { zh: "情感分析", en: "Sentiment Analysis" },
    technicalAnalysis: { zh: "技术分析", en: "Technical Analysis" },
    fundamentalAnalysis: { zh: "基本面分析", en: "Fundamental Analysis" },
    riskAssessment: { zh: "风险评估", en: "Risk Assessment" },
    timingSelection: { zh: "时机选择", en: "Timing Selection" },
    // AI Competition
    baseCurrencyLabel: { zh: "基础货币", en: "Base Currency" },
    targetCurrencyLabel: { zh: "目标货币", en: "Target Currency" },
    exchangeRateChartTitle: { zh: "汇率走势图 (过去30个数据点)", en: "Exchange Rate Chart (Past 30 Data Points)" },
    volatilityLabel: { zh: "波动率", en: "Volatility" },
    trendLabel: { zh: "趋势", en: "Trend" },
    sentimentLabel: { zh: "情绪", en: "Sentiment" },
    upward: { zh: "↗️ 上升", en: "↗️ Upward" },
    downward: { zh: "↘️ 下降", en: "↘️ Downward" },
    stable: { zh: "➡️ 平稳", en: "➡️ Stable" },
    aiCompetitionConsole: { zh: "AI对战控制台", en: "AI Competition Console" },
    startAICompetition: { zh: "开始AI对战", en: "Start AI Competition" },
    prepareToStartAICompetition: { zh: "准备开始AI对战", en: "Ready to Start AI Competition" },
    competitionDescription: {
      zh: "与AI进行5轮策略对战，看看谁的策略更优秀！",
      en: "Compete with AI in 5 rounds to see whose strategy is better!",
    },
    roundDisplay: { zh: "第{round}轮", en: "Round {round}" },
    youWon: { zh: "你赢了", en: "You Won" },
    aiWon: { zh: "AI赢了", en: "AI Won" },
    tie: { zh: "平局", en: "Tie" },
    yourProfit: { zh: "你的收益", en: "Your Profit" },
    aiProfit: { zh: "AI收益", en: "AI Profit" },
    marketCondition: { zh: "市场条件", en: "Market Condition" },
    waitingForCompetition: { zh: "等待对战开始", en: "Waiting for Competition to Start" },
    aiAnalysisAfterStart: {
      zh: "开始对战后将显示AI策略分析",
      en: "AI strategy analysis will be displayed after the competition starts",
    },
    latestAIStrategy: { zh: "最新AI策略", en: "Latest AI Strategy" },
    strategyTypeAI: { zh: "策略类型", en: "Strategy Type" },
    confidenceAI: { zh: "置信度", en: "Confidence" },
    riskLevelAI: { zh: "风险等级", en: "Risk Level" },
    expectedReturnAI: { zh: "预期收益", en: "Expected Return" },
    aiPerformanceAnalysis: { zh: "AI表现分析", en: "AI Performance Analysis" },
    profitableRounds: { zh: "盈利轮次", en: "Profitable Rounds" },
    lossRounds: { zh: "亏损轮次", en: "Loss Rounds" },
    averageReturn: { zh: "平均收益", en: "Average Return" },
    strategyEvolution: { zh: "策略演化", en: "Strategy Evolution" },
    aiLearningDesc: {
      zh: "AI会根据市场条件和对战结果动态调整策略，学习能力随轮次增强。",
      en: "AI dynamically adjusts strategies based on market conditions and competition results, with learning ability increasing with each round.",
    },
    congratulationsWin: { zh: "恭喜你获胜！", en: "Congratulations, you won!" },
    aiWin: { zh: "AI获胜！", en: "AI Won!" },
    tieGame: { zh: "平局！", en: "Tie Game!" },
    strategySummary: { zh: "策略摘要", en: "Strategy Summary" },
    type: { zh: "类型", en: "Type" },
    configureYourStrategy: { zh: "配置你的交易策略参数", en: "Configure your trading strategy parameters" },
    realtimeData: { zh: "实时数据流", en: "Real-time Data Stream" },
    aiAnalysis: { zh: "AI智能分析", en: "AI Intelligent Analysis" },
    strategyOptimization: { zh: "策略优化", en: "Strategy Optimization" },
    // Channel names
    majorBankBranch: { zh: "中国银行网点", en: "Major Bank Branch" },
    mobileBankingApp: { zh: "手机银行APP", en: "Mobile Banking App" },
    airportExchange: { zh: "机场兑换", en: "Airport Exchange" },
    exchangeShop: { zh: "专业兑换店", en: "Professional Exchange Shop" },
    overseasATMWithdrawal: { zh: "境外ATM取现", en: "Overseas ATM Withdrawal" },
    // Pros & Cons
    rateDiscount: { zh: "汇率优惠", en: "Favorable Exchange Rate" },
    safeReliable: { zh: "安全可靠", en: "Safe and Reliable" },
    manyBranches: { zh: "网点众多", en: "Numerous Branches" },
    largeAmountSupport: { zh: "支持大额兑换", en: "Supports Large Amounts" },
    appointmentNeeded: { zh: "需要预约", en: "Appointment Needed" },
    businessHoursLimit: { zh: "营业时间限制", en: "Limited Business Hours" },
    queuePossible: { zh: "可能需要排队", en: "Possible Queues" },
    "24hAvailable": { zh: "24小时可用", en: "24-Hour Availability" },
    lowFees: { zh: "手续费低", en: "Low Fees" },
    convenientOperation: { zh: "操作便捷", en: "Convenient Operation" },
    noQueue: { zh: "无需排队", en: "No Queues" },
    digitalOnly: { zh: "仅支持电汇", en: "Digital Transfer Only" },
    amountLimit: { zh: "有额度限制", en: "Amount Limits Apply" },
    onlineBankingRequired: { zh: "需要网银", en: "Online Banking Required" },
    convenientForTravel: { zh: "出行时方便兑换", en: "Convenient for Travel" },
    instantCash: { zh: "即时取钞", en: "Instant Cash Withdrawal" },
    noAppointment: { zh: "无需预约", en: "No Appointment Needed" },
    worseRate: { zh: "汇率较差", en: "Worse Exchange Rate" },
    highFees: { zh: "手续费高", en: "High Fees" },
    airportOnly: { zh: "仅在机场可用", en: "Available Only at Airports" },
    betterRate: { zh: "汇率较好", en: "Better Exchange Rate" },
    professionalService: { zh: "专业服务", en: "Professional Service" },
    simpleProcedure: { zh: "手续简便", en: "Simple Procedure" },
    fewerBranches: { zh: "网点较少", en: "Fewer Branches" },
    stockShortage: { zh: "可能缺货", en: "Possible Stock Shortage" },
    cashUponArrival: { zh: "到达后取现", en: "Cash Upon Arrival" },
    realtimeRate: { zh: "汇率实时", en: "Real-time Rate" },
    atmAvailability: { zh: "依赖ATM可用性", en: "Depends on ATM Availability" },
    overseasOperation: { zh: "需要境外操作", en: "Requires Overseas Operation" },
    // Time factors
    uponArrival: { zh: "到达后即时", en: "Instant upon arrival" },
    planSelected: { zh: "方案已选择！", en: "Plan selected!" },
    reanalyzing: { zh: "正在重新分析...", en: "Re-analyzing..." },
    aiCurrentStrategyAnalysis: { zh: "AI当前策略分析", en: "AI Current Strategy Analysis" },
    // New translations for CSV import
    importNewsData: { zh: "导入新闻数据", en: "Import News Data" },
    importNewsDataDesc: {
      zh: "从CSV文件导入新闻数据以更新新闻数量和情感指数",
      en: "Import news data from a CSV file to update news count and sentiment index",
    },
    selectCsvFile: { zh: "选择CSV文件", en: "Select CSV File" },
    uploadCsv: { zh: "上传CSV", en: "Upload CSV" },
    uploading: { zh: "上传中...", en: "Uploading..." },
    selectedFile: { zh: "已选择文件", en: "Selected File" },
    uploadSuccess: { zh: "上传成功", en: "Upload Successful" },
    uploadFailed: { zh: "上传失败", en: "Upload Failed" },
    uploadError: { zh: "上传错误", en: "Upload Error" },
    noFileSelected: { zh: "未选择文件", en: "No file selected" },
    pleaseSelectCsv: { zh: "请选择一个CSV文件上传。", en: "Please select a CSV file to upload." },
  }

  const t = (key: string, params?: { [key: string]: string | number }) => {
    let text = texts[key]?.[language] || key
    if (params) {
      for (const p in params) {
        text = text.replace(`{${p}}`, String(params[p]))
      }
    }
    return text
  }

  // Helper to get channel-specific steps
  const getChannelSteps = (channelType: string, purpose: string, currentLanguage: "zh" | "en") => {
    const baseSteps: { [key: string]: { zh: string[]; en: string[] } } = {
      BANK: {
        zh: ["在线预约银行网点", "准备身份证和购汇申请材料", "前往指定网点办理", "完成购汇并取钞"],
        en: [
          "Book bank appointment online",
          "Prepare ID and foreign exchange application materials",
          "Visit the designated branch",
          "Complete exchange and collect foreign currency",
        ],
      },
      ONLINE: {
        zh: ["登录手机银行APP", "选择外汇兑换功能", "输入兑换金额和币种", "确认交易并完成支付"],
        en: [
          "Log in to mobile banking app",
          "Select foreign exchange function",
          "Enter amount and currency",
          "Confirm transaction and complete payment",
        ],
      },
      AIRPORT: {
        zh: ["前往机场兑换柜台", "出示身份证和机票", "填写兑换申请表", "完成兑换并取钞"],
        en: [
          "Go to airport exchange counter",
          "Show ID and flight ticket",
          "Fill out exchange application form",
          "Complete exchange and collect foreign currency",
        ],
      },
      EXCHANGE_SHOP: {
        zh: ["查找附近的兑换店", "携带身份证前往", "确认汇率和手续费", "完成兑换交易"],
        en: [
          "Find a nearby exchange shop",
          "Bring ID",
          "Confirm exchange rate and fees",
          "Complete exchange transaction",
        ],
      },
      ATM: {
        zh: ["确认目的地ATM网络", "开通境外取现功能", "到达后寻找合作ATM", "使用银行卡直接取现"],
        en: [
          "Confirm destination ATM network",
          "Activate overseas withdrawal function",
          "Find a partner ATM upon arrival",
          "Withdraw cash directly with your bank card",
        ],
      },
    }

    let steps = baseSteps[channelType]?.[currentLanguage] || baseSteps.BANK[currentLanguage]

    // Add purpose-specific steps (keeping this logic even if purpose input is removed, for potential future use or mock consistency)
    if (purpose === "留学") {
      steps = [
        ...steps.slice(0, 1),
        currentLanguage === "zh" ? "准备留学相关证明材料" : "Prepare study-related documents",
        ...steps.slice(1),
      ]
    } else if (purpose === "移民") {
      steps = [
        ...steps.slice(0, 1),
        currentLanguage === "zh" ? "准备移民签证等相关文件" : "Prepare immigration visa and related documents",
        ...steps.slice(1),
      ]
    }
    return steps
  }

  // Purchase Request State
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest>({
    amount: 1000, // Assuming this is the amount of TARGET currency user wants to buy (e.g., 1000 USD)
    fromCurrency: "CNY", // Base currency (e.g., CNY)
    toCurrency: "USD", // Target currency (e.g., USD)
    urgency: "MEDIUM",
    // location: "北京", // Removed
    preferredMethod: "BOTH",
    maxFee: 2.0,
    // purpose: "旅游", // Removed
    // travelDate: "", // Removed
    notes: "",
  })

  const [optimalStrategy, setOptimalStrategy] = useState<OptimalStrategy | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null) // New state for selected plan

  // System State
  const [systemModules, setSystemModules] = useState<SystemModule[]>([
    { id: "news", nameKey: "newsDataCollection", status: "active", progress: 85, lastUpdate: new Date() },
    { id: "sentiment", nameKey: "sentimentScoring", status: "processing", progress: 60, lastUpdate: new Date() },
    { id: "rates", nameKey: "exchangeRateCollection", status: "active", progress: 95, lastUpdate: new Date() },
    { id: "prediction", nameKey: "predictionModel", status: "processing", progress: 40, lastUpdate: new Date() },
    { id: "strategy", nameKey: "strategyDatabase", status: "active", progress: 100, lastUpdate: new Date() },
    // Removed "optimization" module as requested
  ])

  // Competition State
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [isCompeting, setIsCompeting] = useState(false)
  const [userStrategy, setUserStrategy] = useState<ExchangeStrategy>({
    id: "user_strategy",
    name: "用户策略",
    type: "BALANCED",
    buyThreshold: 0.02,
    sellThreshold: 0.03,
    riskLevel: 3,
    expectedReturn: 5.0,
    confidence: 75,
  })

  // Market Data
  const [marketData, setMarketData] = useState({
    volatility: 1.2,
    sentiment: 0.0, // Initialized to 0.0 as requested
    newsCount: 0, // Initialized to 0 as requested
    trendDirection: "up" as "up" | "down" | "stable",
  })

  // Analysis State
  const [analysisWeights, setAnalysisWeights] = useState({
    sentiment: 30,
    technical: 25,
    fundamental: 20,
    risk: 15,
    timing: 10,
  })

  // Fetch latest rates from Frankfurter API
  const fetchLatestRates = async () => {
    try {
      // Fetch rates with CNY as base
      const response = await fetch("https://api.frankfurter.app/latest?from=CNY")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const ratesFromCNY = data.rates // This gives X per CNY (e.g., USD: 0.1382 means 1 CNY = 0.1382 USD)

      const invertedRates: Record<string, number> = {
        CNY: 1.0, // CNY to CNY is 1
      }
      // Invert rates to be CNY per X currency (e.g., CNY per USD)
      for (const currencyCode in ratesFromCNY) {
        if (ratesFromCNY.hasOwnProperty(currencyCode)) {
          invertedRates[currencyCode] = 1 / ratesFromCNY[currencyCode]
        }
      }
      setFetchedRates(invertedRates)
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error)
      // Fallback to some default rates if API fails
      setFetchedRates({
        USD: 7.2345,
        EUR: 7.8901,
        GBP: 9.1234,
        JPY: 0.0543,
        CNY: 1.0,
        KRW: 0.0055,
        AUD: 4.8567,
        CAD: 5.3421,
        CHF: 8.1234,
        HKD: 0.9234,
        SGD: 5.4321,
        THB: 0.2012,
        MYR: 1.5432,
        VND: 0.0003,
        PHP: 0.1287,
      })
    }
  }

  // Initial fetch and periodic refresh for rates
  useEffect(() => {
    fetchLatestRates()
    const interval = setInterval(fetchLatestRates, 60 * 60 * 1000) // Refresh every hour
    return () => clearInterval(interval)
  }, [])

  // Generate initial rate history for AI Competition chart
  useEffect(() => {
    const generateRateHistory = () => {
      const history: ExchangeRatePoint[] = []
      // Use fetchedRates for the base rate, calculating X per Y
      const baseRate = fetchedRates[tradingPair.to] / fetchedRates[tradingPair.from] || 1.0 // Default to 1.0 if rates not available
      const now = Date.now()

      for (let i = 29; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000 // 30 days of data
        const variation = (Math.random() - 0.5) * 0.01 // Smaller variation for real data simulation
        const rate = baseRate * (1 + variation)

        history.push({
          time: new Date(timestamp).toLocaleDateString(),
          rate: Number(rate.toFixed(4)),
          timestamp,
        })
      }
      return history
    }

    if (Object.keys(fetchedRates).length > 0) {
      setRateHistory(generateRateHistory())
    }
  }, [tradingPair.from, tradingPair.to, fetchedRates]) // Depend on fetchedRates

  // Update rate history for AI Competition chart in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setRateHistory((prev) => {
        const newHistory = [...prev]
        const lastRate = newHistory[newHistory.length - 1]?.rate || 1.0
        const variation = (Math.random() - 0.5) * 0.005 // Even smaller variation for real-time
        const newRate = lastRate * (1 + variation)

        // Add new point
        newHistory.push({
          time: new Date().toLocaleTimeString(),
          rate: Number(newRate.toFixed(4)),
          timestamp: Date.now(),
        })

        // Keep only last 30 points
        return newHistory.slice(-30)
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Generate initial rate history for Purchase Strategy chart
  useEffect(() => {
    const generatePurchaseRateHistory = () => {
      const history: ExchangeRatePoint[] = []
      // Use fetchedRates for the base rate (CNY per target currency)
      const baseRate = fetchedRates[purchaseRequest.toCurrency] || 1.0 // Default to 1.0 if rates not available
      const now = Date.now()

      for (let i = 29; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000 // 30 days of data
        const variation = (Math.random() - 0.5) * 0.01 // Smaller variation
        const rate = baseRate * (1 + variation)

        history.push({
          time: new Date(timestamp).toLocaleDateString(),
          rate: Number(rate.toFixed(4)),
          timestamp,
        })
      }
      return history
    }

    if (Object.keys(fetchedRates).length > 0) {
      setPurchaseRateHistory(generatePurchaseRateHistory())
    }

    const interval = setInterval(() => {
      setPurchaseRateHistory((prev) => {
        const newHistory = [...prev]
        const lastRate = newHistory[newHistory.length - 1]?.rate || 1.0
        const variation = (Math.random() - 0.5) * 0.005 // Even smaller variation for real-time
        const newRate = lastRate * (1 + variation)

        newHistory.push({
          time: new Date().toLocaleTimeString(),
          rate: Number(newRate.toFixed(4)),
          timestamp: Date.now(),
        })

        return newHistory.slice(-30)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [purchaseRequest.fromCurrency, purchaseRequest.toCurrency, fetchedRates]) // Depend on purchaseRequest currencies and fetchedRates

  useEffect(() => {
    // Simulate real-time data updates for modules and market data (excluding newsCount and sentiment)
    const interval = setInterval(() => {
      setSystemModules((prev) =>
        prev.map((module) => ({
          ...module,
          progress: Math.min(100, module.progress + Math.random() * 5),
          lastUpdate: new Date(),
        })),
      )

      setMarketData((prev) => ({
        ...prev,
        volatility: Math.max(0.1, prev.volatility + (Math.random() - 0.5) * 0.1),
        // sentiment and newsCount are now updated via CSV import, so remove random increment here
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Helper function to calculate total cost in fromCurrency (CNY)
  // Assuming `amount` is the desired quantity of `toCurrency`
  const calculateTotalCostInFromCurrency = (
    amount: number, // amount of toCurrency
    fromCurrencyCode: string,
    toCurrencyCode: string,
    feesPercentage: number,
    rateModifier = 1.0, // New parameter for channel-specific rate modification
  ) => {
    // fetchedRates stores CNY per X currency (e.g., fetchedRates['USD'] is CNY per USD)
    const rateCNYPerTarget = fetchedRates[toCurrencyCode]
    const rateCNYPerFrom = fetchedRates[fromCurrencyCode]

    if (!rateCNYPerTarget || !rateCNYPerFrom) {
      console.warn(`Missing rates for ${fromCurrencyCode} or ${toCurrencyCode}. Cannot calculate cost.`)
      return 0
    }

    let effectiveRate: number // This will be the rate of fromCurrency per toCurrency

    if (fromCurrencyCode === "CNY") {
      // If base is CNY, then rate is CNY per target (e.g., CNY/USD)
      effectiveRate = rateCNYPerTarget
    } else {
      // If fromCurrency is not CNY (e.g., USD), and toCurrency is EUR
      // We need USD per EUR. This is (CNY per EUR) / (CNY per USD)
      effectiveRate = rateCNYPerTarget / rateCNYPerFrom
    }

    // Apply the channel-specific rate modifier
    const finalRate = effectiveRate * rateModifier

    // Cost in fromCurrency before fees
    const costBeforeFees = amount * finalRate

    // Fee amount in fromCurrency
    const feeAmount = costBeforeFees * (feesPercentage / 100)

    // Total cost in fromCurrency
    return costBeforeFees + feeAmount
  }

  const analyzePurchaseStrategy = async () => {
    setIsAnalyzing(true)
    setOptimalStrategy(null) // Clear previous results
    setSelectedPlanId(null) // Clear selected plan

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Use fetchedRates for the base rate (CNY per target currency)
      const baseTargetCurrencyRate = fetchedRates[purchaseRequest.toCurrency] || 1.0

      // Select the best channel based on preferences
      let selectedChannel: MockChannel | undefined = mockChannels.find((c) => {
        const supportsMethod =
          purchaseRequest.preferredMethod === "BOTH" ||
          (purchaseRequest.preferredMethod === "CASH" && c.supportsCash) ||
          (purchaseRequest.preferredMethod === "DIGITAL" && c.supportsDigital)
        const meetsUrgency =
          c.timeFactors[purchaseRequest.urgency] === "即时" ||
          c.timeFactors[purchaseRequest.urgency] === "30分钟" ||
          c.timeFactors[purchaseRequest.urgency] === "1小时"
        // Removed location check as it's no longer a parameter
        return supportsMethod && meetsUrgency
      })

      if (!selectedChannel) {
        // Fallback to a default if no specific channel matches all criteria
        selectedChannel = mockChannels.find((c) => c.id === "major_bank") || mockChannels[0]
      }

      // Calculate dynamic fees (simplified for mock)
      const dynamicFees = selectedChannel.baseFeeRate

      // Calculate total cost and savings based on the selected channel
      const totalCost = calculateTotalCostInFromCurrency(
        purchaseRequest.amount,
        purchaseRequest.fromCurrency,
        purchaseRequest.toCurrency,
        dynamicFees,
        selectedChannel.baseRateModifier, // Pass the modifier
      )

      const savings = 150.5 + Math.random() * 100 // Keep mock savings for now

      // Calculate the effective rate for display (fromCurrency per toCurrency, with modifier)
      const displayRate =
        (fetchedRates[purchaseRequest.toCurrency] / fetchedRates[purchaseRequest.fromCurrency]) *
        selectedChannel.baseRateModifier

      const mockStrategy: OptimalStrategy = {
        id: `strategy_${Date.now()}`,
        channel: t(selectedChannel.nameKey),
        channelType: selectedChannel.type,
        rate: Number.parseFloat(displayRate.toFixed(4)), // Use the calculated display rate
        fees: dynamicFees,
        totalCost: Number.parseFloat(totalCost.toFixed(2)),
        savings: Number.parseFloat(savings.toFixed(2)),
        timeRequired: t(selectedChannel.timeFactors[purchaseRequest.urgency]),
        stepsInfo: { channelType: selectedChannel.type, purpose: "旅游" }, // Default purpose as it's removed from input
        prosKeys: selectedChannel.prosKeys,
        consKeys: selectedChannel.consKeys,
        riskLevel: selectedChannel.riskLevel,
        confidence: selectedChannel.confidence,
        alternatives: mockChannels
          .filter((c) => c.id !== selectedChannel?.id)
          .slice(0, 2)
          .map((altChannel) => {
            const altFees = altChannel.baseFeeRate
            const altTotalCost = calculateTotalCostInFromCurrency(
              purchaseRequest.amount,
              purchaseRequest.fromCurrency,
              purchaseRequest.toCurrency,
              altFees,
              altChannel.baseRateModifier, // Pass the modifier
            )
            const altDisplayRate =
              (fetchedRates[purchaseRequest.toCurrency] / fetchedRates[purchaseRequest.fromCurrency]) *
              altChannel.baseRateModifier
            return {
              channel: t(altChannel.nameKey),
              rate: Number.parseFloat(altDisplayRate.toFixed(4)),
              fees: altFees,
              totalCost: Number.parseFloat(altTotalCost.toFixed(2)),
              timeRequired: t(altChannel.timeFactors[purchaseRequest.urgency]),
            }
          }),
        // Simulated financial data
        technicalIndicators: {
          rsi: Math.floor(Math.random() * 100),
          macd: Number.parseFloat(((Math.random() - 0.5) * 2).toFixed(4)),
          bollinger: (["UPPER", "MIDDLE", "LOWER"] as const)[Math.floor(Math.random() * 3)],
          support: Number.parseFloat((7.0 + Math.random() * 0.3).toFixed(4)),
          resistance: Number.parseFloat((7.3 + Math.random() * 0.3).toFixed(4)),
        },
        marketSentiment: {
          score: Math.floor(Math.random() * 100),
          trend: (["BULLISH", "BEARISH", "NEUTRAL"] as const)[Math.floor(Math.random() * 3)],
          volatility: Math.floor(Math.random() * 20) + 10,
        },
        marketConditions: {
          volatility: Number.parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          trend: ["上升", "下降", "稳定"][Math.floor(Math.random() * 3)],
          liquidity: ["高", "中", "低"][Math.floor(Math.random() * 3)],
          recommendation: "建议关注汇率波动，选择合适时机兑换",
        },
      }

      setOptimalStrategy(mockStrategy)
      setActiveTab("results") // Switch to results tab after analysis
    } catch (error) {
      console.error("Strategy analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSelectPlan = (strategyId: string) => {
    setSelectedPlanId(strategyId)
    toast({
      title: t("planSelected"),
      description: `${t("recommendedChannel")}: ${optimalStrategy?.channel}`,
    })
  }

  const handleReAnalyze = () => {
    toast({
      title: t("reanalyzing"),
      description:
        language === "zh"
          ? "系统正在重新评估您的购钞需求。"
          : "The system is re-evaluating your purchase requirements.",
    })
    analyzePurchaseStrategy() // Re-run the analysis
  }

  const startCompetition = async () => {
    setIsCompeting(true)
    const newSession: GameSession = {
      id: `game_${Date.now()}`,
      rounds: [],
      userScore: 0,
      aiScore: 0,
      currentRound: 1,
      totalRounds: 5,
      status: "playing",
      startTime: new Date(),
    }
    setGameSession(newSession)

    // Simulate competition rounds
    for (let round = 1; round <= 5; round++) {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const aiStrategy = generateAIStrategy()
      const roundResult = simulateRound(userStrategy, aiStrategy, round, tradingPair.from, tradingPair.to)

      setGameSession((prev) => {
        if (!prev) return null
        const updatedRounds = [...prev.rounds, roundResult]
        const userWins = updatedRounds.filter((r) => r.winner === "user").length
        const aiWins = updatedRounds.filter((r) => r.winner === "ai").length

        return {
          ...prev,
          rounds: updatedRounds,
          userScore: userWins,
          aiScore: aiWins,
          currentRound: round + 1,
          status: round === 5 ? "finished" : "playing",
        }
      })
    }

    setIsCompeting(false)
  }

  const generateAIStrategy = (): ExchangeStrategy => {
    const strategies = ["AGGRESSIVE", "CONSERVATIVE", "BALANCED"] as const
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)]

    return {
      id: `ai_strategy_${Date.now()}`,
      name: "AI策略",
      type: randomStrategy,
      buyThreshold: 0.01 + Math.random() * 0.04,
      sellThreshold: 0.02 + Math.random() * 0.04,
      riskLevel: Math.floor(Math.random() * 5) + 1,
      expectedReturn: 2 + Math.random() * 8,
      confidence: 70 + Math.random() * 25,
    }
  }

  const simulateRound = (
    userStrat: ExchangeStrategy,
    aiStrat: ExchangeStrategy,
    round: number,
    fromCurrency: string,
    toCurrency: string,
  ): CompetitionRound => {
    const marketConditions = ["牛市", "熊市", "震荡", "突发事件", "政策影响"]
    const condition = marketConditions[Math.floor(Math.random() * marketConditions.length)]

    // In a real scenario, profit calculation would heavily depend on fromCurrency, toCurrency, and marketCondition
    // For this mock, we'll just pass them through for display.
    const userProfit = calculateProfit(userStrat, condition)
    const aiProfit = calculateProfit(aiStrat, condition)

    let winner: "user" | "ai" | "tie" = "tie"
    if (userProfit > aiProfit) winner = "user"
    else if (aiProfit > userProfit) winner = "ai"

    return {
      round,
      userStrategy: userStrat,
      aiStrategy: aiStrat,
      winner,
      userProfit,
      aiProfit,
      marketCondition: condition,
      fromCurrency,
      toCurrency,
    }
  }

  const calculateProfit = (strategy: ExchangeStrategy, marketCondition: string): number => {
    let baseProfit = strategy.expectedReturn

    switch (marketCondition) {
      case "牛市":
        baseProfit *= strategy.type === "AGGRESSIVE" ? 1.5 : 1.2
        break
      case "熊市":
        baseProfit *= strategy.type === "CONSERVATIVE" ? 1.3 : 0.7
        break
      case "震荡":
        baseProfit *= strategy.type === "BALANCED" ? 1.4 : 0.9
        break
      case "突发事件":
        baseProfit *= Math.random() > 0.5 ? 1.8 : 0.3
        break
      case "政策影响":
        baseProfit *= 0.8 + Math.random() * 0.6
        break
    }

    return Number.parseFloat((baseProfit * (0.8 + Math.random() * 0.4)).toFixed(2))
  }

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "idle":
        return "bg-gray-400"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case "news":
        return <Newspaper className="h-5 w-5" />
      case "sentiment":
        return <Activity className="h-5 w-5" />
      case "rates":
        return <TrendingUp className="h-5 w-5" />
      case "prediction":
        return <Brain className="h-5 w-5" />
      case "strategy":
        return <Database className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  // Handle CSV file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  // Handle CSV upload
  const handleUploadCsv = async () => {
    if (!selectedFile) {
      toast({
        title: t("noFileSelected"),
        description: t("pleaseSelectCsv"),
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await fetch("/api/news/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: t("uploadSuccess"),
          description: result.message,
        })
        // Update the newsCount and sentiment in marketData based on the imported count and calculated sentiment
        setMarketData((prev) => ({
          ...prev,
          newsCount: result.importedCount, // Set to the new count from backend
          sentiment: result.overallSentiment, // Update with calculated sentiment
        }))
        setSelectedFile(null) // Clear selected file
      } else {
        toast({
          title: t("uploadFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading CSV:", error)
      toast({
        title: t("uploadError"),
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
            {t("systemTitle")}
          </h1>
          <p className="text-slate-600">
            {language === "zh"
              ? "基于多源数据融合的智能决策平台"
              : "Intelligent Decision Platform Based on Multi-source Data Fusion"}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="animate-pulse">
              🔄 {t("realtimeData")}
            </Badge>
            <Badge variant="outline" className="animate-pulse">
              🤖 {t("aiAnalysis")}
            </Badge>
            <Badge variant="outline" className="animate-pulse">
              🎯 {t("strategyOptimization")}
            </Badge>
          </div>
        </div>

        {/* Language Toggle - Global */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
            className="mb-4"
          >
            {language === "zh" ? "English" : "中文"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="purchase">{t("purchaseStrategy")}</TabsTrigger>
            <TabsTrigger value="results">{t("resultsDisplay")}</TabsTrigger>
            <TabsTrigger value="system">{t("systemMonitor")}</TabsTrigger>
            <TabsTrigger value="analysis">{t("strategyAnalysis")}</TabsTrigger>
            <TabsTrigger value="competition">{t("aiCompetition")}</TabsTrigger>
          </TabsList>

          {/* Purchase Strategy Tab */}
          <TabsContent value="purchase" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              {/* Purchase Request Form */}
              <Card className="animate-slide-in-left">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {t("purchaseRequirement")}
                  </CardTitle>
                  <CardDescription className="text-green-100">{t("purchaseRequirementDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Basic Exchange Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("purchaseAmount")}</Label>
                      <Input
                        type="number"
                        value={purchaseRequest.amount}
                        onChange={(e) =>
                          setPurchaseRequest({ ...purchaseRequest, amount: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder={language === "zh" ? "请输入金额" : "Enter amount"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("baseCurrency")}</Label>
                      <Select
                        value={purchaseRequest.fromCurrency}
                        onValueChange={(value) => setPurchaseRequest({ ...purchaseRequest, fromCurrency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.flag} {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("targetCurrency")}</Label>
                    <Select
                      value={purchaseRequest.toCurrency}
                      onValueChange={(value) => setPurchaseRequest({ ...purchaseRequest, toCurrency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies
                          .filter((c) => c.code !== purchaseRequest.fromCurrency)
                          .map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.flag} {currency.name} ({currency.code}) - {t("exchangeRate")}:{" "}
                              {fetchedRates[currency.code]?.toFixed(4) || "N/A"}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exchange Rate Chart for Purchase Tab */}
                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-medium mb-3 text-center">
                      {t("exchangeRateChart")} ({t("past30DataPoints")})
                    </h4>
                    <div className="w-full overflow-x-auto">
                      <SimpleLineChart data={purchaseRateHistory} width={600} height={200} />
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-3">
                    <Label>{t("urgencyLevel")}</Label>
                    <RadioGroup
                      value={purchaseRequest.urgency}
                      onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                        setPurchaseRequest({ ...purchaseRequest, urgency: value })
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="LOW" id="low" />
                        <Label htmlFor="low" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          {t("notUrgent")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MEDIUM" id="medium" />
                        <Label htmlFor="medium" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          {t("normal")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="HIGH" id="high" />
                        <Label htmlFor="high" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          {t("urgent")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Preferred Method */}
                  <div className="space-y-3">
                    <Label>{t("preferredMethod")}</Label>
                    <RadioGroup
                      value={purchaseRequest.preferredMethod}
                      onValueChange={(value: "CASH" | "DIGITAL" | "BOTH") =>
                        setPurchaseRequest({ ...purchaseRequest, preferredMethod: value })
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CASH" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          {t("cash")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="DIGITAL" id="digital" />
                        <Label htmlFor="digital" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {t("digital")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BOTH" id="both" />
                        <Label htmlFor="both" className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          {t("both")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Max Fee */}
                  <div className="space-y-2">
                    <Label>{t("maxFee")}</Label>
                    <Input
                      type="number"
                      value={purchaseRequest.maxFee}
                      onChange={(e) =>
                        setPurchaseRequest({ ...purchaseRequest, maxFee: Number.parseFloat(e.target.value) || 0 })
                      }
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("notes")}</Label>
                    <Textarea
                      value={purchaseRequest.notes}
                      onChange={(e) => setPurchaseRequest({ ...purchaseRequest, notes: e.target.value })}
                      placeholder={
                        language === "zh"
                          ? "请输入其他特殊要求或说明..."
                          : "Enter other special requirements or notes..."
                      }
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={analyzePurchaseStrategy}
                    disabled={isAnalyzing || Object.keys(fetchedRates).length === 0} // Disable if rates not loaded
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="h-4 w-4 mr-2" />
                    )}
                    {isAnalyzing ? t("analyzing") : t("getOptimalStrategy")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Display Tab */}
          <TabsContent value="results" className="space-y-6">
            {!optimalStrategy ? (
              <div className="text-center py-16 text-slate-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">{t("resultsDisplay")}</h3>
                <p className="text-slate-500">
                  {language === "zh"
                    ? "请先在“购钞策略”页面填写需求并获取最优策略。"
                    : "Please fill in your requirements on the 'Purchase Strategy' page and get the optimal strategy first."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Optimal Strategy Display (Moved from Purchase Tab) - Takes up 2 columns */}
                <Card className="animate-slide-in-left xl:col-span-2">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {t("optimalPurchaseStrategy")}
                    </CardTitle>
                    <CardDescription className="text-blue-100">{t("optimalPurchaseStrategyDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Strategy Overview */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-6 w-6 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-green-800">{optimalStrategy.channel}</h3>
                              <p className="text-sm text-green-600">{t("recommendedChannel")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">{optimalStrategy.confidence}%</div>
                            <div className="text-sm text-green-600">{t("confidenceLevel")}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-green-800">{t("exchangeRate")}</div>
                            <div className="text-green-600">{optimalStrategy.rate.toFixed(4)}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-800">{t("fees")}</div>
                            <div className="text-green-600">{optimalStrategy.fees}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-800">{t("completionTime")}</div>
                            <div className="text-green-600">{optimalStrategy.timeRequired}</div>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {t("costDetails")}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>{t("purchaseTargetAmount")}:</span>
                              <span>
                                {purchaseRequest.amount.toLocaleString()}{" "}
                                {currencies.find((c) => c.code === purchaseRequest.toCurrency)?.symbol}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>
                                {t("exchangeRate")} ({purchaseRequest.fromCurrency}/{purchaseRequest.toCurrency}):
                              </span>
                              <span>{optimalStrategy.rate.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("fees")}:</span>
                              <span className="text-red-600">
                                {((purchaseRequest.amount * optimalStrategy.rate * optimalStrategy.fees) / 100).toFixed(
                                  2,
                                )}{" "}
                                ¥
                              </span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-medium">
                              <span>{t("totalCost")}:</span>
                              <span>{optimalStrategy.totalCost.toFixed(2)} ¥</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>{t("estimatedSavings")}:</span>
                              <span>{optimalStrategy.savings.toFixed(2)} ¥</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Financial Indicators */}
                      {optimalStrategy.technicalIndicators &&
                        optimalStrategy.marketSentiment &&
                        optimalStrategy.marketConditions && (
                          <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                {t("financialIndicators")}
                              </h4>
                              <div className="space-y-4">
                                {/* Technical Indicators */}
                                <div>
                                  <h5 className="font-semibold text-sm mb-2 text-purple-700">
                                    {t("technicalIndicators")}
                                  </h5>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                      <span>{t("rsi")}:</span>
                                      <span className="font-medium">{optimalStrategy.technicalIndicators.rsi}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("macd")}:</span>
                                      <span className="font-medium">{optimalStrategy.technicalIndicators.macd}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("bollingerBands")}:</span>
                                      <span className="font-medium">
                                        {optimalStrategy.technicalIndicators.bollinger}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("supportLevel")}:</span>
                                      <span className="font-medium">{optimalStrategy.technicalIndicators.support}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("resistanceLevel")}:</span>
                                      <span className="font-medium">
                                        {optimalStrategy.technicalIndicators.resistance}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Market Sentiment */}
                                <div>
                                  <h5 className="font-semibold text-sm mb-2 text-purple-700">{t("marketSentiment")}</h5>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                      <span>{t("sentimentScore")}:</span>
                                      <span className="font-medium">{optimalStrategy.marketSentiment.score}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("trend")}:</span>
                                      <span className="font-medium">{optimalStrategy.marketSentiment.trend}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("volatility")}:</span>
                                      <span className="font-medium">{optimalStrategy.marketSentiment.volatility}%</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Overall Market Conditions */}
                                <div>
                                  <h5 className="font-semibold text-sm mb-2 text-purple-700">{t("marketOverview")}</h5>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                      <span>{t("currentVolatility")}:</span>
                                      <span className="font-medium">
                                        {optimalStrategy.marketConditions.volatility}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("marketTrend")}:</span>
                                      <span className="font-medium">{optimalStrategy.marketConditions.trend}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{t("liquidity")}:</span>
                                      <span className="font-medium">{optimalStrategy.marketConditions.liquidity}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="font-medium text-slate-600">{t("suggestion")}:</span>
                                      <span className="ml-1 text-slate-500">
                                        {optimalStrategy.marketConditions.recommendation}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                      {/* Steps */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {t("operationSteps")}
                          </h4>
                          <ol className="space-y-2">
                            {optimalStrategy.stepsInfo &&
                              getChannelSteps(
                                optimalStrategy.stepsInfo.channelType,
                                optimalStrategy.stepsInfo.purpose,
                                language,
                              ).map((step, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm">{step}</span>
                                </li>
                              ))}
                          </ol>
                        </CardContent>
                      </Card>

                      {/* Pros and Cons */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-3 text-green-700 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              {t("advantages")}
                            </h4>
                            <ul className="space-y-1">
                              {optimalStrategy.prosKeys.map((key, index) => (
                                <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  {t(key)}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-3 text-orange-700 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {t("precautions")}
                            </h4>
                            <ul className="space-y-1">
                              {optimalStrategy.consKeys.map((key, index) => (
                                <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  {t(key)}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Alternative Options */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            {t("alternativeOptions")}
                          </h4>
                          <div className="space-y-3">
                            {optimalStrategy.alternatives.map((alt, index) => (
                              <div key={index} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{alt.channel}</div>
                                    <div className="text-sm text-slate-600">
                                      {t("completionTime")}: {alt.timeRequired}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{alt.totalCost.toFixed(2)} ¥</div>
                                    <div className="text-sm text-slate-600">
                                      {t("fees")}: {alt.fees}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleSelectPlan(optimalStrategy.id)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {selectedPlanId === optimalStrategy.id ? t("planSelected") : t("selectThisPlan")}
                        </Button>
                        <Button
                          onClick={handleReAnalyze}
                          variant="outline"
                          className="hover:scale-105 transition-transform bg-transparent"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t("reAnalyze")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="system" className="space-y-6">
            {/* System Modules Status */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {t("systemModuleMonitoring")}
                </CardTitle>
                <CardDescription>{t("realtimeMonitorDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemModules.map((module) => (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getModuleIcon(module.id)}
                            <span className="font-medium text-sm">{t(module.nameKey)}</span>{" "}
                            {/* Use nameKey for translation */}
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${getModuleStatusColor(module.status)} animate-pulse`}
                          />
                        </div>
                        <Progress value={module.progress} className="mb-2" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{module.progress}%</span>
                          <span>{module.lastUpdate.toLocaleTimeString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Market Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="animate-slide-in-left">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{t("marketVolatility")}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{marketData.volatility.toFixed(1)}%</div>
                  <div className="text-xs text-slate-500">{t("past24Hours")}</div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-left delay-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">{t("sentimentIndex")}</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {marketData.sentiment > 0 ? "+" : ""}
                    {marketData.sentiment.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {marketData.sentiment > 0.2
                      ? t("optimistic")
                      : marketData.sentiment < -0.2
                        ? t("pessimistic")
                        : t("neutral")}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-left delay-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Newspaper className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{t("newsCount")}</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{marketData.newsCount}</div>
                  <div className="text-xs text-slate-500">{t("todayRelatedNews")}</div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-left delay-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{t("activeCurrencyPairs")}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{currencies.length}</div>
                  <div className="text-xs text-slate-500">{t("supportedCurrencies")}</div>
                </CardContent>
              </Card>
            </div>

            {/* Import News Data Card */}
            <Card className="animate-slide-up delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  {t("importNewsData")}
                </CardTitle>
                <CardDescription>{t("importNewsDataDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="csv-upload" className="sr-only">
                    {t("selectCsvFile")}
                  </Label>
                  <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
                  <Button onClick={handleUploadCsv} disabled={!selectedFile || isUploading}>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? t("uploading") : t("uploadCsv")}
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-sm text-slate-600">
                    {t("selectedFile")}: {selectedFile.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analysis Weights Configuration */}
              <Card className="animate-slide-in-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t("analysisWeightConfig")}
                  </CardTitle>
                  <CardDescription>{t("adjustAnalysisWeights")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analysisWeights).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="capitalize">
                          {key === "sentiment"
                            ? t("sentimentAnalysis")
                            : key === "technical"
                              ? t("technicalAnalysis")
                              : key === "fundamental"
                                ? t("fundamentalAnalysis")
                                : key === "risk"
                                  ? t("riskAssessment")
                                  : t("timingSelection")}
                        </Label>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => {
                          const newValue = Number(e.target.value)
                          setAnalysisWeights((prev) => ({ ...prev, [key]: newValue }))
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Competition Tab */}
          <TabsContent value="competition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Pair Selection and Chart */}
              <Card className="animate-slide-in-left">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t("tradingPair")}
                  </CardTitle>
                  <CardDescription className="text-purple-100">{t("exchangeRateChart")}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Currency Pair Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("baseCurrencyLabel")}</Label>
                      <Select
                        value={tradingPair.from}
                        onValueChange={(value) => setTradingPair({ ...tradingPair, from: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.flag} {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("targetCurrencyLabel")}</Label>
                      <Select
                        value={tradingPair.to}
                        onValueChange={(value) => setTradingPair({ ...tradingPair, to: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies
                            .filter((c) => c.code !== tradingPair.from)
                            .map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.flag} {currency.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Current Rate Display */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-sm text-blue-600 mb-1">{t("currentRate")}</div>
                      <div className="text-3xl font-bold text-blue-800">
                        {((fetchedRates[tradingPair.to] || 1.0) / (fetchedRates[tradingPair.from] || 1.0))?.toFixed(
                          4,
                        ) || "N/A"}
                      </div>
                      <div className="text-sm text-blue-600">
                        1 {tradingPair.from} ={" "}
                        {((fetchedRates[tradingPair.to] || 1.0) / (fetchedRates[tradingPair.from] || 1.0))?.toFixed(
                          4,
                        ) || "N/A"}{" "}
                        {tradingPair.to}
                      </div>
                    </div>
                  </div>

                  {/* Exchange Rate Chart */}
                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-medium mb-3 text-center">{t("exchangeRateChartTitle")}</h4>
                    <div className="w-full overflow-x-auto">
                      <SimpleLineChart data={rateHistory} width={600} height={200} />
                    </div>
                  </div>

                  {/* Market Indicators */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-700">{t("volatilityLabel")}</div>
                      <div className="text-green-600">{marketData.volatility.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-700">{t("trendLabel")}</div>
                      <div className="text-blue-600">
                        {marketData.trendDirection === "up"
                          ? t("upward")
                          : marketData.trendDirection === "down"
                            ? t("downward")
                            : t("stable")}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-medium text-purple-700">{t("sentimentLabel")}</div>
                      <div className="text-purple-600">
                        {marketData.sentiment > 0.2
                          ? "😊 " + t("optimistic")
                          : marketData.sentiment < -0.2
                            ? "😟 " + t("pessimistic")
                            : "😐 " + t("neutral")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Strategy Configuration */}
              <Card className="animate-slide-in-right">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t("userStrategy")}
                  </CardTitle>
                  <CardDescription className="text-green-100">{t("configureYourStrategy")}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Strategy Type Selection */}
                  <div className="space-y-3">
                    <Label>{t("strategyType")}</Label>
                    <RadioGroup
                      value={userStrategy.type}
                      onValueChange={(value: "AGGRESSIVE" | "CONSERVATIVE" | "BALANCED" | "CUSTOM") => {
                        const presets = {
                          AGGRESSIVE: { buyThreshold: 0.015, sellThreshold: 0.04, riskLevel: 4, expectedReturn: 8.0 },
                          CONSERVATIVE: { buyThreshold: 0.03, sellThreshold: 0.02, riskLevel: 2, expectedReturn: 3.5 },
                          BALANCED: { buyThreshold: 0.02, sellThreshold: 0.03, riskLevel: 3, expectedReturn: 5.5 },
                          CUSTOM: userStrategy,
                        }
                        setUserStrategy({ ...userStrategy, type: value, ...presets[value] })
                      }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="AGGRESSIVE" id="aggressive" />
                        <Label htmlFor="aggressive" className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-500" />
                          {t("aggressive")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CONSERVATIVE" id="conservative" />
                        <Label htmlFor="conservative" className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          {t("conservative")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BALANCED" id="balanced" />
                        <Label htmlFor="balanced" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-green-500" />
                          {t("balanced")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CUSTOM" id="custom" />
                        <Label htmlFor="custom" className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          {t("custom")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Strategy Parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("buyThreshold")} (%)</Label>
                      <Input
                        type="number"
                        value={userStrategy.buyThreshold * 100}
                        onChange={(e) =>
                          setUserStrategy({
                            ...userStrategy,
                            buyThreshold: Number.parseFloat(e.target.value) / 100 || 0,
                            type: "CUSTOM",
                          })
                        }
                        step="0.1"
                        min="0"
                        max="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("sellThreshold")} (%)</Label>
                      <Input
                        type="number"
                        value={userStrategy.sellThreshold * 100}
                        onChange={(e) =>
                          setUserStrategy({
                            ...userStrategy,
                            sellThreshold: Number.parseFloat(e.target.value) / 100 || 0,
                            type: "CUSTOM",
                          })
                        }
                        step="0.1"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("riskLevel")} (1-5)</Label>
                      <Input
                        type="number"
                        value={userStrategy.riskLevel}
                        onChange={(e) =>
                          setUserStrategy({
                            ...userStrategy,
                            riskLevel: Number.parseInt(e.target.value) || 1,
                            type: "CUSTOM",
                          })
                        }
                        min="1"
                        max="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("expectedReturn")} (%)</Label>
                      <Input
                        type="number"
                        value={userStrategy.expectedReturn}
                        onChange={(e) =>
                          setUserStrategy({
                            ...userStrategy,
                            expectedReturn: Number.parseFloat(e.target.value) || 0,
                            type: "CUSTOM",
                          })
                        }
                        step="0.1"
                        min="0"
                        max="20"
                      />
                    </div>
                  </div>

                  {/* Strategy Summary */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border">
                    <h4 className="font-medium mb-2">{t("strategySummary")}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">{t("type")}:</span>
                        <span className="ml-2 font-medium">
                          {userStrategy.type === "AGGRESSIVE"
                            ? t("aggressive")
                            : userStrategy.type === "CONSERVATIVE"
                              ? t("conservative")
                              : userStrategy.type === "BALANCED"
                                ? t("balanced")
                                : t("custom")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">{t("riskLevel")}:</span>
                        <span className="ml-2 font-medium">{userStrategy.riskLevel}/5</span>
                      </div>
                      <div>
                        <span className="text-slate-600">{t("buyThreshold")}:</span>
                        <span className="ml-2 font-medium">{(userStrategy.buyThreshold * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-600">{t("sellThreshold")}:</span>
                        <span className="ml-2 font-medium">{(userStrategy.sellThreshold * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Competition Control and AI Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competition Control */}
              <Card className="animate-slide-up">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {t("aiCompetitionConsole")}
                  </CardTitle>
                  <CardDescription className="text-orange-100">{t("startAICompetition")}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {!gameSession ? (
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4">🤖</div>
                      <h3 className="text-lg font-medium">{t("prepareToStartAICompetition")}</h3>
                      <p className="text-slate-600 text-sm">{t("competitionDescription")}</p>
                      <Button
                        onClick={startCompetition}
                        disabled={isCompeting || Object.keys(fetchedRates).length === 0} // Disable if rates not loaded
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                      >
                        {isCompeting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trophy className="h-4 w-4 mr-2" />
                        )}
                        {isCompeting ? t("competing") : t("startCompetition")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Game Status */}
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-2">
                          {t("roundDisplay", { round: gameSession.currentRound - 1 })}/{gameSession.totalRounds}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{gameSession.userScore}</div>
                            <div className="text-sm text-slate-600">{t("yourWins")}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{gameSession.aiScore}</div>
                            <div className="text-sm text-slate-600">{t("aiWins")}</div>
                          </div>
                        </div>
                      </div>

                      {/* Round Results */}
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {gameSession.rounds.map((round, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">
                                {t("roundDisplay", { round: round.round })} ({round.fromCurrency}/{round.toCurrency})
                              </span>
                              <Badge
                                variant={
                                  round.winner === "user"
                                    ? "default"
                                    : round.winner === "ai"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {round.winner === "user" ? t("youWon") : round.winner === "ai" ? t("aiWon") : t("tie")}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">{t("yourProfit")}:</span>
                                <span className="ml-2 font-medium text-green-600">
                                  {round.userProfit > 0 ? "+" : ""}
                                  {round.userProfit.toFixed(2)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">{t("aiProfit")}:</span>
                                <span className="ml-2 font-medium text-red-600">
                                  {round.aiProfit > 0 ? "+" : ""}
                                  {round.aiProfit.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {t("marketCondition")}: {round.marketCondition}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Competition Status */}
                      {gameSession.status === "playing" && (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-600" />
                          <div className="text-yellow-800 font-medium">{t("competitionInProgress")}</div>
                        </div>
                      )}

                      {gameSession.status === "finished" && (
                        <div className="text-center space-y-4">
                          <div className="text-4xl mb-2">
                            {gameSession.userScore > gameSession.aiScore
                              ? "🏆"
                              : gameSession.userScore < gameSession.aiScore
                                ? "🤖"
                                : "🤝"}
                          </div>
                          <div className="font-medium text-lg">
                            {gameSession.userScore > gameSession.aiScore
                              ? t("congratulationsWin")
                              : gameSession.userScore < gameSession.aiScore
                                ? t("aiWin")
                                : t("tieGame")}
                          </div>
                          <Button
                            onClick={() => {
                              setGameSession(null)
                              setIsCompeting(false)
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("restart")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Strategy Analysis */}
              <Card className="animate-slide-up delay-100">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {t("aiStrategyAnalysis")}
                  </CardTitle>
                  <CardDescription className="text-indigo-100">{t("aiCurrentStrategyAnalysis")}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {gameSession && gameSession.rounds.length > 0 ? (
                    <div className="space-y-4">
                      {/* Latest AI Strategy */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium mb-3 text-purple-800">{t("latestAIStrategy")}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">{t("strategyTypeAI")}:</span>
                            <span className="ml-2 font-medium">
                              {gameSession.rounds[gameSession.rounds.length - 1]?.aiStrategy.type === "AGGRESSIVE"
                                ? t("aggressive")
                                : gameSession.rounds[gameSession.rounds.length - 1]?.aiStrategy.type === "CONSERVATIVE"
                                  ? t("conservative")
                                  : t("balanced")}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">{t("confidenceAI")}:</span>
                            <span className="ml-2 font-medium">
                              {gameSession.rounds[gameSession.rounds.length - 1]?.aiStrategy.confidence.toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">{t("riskLevelAI")}:</span>
                            <span className="ml-2 font-medium">
                              {gameSession.rounds[gameSession.rounds.length - 1]?.aiStrategy.riskLevel}/5
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">{t("expectedReturnAI")}:</span>
                            <span className="ml-2 font-medium">
                              {gameSession.rounds[gameSession.rounds.length - 1]?.aiStrategy.expectedReturn.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Performance Analysis */}
                      <div className="space-y-3">
                        <h4 className="font-medium">{t("aiPerformanceAnalysis")}</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {gameSession.rounds.filter((r) => r.aiProfit > 0).length}
                            </div>
                            <div className="text-xs text-green-700">{t("profitableRounds")}</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600">
                              {gameSession.rounds.filter((r) => r.aiProfit < 0).length}
                            </div>
                            <div className="text-xs text-red-700">{t("lossRounds")}</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {(
                                gameSession.rounds.reduce((sum, r) => sum + r.aiProfit, 0) / gameSession.rounds.length
                              ).toFixed(1)}
                              %
                            </div>
                            <div className="text-xs text-blue-700">{t("averageReturn")}</div>
                          </div>
                        </div>
                      </div>

                      {/* Strategy Evolution */}
                      <div className="space-y-2">
                        <h4 className="font-medium">{t("strategyEvolution")}</h4>
                        <div className="text-sm text-slate-600">{t("aiLearningDesc")}</div>
                        <Progress value={(gameSession.rounds.length / gameSession.totalRounds) * 100} className="h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <div className="font-medium mb-2">{t("waitingForCompetition")}</div>
                      <div className="text-sm">{t("aiAnalysisAfterStart")}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
