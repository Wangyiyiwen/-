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
  ArrowLeft,
  Send,
  Clock,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Star,
  UploadCloud,
  Save,
  FileText,
  Trash2,
  ArrowRight,
  Home,
  ShoppingCart,
  Check,
  X,
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

// 详细策略选项数据结构
interface DetailedExchangeStrategy {
  id: string
  name: string
  nameKey: string
  category: 'bank-online' | 'bank-offline' | 'bank-appointment' | 'atm-foreign' | 'airport-domestic' | 'airport-foreign'
  
  // 银行/机构信息
  institution: {
    name: string
    type: 'bank' | 'airport' | 'atm-network'
  }
  
  // 兑换方式详情
  method: {
    type: 'online-purchase-offline-pickup' | 'direct-offline' | 'appointment-required' | 'atm-withdrawal' | 'airport-counter'
    description: string
    steps: string[]
  }
  
  // 成本结构（按货币区分）
  costStructure: {
    [currency: string]: {
      localCard: {
        enabled: boolean
        baseFee: number // 固定费用
        percentageFee: number // 百分比费用
        minFee?: number
        maxFee?: number
      }
      nonLocalCard: {
        enabled: boolean
        baseFee: number
        percentageFee: number
        minFee?: number
        maxFee?: number
      }
      exchangeRateMarkup: number // 汇率加价百分比
      additionalFees?: { name: string; amount: number }[]
    }
  }
  
  // 时间要求
  timeRequirements: {
    appointmentDays: number // 需要提前预约天数
    processingTime: string
    urgentAvailable: boolean
    operatingHours: {
      online?: string
      offline?: string
      weekends: boolean
    }
  }
  
  // 可用性和限制
  availability: {
    currencySupport: {
      [currency: string]: 'excellent' | 'good' | 'limited' | 'rare'
    }
    locationAccess: 'nationwide' | 'major-cities' | 'limited-branches' | 'specific-locations'
    stockLevel: 'abundant' | 'sufficient' | 'limited' | 'appointment-required'
    maxAmount: {
      daily?: number
      perTransaction?: number
      annual?: number
    }
  }
  
  // 特色和限制
  features: string[]
  restrictions: string[]
  
  // 评分系统 (1-10)
  ratings: {
    cost: number // 成本优势
    convenience: number // 便利性
    speed: number // 速度
    reliability: number // 可靠性
    flexibility: number // 灵活性
  }
  
  // 风险和信心度
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  confidence: number
  
  // 优缺点
  prosKeys: string[]
  consKeys: string[]
}

// 用户偏好设置接口
interface UserPreferences {
  priorityWeights: {
    cost: number      // 成本权重 (0-1)
    convenience: number  // 便利性权重 (0-1)
    speed: number     // 速度权重 (0-1)
    reliability: number  // 可靠性权重 (0-1)
    flexibility: number  // 灵活性权重 (0-1)
  }
  cardType: 'local' | 'non-local'
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  maxAcceptableFee: number // 最大可接受手续费百分比
  preferredMethods: string[] // 偏好的兑换方式
}

// 详细兑换策略数据
const detailedExchangeStrategies: DetailedExchangeStrategy[] = [
  // 中国银行策略
  {
    id: "boc_online_offline_sgd",
    name: "中国银行线上购汇线下取钞（新加坡元）",
    nameKey: "boc_online_offline_sgd",
    category: "bank-online",
    institution: { name: "中国银行", type: "bank" },
    method: {
      type: "online-purchase-offline-pickup",
      description: "手机银行购汇后预约网点取现钞",
      steps: [
        "登录中国银行手机APP",
        "进入跨境金融→外币现钞预约",
        "选择新加坡元、网点、时间",
        "携带身份证到网点取现钞"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 1.5
      },
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 1.0
      },
      JPY: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 1.2
      },
      KRW: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 1.8
      },
      THB: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 2.0
      },
      MYR: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 2.5
      }
    },
    timeRequirements: {
      appointmentDays: 2,
      processingTime: "即时取现",
      urgentAvailable: false,
      operatingHours: { online: "7×24小时", offline: "工作日9:00-17:00", weekends: true }
    },
    availability: {
      currencySupport: {
        SGD: "excellent", HKD: "excellent", JPY: "excellent",
        KRW: "good", THB: "good", MYR: "limited"
      },
      locationAccess: "nationwide",
      stockLevel: "abundant",
      maxAmount: { daily: 10000, annual: 50000 }
    },
    features: ["支持APP预约", "免手续费（本地卡）", "库存充足", "全国网点"],
    restrictions: ["需提前2天预约", "外地卡收取转账费"],
    ratings: { cost: 9, convenience: 8, speed: 7, reliability: 9, flexibility: 7 },
    riskLevel: "LOW",
    confidence: 95,
    prosKeys: ["免手续费", "全国覆盖", "APP便捷预约", "库存稳定"],
    consKeys: ["需要预约", "外地卡有费用"]
  },

  {
    id: "boc_direct_offline",
    name: "中国银行直接网点兑换",
    nameKey: "boc_direct_offline",
    category: "bank-offline",
    institution: { name: "中国银行", type: "bank" },
    method: {
      type: "direct-offline",
      description: "直接到中国银行网点兑换现钞",
      steps: [
        "携带身份证到中国银行网点",
        "取号排队",
        "告知兑换币种和金额",
        "当场兑换取现钞"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 2.0
      },
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.1, maxFee: 200 },
        exchangeRateMarkup: 1.5
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时办理",
      urgentAvailable: true,
      operatingHours: { offline: "工作日9:00-17:00", weekends: true }
    },
    availability: {
      currencySupport: { SGD: "good", HKD: "excellent", JPY: "good" },
      locationAccess: "nationwide",
      stockLevel: "sufficient",
      maxAmount: { daily: 10000 }
    },
    features: ["无需预约", "即时办理", "现场验钞"],
    restrictions: ["可能缺货", "大额需预约"],
    ratings: { cost: 8, convenience: 9, speed: 9, reliability: 7, flexibility: 8 },
    riskLevel: "MEDIUM",
    confidence: 80,
    prosKeys: ["即时办理", "无需预约", "现场验钞"],
    consKeys: ["可能缺货", "汇率稍差"]
  },

  // 工商银行策略
  {
    id: "icbc_online_offline",
    name: "工商银行线上购汇线下取钞",
    nameKey: "icbc_online_offline",
    category: "bank-online",
    institution: { name: "工商银行", type: "bank" },
    method: {
      type: "online-purchase-offline-pickup",
      description: "手机银行购汇后网点取现钞",
      steps: [
        "登录工商银行手机APP",
        "进入结售汇→购汇",
        "选择外币种类和金额",
        "预约网点取现钞"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 20, percentageFee: 0.5, minFee: 20, maxFee: 100 },
        exchangeRateMarkup: 1.8
      },
      JPY: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 20, percentageFee: 0.5, minFee: 20, maxFee: 100 },
        exchangeRateMarkup: 1.5
      },
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 20, percentageFee: 0.5, minFee: 20, maxFee: 100 },
        exchangeRateMarkup: 1.2
      }
    },
    timeRequirements: {
      appointmentDays: 3,
      processingTime: "即时取现",
      urgentAvailable: false,
      operatingHours: { online: "周一7:00-24:00，周二-周五0:00-24:00", offline: "工作日9:00-17:00", weekends: false }
    },
    availability: {
      currencySupport: { SGD: "good", JPY: "excellent", HKD: "excellent" },
      locationAccess: "major-cities",
      stockLevel: "sufficient",
      maxAmount: { daily: 10000 }
    },
    features: ["支持APP预约", "汇率相对优惠", "大城市覆盖好"],
    restrictions: ["需提前3天预约", "周日无法线上操作", "外地卡手续费较高"],
    ratings: { cost: 7, convenience: 6, speed: 6, reliability: 8, flexibility: 6 },
    riskLevel: "MEDIUM",
    confidence: 85,
    prosKeys: ["汇率相对优惠", "覆盖面广"],
    consKeys: ["预约时间长", "外地卡费用高", "周日不可用"]
  },

  // 招商银行策略
  {
    id: "cmb_online_offline",
    name: "招商银行线上购汇线下取钞",
    nameKey: "cmb_online_offline",
    category: "bank-online",
    institution: { name: "招商银行", type: "bank" },
    method: {
      type: "online-purchase-offline-pickup",
      description: "手机银行购汇后预约网点取现钞",
      steps: [
        "登录招商银行手机APP",
        "进入跨境金融→外汇购汇",
        "选择现钞户兑换",
        "预约网点取现钞"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        exchangeRateMarkup: 2.5
      },
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        exchangeRateMarkup: 2.0
      },
      JPY: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        exchangeRateMarkup: 2.2
      }
    },
    timeRequirements: {
      appointmentDays: 2,
      processingTime: "即时取现",
      urgentAvailable: false,
      operatingHours: { online: "7×24小时", offline: "工作日9:00-17:00", weekends: true }
    },
    availability: {
      currencySupport: { SGD: "limited", HKD: "good", JPY: "limited" },
      locationAccess: "major-cities",
      stockLevel: "limited",
      maxAmount: { daily: 10000, annual: 50000 }
    },
    features: ["不区分本地外地卡", "部分币种支持"],
    restrictions: ["库存有限", "手续费固定收取", "部分币种不支持"],
    ratings: { cost: 5, convenience: 6, speed: 7, reliability: 6, flexibility: 5 },
    riskLevel: "MEDIUM",
    confidence: 70,
    prosKeys: ["费率统一", "预约便利"],
    consKeys: ["手续费较高", "库存有限", "支持币种少"]
  },

  {
    id: "cmb_cash_direct",
    name: "招商银行现金直接兑换",
    nameKey: "cmb_cash_direct",
    category: "bank-offline",
    institution: { name: "招商银行", type: "bank" },
    method: {
      type: "direct-offline",
      description: "携带现金到招商银行网点直接兑换",
      steps: [
        "准备人民币现金和身份证",
        "到招商银行网点取号",
        "向柜台说明兑换需求",
        "现金兑换外币现钞"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        exchangeRateMarkup: 3.0
      },
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0.5, maxFee: 50 },
        exchangeRateMarkup: 2.5
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时办理",
      urgentAvailable: true,
      operatingHours: { offline: "工作日9:00-17:00", weekends: true }
    },
    availability: {
      currencySupport: { SGD: "limited", HKD: "good" },
      locationAccess: "limited-branches",
      stockLevel: "limited",
      maxAmount: { daily: 10000 }
    },
    features: ["现金交易", "即时办理", "小额方便"],
    restrictions: ["库存紧张", "大额需预约", "汇率较差"],
    ratings: { cost: 4, convenience: 7, speed: 8, reliability: 5, flexibility: 6 },
    riskLevel: "HIGH",
    confidence: 60,
    prosKeys: ["即时办理", "现金交易"],
    consKeys: ["汇率差", "库存有限", "手续费高"]
  },

  // 建设银行策略
  {
    id: "ccb_online_offline",
    name: "建设银行线上购汇线下取钞",
    nameKey: "ccb_online_offline",
    category: "bank-online",
    institution: { name: "建设银行", type: "bank" },
    method: {
      type: "online-purchase-offline-pickup",
      description: "建设银行APP购汇后预约取现钞",
      steps: [
        "登录建设银行APP",
        "进入外币兑换功能",
        "选择币种和金额兑换",
        "预约网点取现钞"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 5, percentageFee: 0.05, minFee: 5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 5, percentageFee: 0.05, minFee: 5, maxFee: 50 },
        exchangeRateMarkup: 2.2
      },
      HKD: {
        localCard: { enabled: true, baseFee: 5, percentageFee: 0.05, minFee: 5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 5, percentageFee: 0.05, minFee: 5, maxFee: 50 },
        exchangeRateMarkup: 1.8
      },
      JPY: {
        localCard: { enabled: true, baseFee: 5, percentageFee: 0.05, minFee: 5, maxFee: 50 },
        nonLocalCard: { enabled: true, baseFee: 5, percentageFee: 0.05, minFee: 5, maxFee: 50 },
        exchangeRateMarkup: 1.6
      }
    },
    timeRequirements: {
      appointmentDays: 3,
      processingTime: "即时取现",
      urgentAvailable: false,
      operatingHours: { online: "7×24小时", offline: "工作日9:00-17:00", weekends: true }
    },
    availability: {
      currencySupport: { SGD: "limited", HKD: "good", JPY: "good" },
      locationAccess: "limited-branches",
      stockLevel: "appointment-required",
      maxAmount: { daily: 10000 }
    },
    features: ["统一手续费", "支持多币种"],
    restrictions: ["网点较少", "必须预约", "提前3天"],
    ratings: { cost: 6, convenience: 5, speed: 5, reliability: 7, flexibility: 5 },
    riskLevel: "MEDIUM",
    confidence: 75,
    prosKeys: ["费率透明", "支持多币种"],
    consKeys: ["网点少", "预约时间长"]
  },

  // 国外ATM取现策略
  {
    id: "singapore_atm_uob_maybank",
    name: "新加坡UOB/Maybank ATM取现",
    nameKey: "singapore_atm_free",
    category: "atm-foreign",
    institution: { name: "UOB/Maybank", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在新加坡UOB或Maybank ATM使用银联卡取现",
      steps: [
        "抵达新加坡后找到UOB或Maybank ATM",
        "插入银联卡",
        "选择银联网络",
        "输入取现金额和密码"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "新加坡本地ATM费用", amount: 0 }]
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { SGD: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { daily: 10000, perTransaction: 800 }
    },
    features: ["24小时可用", "无新加坡ATM费用", "实时汇率"],
    restrictions: ["仅在新加坡可用", "国内银行收取跨境费用"],
    ratings: { cost: 7, convenience: 9, speed: 10, reliability: 9, flexibility: 8 },
    riskLevel: "LOW",
    confidence: 90,
    prosKeys: ["24小时", "无本地费用", "实时汇率", "便利快捷"],
    consKeys: ["国内银行费用", "仅限新加坡"]
  },

  {
    id: "singapore_atm_dbs_posb",
    name: "新加坡DBS/POSB ATM取现",
    nameKey: "singapore_atm_dbs",
    category: "atm-foreign",
    institution: { name: "DBS/POSB", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在新加坡DBS或POSB ATM使用银联卡取现",
      steps: [
        "找到DBS或POSB ATM",
        "插入银联卡选择银联网络",
        "输入取现金额",
        "确认交易并取现"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "DBS/POSB ATM费用", amount: 5 }]
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { SGD: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { daily: 10000, perTransaction: 800 }
    },
    features: ["24小时可用", "网点众多", "实时汇率"],
    restrictions: ["收取5新元ATM费用", "国内银行跨境费用"],
    ratings: { cost: 6, convenience: 9, speed: 10, reliability: 9, flexibility: 8 },
    riskLevel: "LOW",
    confidence: 85,
    prosKeys: ["24小时", "网点多", "实时汇率"],
    consKeys: ["ATM费用5新元", "国内银行费用"]
  },

  {
    id: "thailand_atm_all",
    name: "泰国ATM取现（任意银行）",
    nameKey: "thailand_atm_all",
    category: "atm-foreign",
    institution: { name: "泰国各银行ATM", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在泰国任意ATM使用银联卡取现",
      steps: [
        "找到任意泰国银行ATM",
        "插入银联卡",
        "选择银联网络",
        "输入取现金额和密码"
      ]
    },
    costStructure: {
      THB: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "泰国ATM费用", amount: 220 }] // 220泰铢约45元人民币
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { THB: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { daily: 30000, perTransaction: 30000 } // 30000泰铢
    },
    features: ["24小时可用", "全泰国通用", "实时汇率"],
    restrictions: ["固定收取220泰铢", "单日限额30000泰铢"],
    ratings: { cost: 5, convenience: 9, speed: 10, reliability: 9, flexibility: 8 },
    riskLevel: "MEDIUM",
    confidence: 90,
    prosKeys: ["24小时", "全国通用", "实时汇率"],
    consKeys: ["固定费用220泰铢", "费用较高"]
  },

  {
    id: "korea_atm_lotte711",
    name: "韩国乐天7-11 ATM取现",
    nameKey: "korea_atm_lotte",
    category: "atm-foreign",
    institution: { name: "乐天7-11", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在韩国乐天7-11便利店ATM取现",
      steps: [
        "找到7-11便利店",
        "使用店内乐天ATM",
        "插入银联卡取现韩元",
        "最多可取10万韩元"
      ]
    },
    costStructure: {
      KRW: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "乐天ATM费用", amount: 0 }]
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "便利店营业时间", weekends: true }
    },
    availability: {
      currencySupport: { KRW: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "sufficient",
      maxAmount: { perTransaction: 100000 } // 10万韩元
    },
    features: ["免ATM费用", "便利店内", "覆盖面广"],
    restrictions: ["单次限额10万韩元", "营业时间限制"],
    ratings: { cost: 8, convenience: 8, speed: 10, reliability: 8, flexibility: 7 },
    riskLevel: "LOW",
    confidence: 85,
    prosKeys: ["免本地费用", "便利店内", "取现便利"],
    consKeys: ["单次限额低", "营业时间限制"]
  },

  {
    id: "korea_atm_kb",
    name: "韩国国民银行ATM取现",
    nameKey: "korea_atm_kb",
    category: "atm-foreign",
    institution: { name: "国民银行", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在韩国国民银行ATM取现",
      steps: [
        "找到국민은행(国民银行)ATM",
        "插入银联卡",
        "选择银联网络取现",
        "最多可取100万韩元"
      ]
    },
    costStructure: {
      KRW: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "国民银行ATM费用", amount: 3500 }] // 3500韩元
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { KRW: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { perTransaction: 1000000 } // 100万韩元
    },
    features: ["24小时", "大额取现", "网点多"],
    restrictions: ["收取3500韩元费用"],
    ratings: { cost: 6, convenience: 8, speed: 10, reliability: 9, flexibility: 8 },
    riskLevel: "LOW",
    confidence: 88,
    prosKeys: ["24小时", "大额取现", "网点众多"],
    consKeys: ["收取3500韩元费用"]
  },

  // 日本ATM策略
  {
    id: "japan_atm_711",
    name: "日本7-11便利店ATM取现",
    nameKey: "japan_atm_711",
    category: "atm-foreign",
    institution: { name: "7-11", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在日本7-11便利店ATM取现日元",
      steps: [
        "找到7-11便利店",
        "使用店内ATM",
        "插入银联卡取现",
        "单次最多10万日元"
      ]
    },
    costStructure: {
      JPY: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "7-11 ATM费用", amount: 110 }] // 110日元约5.5元
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "便利店营业时间", weekends: true }
    },
    availability: {
      currencySupport: { JPY: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { perTransaction: 100000 } // 10万日元
    },
    features: ["便利店内", "覆盖全日本", "费用较低"],
    restrictions: ["单次限额10万日元", "营业时间限制"],
    ratings: { cost: 7, convenience: 9, speed: 10, reliability: 9, flexibility: 8 },
    riskLevel: "LOW",
    confidence: 92,
    prosKeys: ["覆盖面广", "费用低", "便利店内"],
    consKeys: ["单次限额", "营业时间限制"]
  },

  {
    id: "japan_atm_familymart",
    name: "日本全家便利店ATM取现",
    nameKey: "japan_atm_familymart",
    category: "atm-foreign",
    institution: { name: "全家便利店", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在日本全家便利店ATM取现",
      steps: [
        "找到ファミリーマート(全家)便利店",
        "使用店内ATM",
        "插入银联卡取现",
        "单次最多5万日元"
      ]
    },
    costStructure: {
      JPY: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "全家ATM费用", amount: 75 }] // 75日元约3.8元
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "便利店营业时间", weekends: true }
    },
    availability: {
      currencySupport: { JPY: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "sufficient",
      maxAmount: { perTransaction: 50000 } // 5万日元
    },
    features: ["最低ATM费用", "便利店内"],
    restrictions: ["单次限额5万日元", "限额较低"],
    ratings: { cost: 8, convenience: 8, speed: 10, reliability: 8, flexibility: 6 },
    riskLevel: "LOW",
    confidence: 85,
    prosKeys: ["费用最低", "便利店内"],
    consKeys: ["限额较低", "网点相对少"]
  },

  // 马来西亚ATM策略
  {
    id: "malaysia_atm_maybank",
    name: "马来西亚Maybank ATM取现",
    nameKey: "malaysia_atm_maybank",
    category: "atm-foreign",
    institution: { name: "Maybank", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在马来西亚Maybank ATM取现林吉特",
      steps: [
        "找到Maybank ATM",
        "插入银联卡",
        "选择银联网络",
        "取现马来西亚林吉特"
      ]
    },
    costStructure: {
      MYR: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "Maybank ATM费用", amount: 0 }]
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { MYR: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { daily: 3000 } // 根据具体情况调整
    },
    features: ["免本地ATM费用", "24小时", "马来西亚最大银行"],
    restrictions: ["仅在马来西亚可用"],
    ratings: { cost: 8, convenience: 9, speed: 10, reliability: 9, flexibility: 8 },
    riskLevel: "LOW",
    confidence: 90,
    prosKeys: ["免本地费用", "24小时", "网点最多"],
    consKeys: ["仅限马来西亚"]
  },

  {
    id: "malaysia_atm_cimb",
    name: "马来西亚CIMB ATM取现",
    nameKey: "malaysia_atm_cimb",
    category: "atm-foreign",
    institution: { name: "CIMB Bank", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在马来西亚CIMB银行ATM取现",
      steps: [
        "找到CIMB Bank ATM",
        "插入银联卡",
        "选择银联网络取现",
        "获得马来西亚林吉特"
      ]
    },
    costStructure: {
      MYR: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.5,
        additionalFees: [{ name: "CIMB ATM费用", amount: 0 }]
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { MYR: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { daily: 3000 }
    },
    features: ["免本地ATM费用", "24小时", "覆盖面好"],
    restrictions: ["仅在马来西亚可用"],
    ratings: { cost: 8, convenience: 9, speed: 10, reliability: 8, flexibility: 8 },
    riskLevel: "LOW",
    confidence: 85,
    prosKeys: ["免本地费用", "24小时", "覆盖好"],
    consKeys: ["仅限马来西亚"]
  },

  // 香港ATM策略
  {
    id: "hongkong_atm_general",
    name: "香港ATM取现（银联）",
    nameKey: "hongkong_atm_general",
    category: "atm-foreign",
    institution: { name: "香港各银行ATM", type: "atm-network" },
    method: {
      type: "atm-withdrawal",
      description: "在香港任意银行ATM使用银联卡取现",
      steps: [
        "找到任意香港银行ATM",
        "插入银联卡",
        "选择银联网络",
        "取现港币"
      ]
    },
    costStructure: {
      HKD: {
        localCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        nonLocalCard: { enabled: true, baseFee: 12, percentageFee: 1.0 },
        exchangeRateMarkup: 0.3,
        additionalFees: [{ name: "香港ATM费用", amount: 0 }] // 香港ATM一般不收费
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时取现",
      urgentAvailable: true,
      operatingHours: { offline: "24小时", weekends: true }
    },
    availability: {
      currencySupport: { HKD: "excellent" },
      locationAccess: "specific-locations",
      stockLevel: "abundant",
      maxAmount: { daily: 10000 }
    },
    features: ["无本地ATM费用", "24小时", "实时汇率", "覆盖全港"],
    restrictions: ["仅在香港可用", "国内银行跨境费用"],
    ratings: { cost: 8, convenience: 10, speed: 10, reliability: 10, flexibility: 9 },
    riskLevel: "LOW",
    confidence: 95,
    prosKeys: ["无本地费用", "24小时", "实时汇率", "覆盖全港"],
    consKeys: ["仅限香港", "国内银行费用"]
  },

  // 机场兑换策略
  {
    id: "domestic_airport_tier1",
    name: "国内一线机场兑换",
    nameKey: "domestic_airport_tier1",
    category: "airport-domestic",
    institution: { name: "一线机场", type: "airport" },
    method: {
      type: "airport-counter",
      description: "在国内一线机场兑换外币现钞",
      steps: [
        "抵达机场国际出发区域",
        "找到外币兑换柜台",
        "出示身份证和现金",
        "兑换外币现钞"
      ]
    },
    costStructure: {
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 2.5 // 1%-3%溢价
      },
      JPY: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 3.0 // 1.5%-3.5%溢价
      },
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 3.5 // 2%-4%溢价
      },
      KRW: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 4.0 // 2%-5%溢价
      },
      THB: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 5.0 // 3%-6%溢价
      },
      MYR: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 5.0 // 3%-6%溢价
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时兑换",
      urgentAvailable: true,
      operatingHours: { offline: "根据航班时间", weekends: true }
    },
    availability: {
      currencySupport: {
        HKD: "excellent", JPY: "excellent", SGD: "good",
        KRW: "good", THB: "good", MYR: "limited"
      },
      locationAccess: "specific-locations",
      stockLevel: "sufficient",
      maxAmount: { perTransaction: 10000 }
    },
    features: ["即时兑换", "无需预约", "出行便利"],
    restrictions: ["汇率溢价较高", "仅限机场"],
    ratings: { cost: 3, convenience: 9, speed: 10, reliability: 8, flexibility: 7 },
    riskLevel: "MEDIUM",
    confidence: 85,
    prosKeys: ["即时兑换", "出行便利", "无需预约"],
    consKeys: ["汇率溢价高", "成本较高"]
  },

  {
    id: "foreign_airport_exchange",
    name: "国外机场兑换",
    nameKey: "foreign_airport_exchange",
    category: "airport-foreign",
    institution: { name: "国外机场", type: "airport" },
    method: {
      type: "airport-counter",
      description: "在国外机场兑换当地货币",
      steps: [
        "抵达国外机场",
        "找到Currency Exchange柜台",
        "用人民币或美元兑换",
        "获得当地货币"
      ]
    },
    costStructure: {
      SGD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 0.5 // 新加坡机场相对较好
      },
      HKD: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 7.5 // 5%-10%溢价
      },
      JPY: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: -3.0 // 日本机场汇率比银行低3%左右
      },
      THB: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 25.0 // 泰国机场汇率很差，差20%-30%
      },
      KRW: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 8.0 // 5%-10%溢价
      },
      MYR: {
        localCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        nonLocalCard: { enabled: true, baseFee: 0, percentageFee: 0 },
        exchangeRateMarkup: 8.0 // 5%-10%溢价
      }
    },
    timeRequirements: {
      appointmentDays: 0,
      processingTime: "即时兑换",
      urgentAvailable: true,
      operatingHours: { offline: "根据航班时间", weekends: true }
    },
    availability: {
      currencySupport: {
        SGD: "good", HKD: "good", JPY: "limited",
        THB: "limited", KRW: "limited", MYR: "limited"
      },
      locationAccess: "specific-locations",
      stockLevel: "limited",
      maxAmount: { perTransaction: 5000 }
    },
    features: ["落地即换", "应急方便"],
    restrictions: ["汇率通常很差", "选择有限"],
    ratings: { cost: 2, convenience: 8, speed: 10, reliability: 6, flexibility: 5 },
    riskLevel: "HIGH",
    confidence: 70,
    prosKeys: ["落地即换", "应急便利"],
    consKeys: ["汇率很差", "成本最高", "选择有限"]
  }
];

// 策略选择权重配置
interface StrategyWeights {
  cost: number
  convenience: number
  speed: number
  reliability: number
  flexibility: number
}

// 策略选择和排序算法
class StrategySelector {
  private strategies: DetailedExchangeStrategy[];
  
  constructor(strategies: DetailedExchangeStrategy[]) {
    this.strategies = strategies;
  }
  
  // 计算策略总成本
  calculateTotalCost(
    strategy: DetailedExchangeStrategy, 
    currency: string, 
    amount: number, 
    isLocalCard: boolean,
    currentRate: number
  ): number {
    const costStructure = strategy.costStructure[currency];
    if (!costStructure) return Infinity;
    
    const cardType = isLocalCard ? costStructure.localCard : costStructure.nonLocalCard;
    if (!cardType.enabled) return Infinity;
    
    // 计算基础费用
    let totalFee = cardType.baseFee || 0;
    
    // 计算百分比费用
    const percentageFee = (amount * currentRate * (cardType.percentageFee || 0)) / 100;
    totalFee += percentageFee;
    
    // 应用最小最大费用限制
    if (cardType.minFee && totalFee < cardType.minFee) {
      totalFee = cardType.minFee;
    }
    if (cardType.maxFee && totalFee > cardType.maxFee) {
      totalFee = cardType.maxFee;
    }
    
    // 添加额外费用
    if (costStructure.additionalFees) {
      totalFee += costStructure.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
    }
    
    // 计算汇率成本 (汇率加价导致的额外成本)
    const rateMarkupCost = amount * currentRate * (costStructure.exchangeRateMarkup || 0) / 100;
    
    return totalFee + rateMarkupCost;
  }
  
  // 计算策略总评分
  calculateStrategyScore(
    strategy: DetailedExchangeStrategy,
    weights: StrategyWeights,
    cost: number,
    maxCost: number,
    urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  ): number {
    // 成本评分 (成本越低分数越高)
    const costScore = cost === Infinity ? 0 : Math.max(0, 10 - (cost / maxCost) * 10);
    
    // 时间评分 (根据紧急程度调整)
    let timeScore = strategy.ratings.speed;
    if (urgency === 'HIGH' && strategy.timeRequirements.appointmentDays > 0) {
      timeScore *= 0.3; // 急需时预约时间影响很大
    } else if (urgency === 'MEDIUM' && strategy.timeRequirements.appointmentDays > 2) {
      timeScore *= 0.7;
    }
    
    // 加权计算总分
    const totalScore = (
      costScore * weights.cost +
      strategy.ratings.convenience * weights.convenience +
      timeScore * weights.speed +
      strategy.ratings.reliability * weights.reliability +
      strategy.ratings.flexibility * weights.flexibility
    );
    
    return totalScore;
  }
  
  // 选择最适合的策略
  selectOptimalStrategies(
    currency: string,
    amount: number,
    isLocalCard: boolean,
    currentRate: number,
    urgency: 'LOW' | 'MEDIUM' | 'HIGH',
    preferences: UserPreferences
  ): DetailedExchangeStrategy[] {
    console.log('selectOptimalStrategies called with:', { currency, amount, isLocalCard, currentRate, urgency });
    
    // 筛选支持该货币的策略
    const supportedStrategies = this.strategies.filter(strategy => {
      const costStructure = strategy.costStructure[currency];
      if (!costStructure) {
        console.log(`Strategy ${strategy.name} does not support currency ${currency}`);
        return false;
      }
      
      const cardType = isLocalCard ? costStructure.localCard : costStructure.nonLocalCard;
      const enabled = cardType.enabled;
      console.log(`Strategy ${strategy.name} for ${currency}: ${enabled ? 'enabled' : 'disabled'}`);
      return enabled;
    });
    
    console.log(`Found ${supportedStrategies.length} supported strategies for ${currency}`);
    
    if (supportedStrategies.length === 0) {
      console.error('No supported strategies found. Available currencies in strategies:', 
        this.strategies.map(s => Object.keys(s.costStructure)));
      return [];
    }
    
    // 计算每个策略的成本和评分
    const strategyScores = supportedStrategies.map(strategy => {
      const cost = this.calculateTotalCost(strategy, currency, amount, isLocalCard, currentRate);
      return { strategy, cost };
    });
    
    // 找到最大成本用于归一化
    const maxCost = Math.max(...strategyScores.map(s => s.cost === Infinity ? 0 : s.cost));
    
    // 计算评分并排序
    const rankedStrategies = strategyScores
      .map(({ strategy, cost }) => ({
        strategy,
        cost,
        score: this.calculateStrategyScore(strategy, preferences.priorityWeights, cost, maxCost, urgency)
      }))
      .sort((a, b) => b.score - a.score);
    
    return rankedStrategies.map(item => item.strategy);
  }
  
  // 根据不同偏好排序策略
  sortStrategiesByPreference(
    strategies: DetailedExchangeStrategy[],
    sortBy: 'cost' | 'convenience' | 'speed' | 'reliability' | 'flexibility',
    currency: string,
    amount: number,
    isLocalCard: boolean,
    currentRate: number
  ): DetailedExchangeStrategy[] {
    return [...strategies].sort((a, b) => {
      if (sortBy === 'cost') {
        const costA = this.calculateTotalCost(a, currency, amount, isLocalCard, currentRate);
        const costB = this.calculateTotalCost(b, currency, amount, isLocalCard, currentRate);
        return costA - costB; // 成本从低到高
      } else {
        return b.ratings[sortBy] - a.ratings[sortBy]; // 其他指标从高到低
      }
    });
  }
}

// 初始化策略选择器
const strategySelector = new StrategySelector(detailedExchangeStrategies);

export default function CurrencyExchangeSystem() {
  const { toast } = useToast() // Initialize useToast hook

  // Language State
  const [language, setLanguage] = useState<"zh" | "en">("zh")

  // Active Tab State
  const [activeTab, setActiveTab] = useState("purchase")

  // Cover page state
  const [showCover, setShowCover] = useState(true)

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

  // State for card type selection
  const [isLocalCard, setIsLocalCard] = useState(true)
  
  // 策略排序偏好状态
  const [sortPreference, setSortPreference] = useState<'cost' | 'convenience' | 'speed' | 'reliability' | 'flexibility'>('cost')
  
  // 用户偏好权重状态
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    priorityWeights: {
      cost: 0.3,
      convenience: 0.2,
      speed: 0.2,
      reliability: 0.2,
      flexibility: 0.1
    },
    cardType: 'local',
    urgencyLevel: 'MEDIUM',
    maxAcceptableFee: 2.0,
    preferredMethods: []
  })
  
  // 多个策略选项状态
  const [availableStrategies, setAvailableStrategies] = useState<DetailedExchangeStrategy[]>([])
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<string[]>([])
  const [selectedStrategyForDisplay, setSelectedStrategyForDisplay] = useState<DetailedExchangeStrategy | null>(null)

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // News sentiment analysis states
  const [newsText, setNewsText] = useState("")
  const [sentimentResult, setSentimentResult] = useState<{
    sentiment: string;
    score: number;
    scores: {
      positive: number;
      neutral: number;
      negative: number;
    };
    confidence: number;
  } | null>(null)
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false)
  const [savedNews, setSavedNews] = useState<Array<{
    id: string;
    text: string;
    sentiment: string;
    score: number;
    scores: {
      positive: number;
      neutral: number;
      negative: number;
    };
    confidence: number;
    timestamp: Date;
  }>>([])

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
    selectedStrategy: { zh: "当前选定策略", en: "Currently Selected Strategy" },
    selectThisStrategy: { zh: "选择此策略", en: "Select This Strategy" },
    strategySelected: { zh: "策略已选定", en: "Strategy Selected" },
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
    // News Sentiment Analysis
    newsInputPlaceholder: { zh: "请输入新闻文本进行情感分析...", en: "Enter news text for sentiment analysis..." },
    analyzeNews: { zh: "分析情感", en: "Analyze Sentiment" },
    analyzingSentiment: { zh: "分析中...", en: "Analyzing..." },
    sentimentResult: { zh: "情感分析结果", en: "Sentiment Analysis Result" },
    saveNews: { zh: "保存新闻", en: "Save News" },
    newsSaved: { zh: "新闻已保存", en: "News Saved" },
    newsHistory: { zh: "新闻历史", en: "News History" },
    noNewsHistory: { zh: "暂无新闻历史", en: "No News History" },
    clearHistory: { zh: "清空历史", en: "Clear History" },
    positive: { zh: "积极", en: "Positive" },
    negative: { zh: "消极", en: "Negative" },
    inputRequired: { zh: "输入必填", en: "Input Required" },
    analysisComplete: { zh: "分析完成", en: "Analysis Complete" },
    analysisError: { zh: "分析失败", en: "Analysis Error" },
    noDataToSave: { zh: "没有数据保存", en: "No Data to Save" },
    historyCleared: { zh: "历史已清空", en: "History Cleared" },
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
    // 新增汇率预测对战文本
    predictionBattleMode: { zh: "汇率预测对战", en: "Rate Prediction Battle" },
    strategyBattleMode: { zh: "策略对战", en: "Strategy Battle" },
    chooseBattleMode: { zh: "选择对战模式", en: "Choose Battle Mode" },
    predictionBattleDescription: {
      zh: "选择货币后，系统随机选择历史5天时间段，你和AI都预测这5天的汇率走势，比较准确性！",
      en: "Choose a currency, the system randomly selects a 5-day historical period, you and AI predict the exchange rate trend, comparing accuracy!"
    },
    
    // 银行兑换相关翻译
    bankOfChina: { zh: "中国银行", en: "Bank of China" },
    icbc: { zh: "工商银行", en: "ICBC" },
    cmb: { zh: "招商银行", en: "China Merchants Bank" },
    ccb: { zh: "建设银行", en: "China Construction Bank" },
    domesticAirport: { zh: "国内机场", en: "Domestic Airport" },
    foreignAirport: { zh: "国外机场", en: "Foreign Airport" },
    atmWithdrawal: { zh: "ATM取现", en: "ATM Withdrawal" },
    
    // 新增优势翻译（避免重复）
    goodService: { zh: "服务优质", en: "Good Service" },
    advanceBookingRequired: { zh: "需提前预约", en: "Advance Booking Required" },
    feesForAllCards: { zh: "所有卡收费", en: "Fees for All Cards" },
    longBookingTime: { zh: "预约时间长", en: "Long Booking Time" },
    weekendUnavailable: { zh: "周末不可用", en: "Weekend Unavailable" },
    higherCost: { zh: "成本较高", en: "Higher Cost" },
    muchWorseRate: { zh: "汇率很差", en: "Much Worse Rate" },
    veryhighCost: { zh: "成本很高", en: "Very High Cost" },
    
    // 手续费计算相关
    feeCalculation: { zh: "手续费计算", en: "Fee Calculation" },
    baseFee: { zh: "基础费用", en: "Base Fee" },
    additionalFee: { zh: "附加费用", en: "Additional Fee" },
    finalRate: { zh: "最终汇率", en: "Final Rate" },
    totalFeeAmount: { zh: "总手续费", en: "Total Fee Amount" },
    effectiveRate: { zh: "有效汇率", en: "Effective Rate" },
    selectCurrency: { zh: "选择货币", en: "Select Currency" },
    startPredictionBattle: { zh: "开始预测对战", en: "Start Prediction Battle" },
    historicalData: { zh: "历史数据", en: "Historical Data" },
    predictionPeriod: { zh: "预测期间", en: "Prediction Period" },
    enterPredictions: { zh: "输入你的预测", en: "Enter Your Predictions" },
    submitPredictions: { zh: "提交预测", en: "Submit Predictions" },
    day: { zh: "第{day}天", en: "Day {day}" },
    playerPrediction: { zh: "你的预测", en: "Your Prediction" },
    aiPrediction: { zh: "AI预测", en: "AI Prediction" },
    actualRate: { zh: "真实汇率", en: "Actual Rate" },
    accuracy: { zh: "准确率", en: "Accuracy" },
    battleResults: { zh: "对战结果", en: "Battle Results" },
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
    // Rate Forecast Section translations
    exchangeRateForecast: { zh: "未来汇率预测", en: "Exchange Rate Forecast" },
    rateLoadingMessage: { zh: "汇率预测加载中...", en: "Exchange rate prediction loading..." },
    initializingAIModel: { zh: "正在初始化AI模型...", en: "Initializing AI model..." },
    predictionMethodLabel: { zh: "预测方法", en: "Prediction Method" },
    aiEnhanced: { zh: "🤖 AI增强", en: "🤖 AI Enhanced" },
    statisticalSimulation: { zh: "📊 统计模拟", en: "📊 Statistical Simulation" },
    recommendedPurchaseTime: { zh: "🎯 推荐购买时间", en: "🎯 Recommended Purchase Time" },
    exchangeRateLabel: { zh: "汇率", en: "Exchange Rate" },
    lstmNeuralNetwork: { zh: "🧠 LSTM神经网络", en: "🧠 LSTM Neural Network" },
    newsSentimentAnalysis: { zh: "结合新闻情感分析", en: "Combined with news sentiment analysis" },
    statisticalAlgorithm: { zh: "📈 统计模拟算法", en: "📈 Statistical Simulation Algorithm" },
    basedOnHistoricalVolatility: { zh: "基于历史波动模式", en: "Based on historical volatility patterns" },
    highestRate: { zh: "最高汇率", en: "Highest Rate" },
    peakPeriod: { zh: "峰值时期", en: "Peak Period" },
    lowestRate: { zh: "最低汇率", en: "Lowest Rate" },
    troughPeriod: { zh: "谷底时期", en: "Trough Period" },
    volatilityRange: { zh: "波动幅度", en: "Volatility Range" },
    optimalPurchaseTimingRecommendation: { zh: "最佳购买时机建议", en: "Optimal Purchase Timing Recommendation" },
    aiEnhancedPrediction: { zh: "AI增强预测", en: "AI Enhanced Prediction" },
    analysisRecommendation: { zh: "根据{method}分析，建议在 {date} 购买 {currency}，此时汇率达到峰值 {rate}，相比当前汇率可节省约 {percentage}% 的成本。", en: "Based on {method} analysis, it is recommended to purchase {currency} on {date}, when the exchange rate reaches its peak of {rate}, saving approximately {percentage}% compared to the current rate." },
    lstmModelAnalysis: { zh: "LSTM神经网络模型", en: "LSTM neural network model" },
    statisticalAnalysis: { zh: "统计学", en: "statistical analysis" },
    viewDetailedPredictionData: { zh: "查看详细预测数据 (20天)", en: "View Detailed Prediction Data (20 days)" },
    clickToExpand: { zh: "- 点击展开", en: "- Click to expand" },
    date: { zh: "日期", en: "Date" },
    predictedRate: { zh: "预测汇率", en: "Predicted Rate" },
    change: { zh: "变化", en: "Change" },
    recommendation: { zh: "建议", en: "Recommendation" },
    optimal: { zh: "🎯 最佳", en: "🎯 Optimal" },
    suitable: { zh: "📈 适合", en: "📈 Suitable" },
    wait: { zh: "📉 等待", en: "📉 Wait" },
    observe: { zh: "➡️ 观望", en: "➡️ Observe" },
    lstmDisclaimerText: { zh: "💡 预测基于LSTM神经网络模型，结合新闻情感分析，准确性较高但仅供参考。", en: "💡 Predictions are based on LSTM neural network models combined with news sentiment analysis. While highly accurate, they are for reference only." },
    statisticalDisclaimerText: { zh: "💡 此预测基于历史数据和统计分析，仅供参考。实际汇率可能受多种因素影响。", en: "💡 This prediction is based on historical data and statistical analysis, for reference only. Actual exchange rates may be affected by various factors." },
    predictionLoadingError: { zh: "预测失败", en: "Prediction failed" },
    predictionMethod: { zh: "预测方法: {method}", en: "Prediction Method: {method}" },
    lstmSentimentModel: { zh: "LSTM+情感分析模型", en: "LSTM+Sentiment Analysis Model" },
    statisticalSimulationAlgorithm: { zh: "统计学模拟算法", en: "Statistical Simulation Algorithm" },
    // Additional news analysis translations
    newsAnalysisForPrediction: { zh: "输入新闻文本进行情感分析，为汇率预测提供依据", en: "Enter news text for sentiment analysis to provide basis for exchange rate prediction" },
    predictionComparisonChart: { zh: "预测结果对比图表", en: "Prediction Comparison Chart" },
    writeRatePredictionCode: { zh: "编写您的汇率预测代码", en: "Write your exchange rate prediction code" },
    // Code editor translations
    pythonPredictionCode: { zh: "Python预测代码", en: "Python Prediction Code" },
    predictionCodePlaceholder: { 
      zh: `# 编写您的汇率预测代码
# 可用的数据接口：
# - historical_data: 历史汇率数据列表，每个元素包含 {'date': '日期', 'rate': 汇率值}
# - prediction_days: 需要预测的天数

# 示例代码：
import numpy as np

# 获取最近10天的汇率
recent_rates = [item['rate'] for item in historical_data[-10:]]

# 简单的移动平均预测
predictions = []
for i in range(prediction_days):
    # 基于移动平均预测
    avg_rate = np.mean(recent_rates[-5:])
    predictions.append(avg_rate)

# 输出预测结果
print(predictions)`, 
      en: `# Write your exchange rate prediction code
# Available data interfaces:
# - historical_data: List of historical exchange rate data, each element contains {'date': 'date', 'rate': rate_value}
# - prediction_days: Number of days to predict

# Example code:
import numpy as np

# Get the exchange rates of the last 10 days
recent_rates = [item['rate'] for item in historical_data[-10:]]

# Simple moving average prediction
predictions = []
for i in range(prediction_days):
    # Prediction based on moving average
    avg_rate = np.mean(recent_rates[-5:])
    predictions.append(avg_rate)

# Output prediction results
print(predictions)`
    },
    // Additional prediction battle translations
    codeInstructions: { zh: "说明：", en: "Instructions:" },
    codeExecutionEnvironment: { zh: "您的代码将在安全的Python环境中执行", en: "Your code will be executed in a secure Python environment" },
    dataAnalysisLibraries: { zh: "可以使用 numpy, pandas 等常用数据分析库", en: "You can use common data analysis libraries like numpy, pandas" },
    outputRequirement: { zh: "代码必须输出一个包含{days}个预测值的列表", en: "Code must output a list containing {days} prediction values" },
    outputFormatExample: { zh: "输出格式示例：[6.8234, 6.8456, 6.8123, 6.7890, 6.8011]", en: "Output format example: [6.8234, 6.8456, 6.8123, 6.7890, 6.8011]" },
    predictionPeriodDesc: { zh: "请根据上方的历史汇率走势预测这5天的汇率值", en: "Please predict the exchange rate values for these 5 days based on the historical trend above" },
    dayLabel: { zh: "第{day}天:", en: "Day {day}:" },
    // Cover page translations
    welcomeTitle: { zh: "欢迎使用智能货币兑换策略系统", en: "Welcome to Intelligent Currency Exchange Strategy System" },
    welcomeSubtitle: { zh: "基于AI与大数据的智能金融决策平台", en: "AI and Big Data Powered Financial Decision Platform" },
    coverDescription: { zh: "集成多源数据分析、机器学习预测、实时市场监控于一体的综合性金融服务平台", en: "Comprehensive financial service platform integrating multi-source data analysis, machine learning prediction, and real-time market monitoring" },
    enterSystem: { zh: "进入系统", en: "Enter System" },
    keyFeatures: { zh: "核心功能", en: "Key Features" },
    intelligentPrediction: { zh: "智能预测", en: "Intelligent Prediction" },
    intelligentPredictionDesc: { zh: "LSTM神经网络结合情感分析", en: "LSTM Neural Network with Sentiment Analysis" },
    realtimeMonitoring: { zh: "实时监控", en: "Real-time Monitoring" },
    realtimeMonitoringDesc: { zh: "多维度市场数据实时追踪", en: "Multi-dimensional Market Data Real-time Tracking" },
    strategicOptimization: { zh: "策略优化", en: "Strategic Optimization" },
    strategicOptimizationDesc: { zh: "AI驱动的最优决策建议", en: "AI-driven Optimal Decision Recommendations" },
    multiLanguageSupport: { zh: "多语言支持", en: "Multi-language Support" },
    multiLanguageSupportDesc: { zh: "中英文无缝切换体验", en: "Seamless Chinese-English Experience" },
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

  // Helper to get channel-specific steps based on bank type
  const getChannelSteps = (channelType: string, purpose: string, currentLanguage: "zh" | "en") => {
    const baseSteps: { [key: string]: { zh: string[]; en: string[] } } = {
      BANK: {
        zh: [
          "在线预约银行网点（提前2-3天）",
          "准备身份证、银行卡等必要材料",
          "按预约时间前往指定网点",
          "填写外汇购买申请表",
          "确认汇率和手续费",
          "完成付款并取得外币现钞",
          "妥善保管兑换凭证"
        ],
        en: [
          "Book bank appointment online (2-3 days in advance)",
          "Prepare ID, bank card and necessary materials",
          "Visit designated branch at scheduled time",
          "Fill out foreign exchange application form",
          "Confirm exchange rate and fees",
          "Complete payment and collect foreign currency",
          "Keep exchange receipt safely"
        ],
      },
      AIRPORT_DOMESTIC: {
        zh: [
          "抵达机场后寻找外币兑换柜台",
          "出示身份证和出境机票",
          "告知兑换币种和金额",
          "确认汇率（通常比银行差5-10%）",
          "完成现金兑换",
          "收好外币和凭证"
        ],
        en: [
          "Find currency exchange counter at airport",
          "Show ID and departure ticket",
          "Specify currency type and amount",
          "Confirm exchange rate (usually 5-10% worse than banks)",
          "Complete cash exchange",
          "Keep foreign currency and receipt safely"
        ],
      },
      AIRPORT_FOREIGN: {
        zh: [
          "到达国外机场后寻找兑换点",
          "出示护照和签证",
          "兑换所需外币（汇率较差）",
          "仅建议少量应急兑换",
          "保存好兑换凭证"
        ],
        en: [
          "Find exchange point at foreign airport",
          "Show passport and visa",
          "Exchange needed foreign currency (poor rates)",
          "Only recommended for small emergency amounts",
          "Keep exchange receipt"
        ],
      },
      ATM_FOREIGN: {
        zh: [
          "出发前开通银行卡境外取现功能",
          "了解目的地ATM网络和手续费",
          "抵达后寻找合作银行ATM",
          "使用银联卡取现（推荐）",
          "确认取现金额和手续费",
          "妥善保管现金和凭条"
        ],
        en: [
          "Activate overseas withdrawal before departure",
          "Learn about destination ATM networks and fees",
          "Find partner bank ATMs upon arrival",
          "Use UnionPay card for withdrawal (recommended)",
          "Confirm withdrawal amount and fees",
          "Keep cash and receipt safely"
        ],
      },
    }

    let steps = baseSteps[channelType]?.[currentLanguage] || baseSteps.BANK[currentLanguage]

    // Add bank-specific tips based on channel name
    if (channelType === "BANK") {
      const bankSpecificTips: { [key: string]: { zh: string[]; en: string[] } } = {
        "中国银行": {
          zh: ["提示：中国银行外币兑换网点最多，建议提前2天预约"],
          en: ["Tip: Bank of China has most foreign exchange branches, book 2 days in advance"]
        },
        "工商银行": {
          zh: ["提示：工商银行需提前3天预约，周日无法线上操作"],
          en: ["Tip: ICBC requires 3-day advance booking, no online operations on Sunday"]
        },
        "招商银行": {
          zh: ["提示：招商银行所有卡均收费，但服务相对优质"],
          en: ["Tip: CMB charges fees for all cards but offers better service"]
        },
        "建设银行": {
          zh: ["提示：建设银行兑换网点较少，建议提前电话确认"],
          en: ["Tip: CCB has fewer exchange branches, call ahead to confirm"]
        }
      }
      
      // Add bank-specific tips if available
      for (const [bankName, tips] of Object.entries(bankSpecificTips)) {
        if (optimalStrategy?.channel.includes(bankName)) {
          steps = [...steps, ...tips[currentLanguage]]
          break
        }
      }
    }

    return steps
  }

  // Purchase Request State
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest>({
    amount: 1000, // Assuming this is the amount of TARGET currency user wants to buy (e.g., 1000 SGD)
    fromCurrency: "CNY", // Base currency (e.g., CNY)
    toCurrency: "SGD", // Target currency (e.g., SGD)
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

  // 新增汇率预测对战状态
  const [predictionBattle, setPredictionBattle] = useState<{
    competitionId: string
    currency: string
    historicalData: { date: string; rate: number }[]
    predictionPeriod: {
      startDate: string
      endDate: string
      actualRates: number[]
    }
    playerPredictions: number[]
    status: 'setup' | 'predicting' | 'submitted' | 'results'
    results?: {
      playerPredictions: number[]
      aiPredictions: number[]
      actualRates: number[]
      playerAccuracy: number
      aiAccuracy: number
      winner: 'player' | 'ai' | 'tie'
      codeOutput?: string
      codeStderr?: string
    }
  } | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('HKD')
  const [predictionDays, setPredictionDays] = useState<number>(5)
  const [predictionMode, setPredictionMode] = useState<'manual' | 'code'>('manual')
  
  // Function to get default prediction code based on language
  const getDefaultPredictionCode = (lang: "zh" | "en") => {
    return lang === "zh" ? `# 汇率预测代码示例
import numpy as np

# 获取最近的汇率数据
recent_rates = [item['rate'] for item in historical_data[-10:]]

# 计算简单移动平均
window_size = min(5, len(recent_rates))
moving_avg = np.mean(recent_rates[-window_size:])

# 计算趋势
if len(recent_rates) >= 2:
    trend = (recent_rates[-1] - recent_rates[-window_size]) / window_size
else:
    trend = 0

# 生成预测
predictions = []
for i in range(prediction_days):
    # 基于移动平均和趋势预测
    predicted_rate = moving_avg + trend * (i + 1) * 0.5
    predictions.append(round(predicted_rate, 4))

# 输出结果
print(predictions)` : `# Exchange Rate Prediction Code Example
import numpy as np

# Get recent exchange rate data
recent_rates = [item['rate'] for item in historical_data[-10:]]

# Calculate simple moving average
window_size = min(5, len(recent_rates))
moving_avg = np.mean(recent_rates[-window_size:])

# Calculate trend
if len(recent_rates) >= 2:
    trend = (recent_rates[-1] - recent_rates[-window_size]) / window_size
else:
    trend = 0

# Generate predictions
predictions = []
for i in range(prediction_days):
    # Predict based on moving average and trend
    predicted_rate = moving_avg + trend * (i + 1) * 0.5
    predictions.append(round(predicted_rate, 4))

# Output results
print(predictions)`;
  }
  
  const [predictionCode, setPredictionCode] = useState<string>(getDefaultPredictionCode(language))
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false)

  // Update prediction code when language changes
  useEffect(() => {
    setPredictionCode(getDefaultPredictionCode(language));
  }, [language]);

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
    setOptimalStrategy(null)
    setSelectedPlanId(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const baseTargetCurrencyRate = fetchedRates[purchaseRequest.toCurrency] || 1.0
      const baseFromCurrencyRate = fetchedRates[purchaseRequest.fromCurrency] || 1.0
      const currentRate = baseTargetCurrencyRate / baseFromCurrencyRate
      
      // 如果用户已选择特定策略，使用用户选择的策略
      let strategiesToAnalyze: DetailedExchangeStrategy[] = []
      
      if (selectedStrategyIds.length > 0) {
        // 使用用户选择的策略
        strategiesToAnalyze = detailedExchangeStrategies.filter(strategy => 
          selectedStrategyIds.includes(strategy.id)
        )
        console.log('Using user selected strategies:', strategiesToAnalyze.map(s => s.name))
      } else {
        // 如果没有选择，使用策略选择器自动选择最优策略
        strategiesToAnalyze = strategySelector.selectOptimalStrategies(
          purchaseRequest.toCurrency,
          purchaseRequest.amount,
          isLocalCard,
          currentRate,
          purchaseRequest.urgency,
          {
            ...userPreferences,
            cardType: isLocalCard ? 'local' : 'non-local',
            urgencyLevel: purchaseRequest.urgency,
            maxAcceptableFee: purchaseRequest.maxFee
          }
        )
        console.log('Using auto-selected optimal strategies:', strategiesToAnalyze.map(s => s.name))
      }
      
      setAvailableStrategies(strategiesToAnalyze)
      
      if (strategiesToAnalyze.length === 0) {
        throw new Error('没有找到合适的兑换策略')
      }
      
      // 选择最优策略（如果有多个策略，选择成本最低的）
      const bestStrategy = strategiesToAnalyze[0]
      const totalCost = strategySelector.calculateTotalCost(
        bestStrategy, 
        purchaseRequest.toCurrency, 
        purchaseRequest.amount, 
        isLocalCard, 
        currentRate
      )
      
      // 计算节省金额（相对于最差选项）
      const allCosts = strategiesToAnalyze.map(strategy => 
        strategySelector.calculateTotalCost(strategy, purchaseRequest.toCurrency, purchaseRequest.amount, isLocalCard, currentRate)
      )
      const maxCost = Math.max(...allCosts)
      const savings = maxCost - totalCost
      
      // 获取LSTM汇率预测
      let ratePrediction: any = null
      try {
        console.log('Requesting LSTM prediction for:', purchaseRequest.fromCurrency, '->', purchaseRequest.toCurrency, 'Bank:', bestStrategy.institution.name)
        
        const predictionResponse = await fetch('/api/rate-prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromCurrency: purchaseRequest.fromCurrency,
            toCurrency: purchaseRequest.toCurrency,
            days: 20,
            bankName: bestStrategy.institution.name // 传递银行名称用于选择数据集
          })
        })
        
        if (predictionResponse.ok) {
          ratePrediction = await predictionResponse.json()
          console.log('LSTM prediction received:', ratePrediction)
        } else {
          console.warn('LSTM prediction failed, using current rate')
        }
      } catch (error) {
        console.error('Error fetching LSTM prediction:', error)
      }
      
      // 生成替代方案
      const alternatives = strategiesToAnalyze.slice(1, 4).map(altStrategy => {
        const altCost = strategySelector.calculateTotalCost(
          altStrategy, 
          purchaseRequest.toCurrency, 
          purchaseRequest.amount, 
          isLocalCard, 
          currentRate
        )
        const altCostStructure = altStrategy.costStructure[purchaseRequest.toCurrency]
        const altCardType = isLocalCard ? altCostStructure.localCard : altCostStructure.nonLocalCard
        const feePercentage = ((altCardType.baseFee || 0) + (purchaseRequest.amount * currentRate * (altCardType.percentageFee || 0) / 100)) / (purchaseRequest.amount * currentRate) * 100
        
        return {
          channel: altStrategy.name,
          rate: Number.parseFloat(currentRate.toFixed(4)),
          fees: Number.parseFloat(feePercentage.toFixed(2)),
          totalCost: Number.parseFloat(altCost.toFixed(2)),
          timeRequired: altStrategy.timeRequirements.appointmentDays > 0 ? 
            `需提前${altStrategy.timeRequirements.appointmentDays}天预约` : 
            altStrategy.timeRequirements.processingTime
        }
      })
      
      // 计算手续费百分比
      const costStructure = bestStrategy.costStructure[purchaseRequest.toCurrency]
      const cardType = isLocalCard ? costStructure.localCard : costStructure.nonLocalCard
      const baseFeeAmount = cardType.baseFee || 0
      const percentageFeeAmount = (purchaseRequest.amount * currentRate * (cardType.percentageFee || 0)) / 100
      const totalFeeAmount = baseFeeAmount + percentageFeeAmount
      const feePercentage = (totalFeeAmount / (purchaseRequest.amount * currentRate)) * 100

      const strategy: OptimalStrategy = {
        id: bestStrategy.id,
        channel: bestStrategy.name,
        channelType: bestStrategy.category,
        rate: Number.parseFloat(currentRate.toFixed(4)),
        fees: Number.parseFloat(feePercentage.toFixed(2)),
        totalCost: Number.parseFloat(totalCost.toFixed(2)),
        savings: Number.parseFloat(savings.toFixed(2)),
        timeRequired: bestStrategy.timeRequirements.appointmentDays > 0 ? 
          `需提前${bestStrategy.timeRequirements.appointmentDays}天预约` : 
          bestStrategy.timeRequirements.processingTime,
        stepsInfo: { 
          channelType: bestStrategy.category, 
          purpose: "购钞" 
        },
        prosKeys: bestStrategy.prosKeys,
        consKeys: bestStrategy.consKeys,
        riskLevel: bestStrategy.riskLevel,
        confidence: bestStrategy.confidence,
        alternatives,
        // 基于LSTM预测的技术指标数据
        technicalIndicators: ratePrediction ? {
          rsi: ratePrediction.technical_indicators?.rsi || Math.floor(Math.random() * 100),
          macd: ratePrediction.technical_indicators?.macd || Number.parseFloat(((Math.random() - 0.5) * 2).toFixed(4)),
          bollinger: ratePrediction.technical_indicators?.bollinger || (["UPPER", "MIDDLE", "LOWER"] as const)[Math.floor(Math.random() * 3)],
          support: ratePrediction.technical_indicators?.support || Number.parseFloat((currentRate * 0.98).toFixed(4)),
          resistance: ratePrediction.technical_indicators?.resistance || Number.parseFloat((currentRate * 1.02).toFixed(4)),
        } : {
          rsi: Math.floor(Math.random() * 100),
          macd: Number.parseFloat(((Math.random() - 0.5) * 2).toFixed(4)),
          bollinger: (["UPPER", "MIDDLE", "LOWER"] as const)[Math.floor(Math.random() * 3)],
          support: Number.parseFloat((currentRate * 0.98).toFixed(4)),
          resistance: Number.parseFloat((currentRate * 1.02).toFixed(4)),
        },
        marketSentiment: ratePrediction ? {
          score: ratePrediction.market_sentiment?.score || Math.floor(Math.random() * 100),
          trend: ratePrediction.market_sentiment?.trend || (["BULLISH", "BEARISH", "NEUTRAL"] as const)[Math.floor(Math.random() * 3)],
          volatility: ratePrediction.market_sentiment?.volatility || Math.floor(Math.random() * 20) + 10,
        } : {
          score: Math.floor(Math.random() * 100),
          trend: (["BULLISH", "BEARISH", "NEUTRAL"] as const)[Math.floor(Math.random() * 3)],
          volatility: Math.floor(Math.random() * 20) + 10,
        },
        marketConditions: {
          volatility: ratePrediction?.volatility || Number.parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          trend: ratePrediction?.trend || ["上升", "下降", "稳定"][Math.floor(Math.random() * 3)],
          liquidity: ["高", "中", "低"][Math.floor(Math.random() * 3)],
          recommendation: ratePrediction ? 
            `LSTM预测建议：${ratePrediction.recommendation || `使用${bestStrategy.name}进行兑换`}` :
            `推荐使用${bestStrategy.name}，${bestStrategy.features.join('、')}`,
        },
      }

      setOptimalStrategy(strategy)
      setActiveTab("results")
    } catch (error) {
      console.error("Strategy analysis failed:", error)
      toast({
        title: "分析失败",
        description: "策略分析过程中出现错误，请重试",
        variant: "destructive"
      })
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

  const resetPredictionBattle = () => {
    setPredictionBattle(null)
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
          newsCount: result.importedCount || 0, // Set to the new count from backend with fallback
          sentiment: result.overallSentiment ?? 0, // Update with calculated sentiment, fallback to 0
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

  // Handle news sentiment analysis
  const handleAnalyzeNews = async () => {
    if (!newsText.trim()) {
      toast({
        title: t("inputRequired"),
        description: "请输入新闻文本",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzingSentiment(true)
    try {
      console.log("发送情感分析请求...", { text: newsText.substring(0, 100) + "..." })
      
      const response = await fetch("/api/sentiment/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newsText }),
      })

      console.log("API响应状态:", response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log("Sentiment API response:", result) // Debug log
        
        // Handle the new API response format with all sentiment scores
        const sentiment = result.sentiment || result.label || 'neutral'
        const score = result.score ?? 0
        const scores = result.scores || { positive: 0, neutral: 0, negative: 0 }
        const confidence = result.confidence ?? 0

        // Ensure numeric values
        const numericScore = isNaN(Number(score)) ? 0 : Number(score)
        const numericConfidence = isNaN(Number(confidence)) ? 0 : Number(confidence)

        setSentimentResult({
          sentiment: sentiment,
          score: numericScore,
          scores: {
            positive: isNaN(Number(scores.positive)) ? 0 : Number(scores.positive),
            neutral: isNaN(Number(scores.neutral)) ? 0 : Number(scores.neutral),
            negative: isNaN(Number(scores.negative)) ? 0 : Number(scores.negative)
          },
          confidence: numericConfidence,
        })
        
        toast({
          title: t("analysisComplete"),
          description: `情感: ${sentiment}, 分数: ${numericScore.toFixed(2)}`,
        })
      } else {
        const errorText = await response.text()
        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: response.url
        })
        
        // 提供更详细的错误信息
        let errorMessage = `分析失败 (${response.status})`
        if (response.status === 500) {
          errorMessage = "服务器内部错误，请检查后端服务"
        } else if (response.status === 502 || response.status === 503) {
          errorMessage = "后端服务不可用，请稍后重试"
        } else if (response.status === 404) {
          errorMessage = "API 端点不存在"
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
      toast({
        title: t("analysisError"),
        description: "情感分析失败，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingSentiment(false)
    }
  }

  // Handle saving news to history
  const handleSaveNews = () => {
    if (!sentimentResult || !newsText.trim()) {
      toast({
        title: t("noDataToSave"),
        description: "请先进行情感分析",
        variant: "destructive",
      })
      return
    }

    const newNewsItem = {
      id: Date.now().toString(),
      text: newsText,
      sentiment: sentimentResult.sentiment,
      score: sentimentResult.score,
      scores: sentimentResult.scores,
      confidence: sentimentResult.confidence,
      timestamp: new Date(),
    }

    setSavedNews((prev) => [newNewsItem, ...prev.slice(0, 19)]) // Keep only 20 latest news
    
    // Update market sentiment based on the new news
    setMarketData((prev) => ({
      ...prev,
      sentiment: ((prev.sentiment ?? 0) * (prev.newsCount ?? 0) + (sentimentResult.score ?? 0)) / ((prev.newsCount ?? 0) + 1),
      newsCount: (prev.newsCount ?? 0) + 1,
    }))

    toast({
      title: t("newsSaved"),
      description: "新闻已保存到历史记录",
    })

    // Clear the form
    setNewsText("")
    setSentimentResult(null)
  }

  // Clear news history
  const handleClearHistory = () => {
    setSavedNews([])
    toast({
      title: t("historyCleared"),
      description: "新闻历史已清空",
    })
  }

  return (
    <div className="min-h-screen">
      {/* Cover Page */}
      {showCover && (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-32 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-10 left-32 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
            </div>
          </div>

          {/* Language Toggle - Cover */}
          <div className="absolute top-6 right-6 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
              className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:text-white"
            >
              {language === "zh" ? "English" : "中文"}
            </Button>
          </div>

          {/* Main Cover Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo and Title */}
              <div className="mb-8 animate-fade-in-up">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl">
                    <svg 
                      className="h-16 w-16 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L13.09 6.26L18 7L13.09 7.74L12 12L10.91 7.74L6 7L10.91 6.26L12 2M12 2L8.5 8.5L2 12L8.5 15.5L12 22L15.5 15.5L22 12L15.5 8.5L12 2Z" 
                            opacity="0.3"/>
                      <path d="M12 6L13 10L17 11L13 12L12 16L11 12L7 11L11 10L12 6Z"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                  {t("welcomeTitle")}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 font-light drop-shadow-md">
                  {t("welcomeSubtitle")}
                </p>
                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12 drop-shadow-sm">
                  {t("coverDescription")}
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up animation-delay-500">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl">
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-white font-semibold mb-2">{t("intelligentPrediction")}</h3>
                  <p className="text-white/80 text-sm">{t("intelligentPredictionDesc")}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-white font-semibold mb-2">{t("realtimeMonitoring")}</h3>
                  <p className="text-white/80 text-sm">{t("realtimeMonitoringDesc")}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-white font-semibold mb-2">{t("strategicOptimization")}</h3>
                  <p className="text-white/80 text-sm">{t("strategicOptimizationDesc")}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl">
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="text-white font-semibold mb-2">{t("multiLanguageSupport")}</h3>
                  <p className="text-white/80 text-sm">{t("multiLanguageSupportDesc")}</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="animate-fade-in-up animation-delay-1000">
                <Button
                  size="lg"
                  onClick={() => setShowCover(false)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-semibold py-4 px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  {t("enterSystem")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Application */}
      {!showCover && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50/50 to-pink-50/50 relative overflow-hidden">
          {/* 添加装饰性背景元素 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 via-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          </div>
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-sky-500 to-cyan-600 rounded-lg shadow-lg">
                    <svg 
                      className="h-6 w-6 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L13.09 6.26L18 7L13.09 7.74L12 12L10.91 7.74L6 7L10.91 6.26L12 2M12 2L8.5 8.5L2 12L8.5 15.5L12 22L15.5 15.5L22 12L15.5 8.5L12 2Z" 
                            opacity="0.3"/>
                      <path d="M12 6L13 10L17 11L13 12L12 16L11 12L7 11L11 10L12 6Z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">{t("systemTitle")}</h1>
                    <p className="text-sm text-slate-600">
                      {language === "zh" ? "智能金融决策平台" : "Intelligent Financial Platform"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      {t("realtimeData")}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      🤖 {t("aiAnalysis")}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
                    className="bg-white/50"
                  >
                    {language === "zh" ? "English" : "中文"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCover(true)}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    {language === "zh" ? "返回首页" : "Home"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content with improved spacing */}
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-white/80 via-purple-50/80 to-pink-50/80 backdrop-blur-md border border-purple-200/50 shadow-lg">
                <TabsTrigger 
                  value="purchase" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:scale-102"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t("purchaseStrategy")}
                </TabsTrigger>
                <TabsTrigger 
                  value="results"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:scale-102"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t("resultsDisplay")}
                </TabsTrigger>
                {availableStrategies.length > 0 && (
                  <TabsTrigger 
                    value="strategies"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:scale-102"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    策略选择
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="system"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:scale-102"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {t("systemMonitor")}
                </TabsTrigger>
                <TabsTrigger 
                  value="competition"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:scale-102"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t("aiCompetition")}
                </TabsTrigger>
              </TabsList>

          {/* Purchase Strategy Tab */}
          <TabsContent value="purchase" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              {/* Purchase Request Form */}
              <Card className="animate-slide-in-left shadow-xl border-0 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30">
                <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-transparent to-cyan-600/20"></div>
                  <CardTitle className="flex items-center gap-2 relative z-10">
                    <DollarSign className="h-5 w-5" />
                    {t("purchaseRequirement")}
                  </CardTitle>
                  <CardDescription className="text-emerald-100 relative z-10">{t("purchaseRequirementDesc")}</CardDescription>
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

                  {/* Bank Card Type */}
                  <div className="space-y-3">
                    <Label>银行卡类型</Label>
                    <RadioGroup
                      value={isLocalCard ? "local" : "nonlocal"}
                      onValueChange={(value) => setIsLocalCard(value === "local")}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="local" id="local-card" />
                        <Label htmlFor="local-card" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          本地卡
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nonlocal" id="nonlocal-card" />
                        <Label htmlFor="nonlocal-card" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          异地卡
                        </Label>
                      </div>
                    </RadioGroup>
                    <div className="text-sm text-gray-600">
                      {isLocalCard ? "本地卡通常享受更低的手续费优惠" : "异地卡可能产生额外的跨行转账费用"}
                    </div>
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
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
              <div className="space-y-6">
                {/* Original Optimal Strategy Display */}
                <div className="flex justify-center">
                  {/* Optimal Strategy Display (Moved from Purchase Tab) - Centered */}
                <Card className="animate-slide-in-left w-full max-w-4xl shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40">
                  <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-t-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
                    <CardTitle className="flex items-center gap-2 relative z-10">
                      <Trophy className="h-5 w-5" />
                      {selectedStrategyForDisplay ? t("selectedStrategy") : t("optimalPurchaseStrategy")}
                    </CardTitle>
                    <CardDescription className="text-blue-100 relative z-10">
                      {selectedStrategyForDisplay 
                        ? "您选择的购钞策略详细信息" 
                        : t("optimalPurchaseStrategyDesc")
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Strategy Overview */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-6 w-6 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-green-800">
                                {selectedStrategyForDisplay ? selectedStrategyForDisplay.name : optimalStrategy.channel}
                              </h3>
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
                                {purchaseRequest.amount.toLocaleString()} {currencies.find((c) => c.code === purchaseRequest.toCurrency)?.symbol}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>
                                {t("exchangeRate")} ({purchaseRequest.fromCurrency}/{purchaseRequest.toCurrency}):
                              </span>
                              <span>{optimalStrategy.rate.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>基础兑换费用:</span>
                              <span>{(purchaseRequest.amount * optimalStrategy.rate).toFixed(2)} ¥</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isLocalCard ? "本地卡手续费" : "异地卡手续费"}:</span>
                              <span className="text-red-600">
                                {((purchaseRequest.amount * optimalStrategy.rate * optimalStrategy.fees) / 100).toFixed(2)} ¥ ({optimalStrategy.fees}%)
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 pl-2">
                              • {isLocalCard ? "使用本地银行卡，享受优惠费率" : "使用异地银行卡，产生额外手续费"}
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
                            <div className="text-xs text-gray-500">
                              * 节省金额相比最贵渠道计算
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Bank-specific Information */}
                      <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            银行政策说明
                          </h4>
                          <div className="space-y-2 text-sm">
                            {optimalStrategy.channel.includes("中国银行") && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="font-medium text-blue-800">中国银行特点:</div>
                                <ul className="text-blue-700 text-xs mt-1 space-y-1">
                                  <li>• 本地卡免手续费，异地卡收取1‰手续费(最高200元)</li>
                                  <li>• 需提前2天预约</li>
                                  <li>• 网点众多，支持大额兑换</li>
                                </ul>
                              </div>
                            )}
                            {optimalStrategy.channel.includes("工商银行") && (
                              <div className="p-3 bg-red-50 rounded-lg">
                                <div className="font-medium text-red-800">工商银行特点:</div>
                                <ul className="text-red-700 text-xs mt-1 space-y-1">
                                  <li>• 本地卡免费，异地卡收取0.5%手续费(20-100元)</li>
                                  <li>• 需提前3天预约</li>
                                  <li>• 周日无法线上操作</li>
                                </ul>
                              </div>
                            )}
                            {optimalStrategy.channel.includes("招商银行") && (
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="font-medium text-green-800">招商银行特点:</div>
                                <ul className="text-green-700 text-xs mt-1 space-y-1">
                                  <li>• 所有卡均收取0.5%手续费(最高50元)</li>
                                  <li>• 需提前2天预约</li>
                                  <li>• 服务优质，操作便捷</li>
                                </ul>
                              </div>
                            )}
                            {optimalStrategy.channel.includes("建设银行") && (
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="font-medium text-yellow-800">建设银行特点:</div>
                                <ul className="text-yellow-700 text-xs mt-1 space-y-1">
                                  <li>• 所有卡均收取0.05%手续费(5-50元)</li>
                                  <li>• 需提前3天预约</li>
                                  <li>• 兑换网点相对较少</li>
                                </ul>
                              </div>
                            )}
                            {optimalStrategy.channel.includes("机场") && (
                              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="font-medium text-red-800">机场兑换警告:</div>
                                <ul className="text-red-700 text-xs mt-1 space-y-1">
                                  <li>• 汇率比银行差5-30%，成本很高</li>
                                  <li>• 仅建议紧急情况下使用</li>
                                  <li>• 无需预约，可即时兑换</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 汇率预测区域 */}
                      <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            {t("exchangeRateForecast")}
                          </h4>
                          <RateForecastSection
                            fromCurrency={purchaseRequest.fromCurrency}
                            toCurrency={purchaseRequest.toCurrency}
                            lastRate={optimalStrategy.rate}
                            language={language}
                            getText={t}
                            bankName={selectedStrategyForDisplay ? selectedStrategyForDisplay.institution.name : optimalStrategy.channel}
                          />
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
                          className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {selectedPlanId === optimalStrategy.id ? t("planSelected") : t("selectThisPlan")}
                        </Button>
                        <Button
                          onClick={handleReAnalyze}
                          variant="outline"
                          className="hover:scale-105 transition-transform bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:border-indigo-400 text-blue-700 hover:text-indigo-800 shadow-md hover:shadow-lg"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t("reAnalyze")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Strategy Selection Tab */}
          <TabsContent value="strategies" className="space-y-6">
            {availableStrategies.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Target className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">策略选择</h3>
                <p className="text-slate-500">
                  请先在"购钞策略"页面填写需求并获取策略选项。
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white via-slate-50 to-gray-50">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      策略选择 ({availableStrategies.length}个可选)
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      选择您偏好的购钞策略，选定后将在"结果显示"页面展示详细信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Strategy Sorting Controls */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-3 text-blue-800">策略排序方式</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {([
                          { key: 'cost', label: '💰 成本优先', desc: '手续费最低' },
                          { key: 'convenience', label: '🏪 便利优先', desc: '操作最简单' },
                          { key: 'speed', label: '⚡ 速度优先', desc: '最快获得' },
                          { key: 'reliability', label: '🛡️ 可靠优先', desc: '最稳定' },
                          { key: 'flexibility', label: '🔄 灵活优先', desc: '最灵活' }
                        ] as const).map(({ key, label, desc }) => (
                          <Button
                            key={key}
                            variant={sortPreference === key ? "default" : "outline"}
                            size="sm"
                            className={`h-auto p-3 text-left ${
                              sortPreference === key 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                            }`}
                            onClick={() => {
                              setSortPreference(key);
                              const sorted = strategySelector.sortStrategiesByPreference(
                                availableStrategies,
                                key,
                                purchaseRequest.toCurrency,
                                purchaseRequest.amount,
                                isLocalCard,
                                (fetchedRates[purchaseRequest.toCurrency] || 1.0) / (fetchedRates[purchaseRequest.fromCurrency] || 1.0)
                              );
                              setAvailableStrategies(sorted);
                            }}
                          >
                            <div>
                              <div className="font-medium text-sm">{label}</div>
                              <div className="text-xs opacity-75">{desc}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Strategy List */}
                    <div className="space-y-4">
                      {availableStrategies.map((strategy, index) => {
                        const currentRate = (fetchedRates[purchaseRequest.toCurrency] || 1.0) / (fetchedRates[purchaseRequest.fromCurrency] || 1.0);
                        const totalCost = strategySelector.calculateTotalCost(
                          strategy,
                          purchaseRequest.toCurrency,
                          purchaseRequest.amount,
                          isLocalCard,
                          currentRate
                        );
                        const costStructure = strategy.costStructure[purchaseRequest.toCurrency];
                        const cardType = isLocalCard ? costStructure?.localCard : costStructure?.nonLocalCard;
                        
                        if (!costStructure || !cardType?.enabled) return null;

                        const isSelected = selectedStrategyForDisplay?.id === strategy.id;

                        return (
                          <Card 
                            key={strategy.id} 
                            className={`border transition-all duration-200 hover:shadow-md cursor-pointer ${
                              index === 0 
                                ? 'border-green-300 bg-green-50/50 ring-2 ring-green-200' 
                                : index === 1 
                                  ? 'border-blue-300 bg-blue-50/50' 
                                  : index === 2 
                                    ? 'border-amber-300 bg-amber-50/50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            } ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                {/* Strategy Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {index === 0 && <Badge className="bg-green-600 text-white">🏆 推荐</Badge>}
                                    {index === 1 && <Badge className="bg-blue-600 text-white">🥈 备选</Badge>}
                                    {index === 2 && <Badge className="bg-amber-600 text-white">🥉 第三</Badge>}
                                    <h3 className="font-medium text-gray-900">{strategy.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {strategy.institution.name}
                                    </Badge>
                                    {isSelected && (
                                      <Badge className="bg-indigo-600 text-white">
                                        ✓ 已选择
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                    <div>
                                      <span className="text-gray-500">总成本:</span>
                                      <div className="font-medium text-gray-900">¥{totalCost.toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">手续费:</span>
                                      <div className="font-medium">
                                        {cardType.baseFee || 0}元 + {cardType.percentageFee || 0}%
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">汇率影响:</span>
                                      <div className="font-medium">+{costStructure.exchangeRateMarkup || 0}%</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">预约时间:</span>
                                      <div className="font-medium">
                                        {strategy.timeRequirements.appointmentDays === 0 
                                          ? '无需预约' 
                                          : `${strategy.timeRequirements.appointmentDays}天`}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Strategy Ratings */}
                                  <div className="grid grid-cols-5 gap-2 mb-3">
                                    {[
                                      { key: 'cost', label: '成本', icon: '💰' },
                                      { key: 'convenience', label: '便利', icon: '🏪' },
                                      { key: 'speed', label: '速度', icon: '⚡' },
                                      { key: 'reliability', label: '可靠', icon: '🛡️' },
                                      { key: 'flexibility', label: '灵活', icon: '🔄' }
                                    ].map(({ key, label, icon }) => (
                                      <div key={key} className="text-center">
                                        <div className="text-xs text-gray-500">{icon} {label}</div>
                                        <div className="flex justify-center">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-3 w-3 ${
                                                i < Math.round(strategy.ratings[key as keyof typeof strategy.ratings] / 2)
                                                  ? 'text-yellow-400 fill-current'
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Features */}
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap gap-1">
                                      {strategy.features.slice(0, 3).map((feature, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                    
                                    {/* Operation Steps Preview */}
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                      <h4 className="font-medium text-sm mb-2">操作步骤:</h4>
                                      <ol className="text-xs text-gray-600 space-y-1">
                                        {strategy.method.steps.slice(0, 3).map((step, i) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
                                              {i + 1}
                                            </span>
                                            {step}
                                          </li>
                                        ))}
                                        {strategy.method.steps.length > 3 && (
                                          <li className="text-gray-400 ml-6">
                                            ... 等{strategy.method.steps.length - 3}个步骤
                                          </li>
                                        )}
                                      </ol>
                                    </div>
                                  </div>
                                </div>

                                {/* Selection Button */}
                                <div className="text-right ml-4 space-y-2">
                                  <div className={`px-2 py-1 rounded text-white text-xs ${
                                    strategy.riskLevel === 'LOW' ? 'bg-green-500' :
                                    strategy.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}>
                                    风险: {strategy.riskLevel}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    置信度: {strategy.confidence}%
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={isSelected ? "secondary" : "default"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        setSelectedStrategyForDisplay(null);
                                        toast({
                                          title: "取消选择",
                                          description: "已取消选择策略，将显示系统推荐的最优策略",
                                          duration: 2000,
                                        });
                                      } else {
                                        setSelectedStrategyForDisplay(strategy);
                                        toast({
                                          title: "策略已选定",
                                          description: `已选择 ${strategy.name}，请前往"结果显示"页面查看详情`,
                                          duration: 3000,
                                        });
                                        // 自动切换到结果页面
                                        setTimeout(() => setActiveTab("results"), 1000);
                                      }
                                    }}
                                    className={isSelected 
                                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                                      : "bg-indigo-600 hover:bg-indigo-700"
                                    }
                                  >
                                    {isSelected ? (
                                      <>
                                        <X className="h-4 w-4 mr-1" />
                                        取消选择
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        {t("selectThisStrategy")}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="system" className="space-y-6">
            {/* System Modules Status */}
            <Card className="animate-slide-up shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/30 to-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  <Database className="h-5 w-5 text-orange-500" />
                  {t("systemModuleMonitoring")}
                </CardTitle>
                <CardDescription className="text-orange-700/70">{t("realtimeMonitorDesc")}</CardDescription>
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
              <Card className="animate-slide-in-left shadow-lg border-0 bg-gradient-to-br from-blue-500/10 via-white to-blue-50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">{t("marketVolatility")}</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{marketData.volatility.toFixed(1)}%</div>
                  <div className="text-xs text-blue-500/70">{t("past24Hours")}</div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-left delay-100 shadow-lg border-0 bg-gradient-to-br from-purple-500/10 via-white to-purple-50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">{t("sentimentIndex")}</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {marketData.sentiment && marketData.sentiment > 0 ? "+" : ""}
                    {(marketData.sentiment ?? 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-purple-500/70">
                    {(marketData.sentiment ?? 0) > 0.2
                      ? t("optimistic")
                      : (marketData.sentiment ?? 0) < -0.2
                        ? t("pessimistic")
                        : t("neutral")}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-left delay-200 shadow-lg border-0 bg-gradient-to-br from-orange-500/10 via-white to-orange-50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Newspaper className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">{t("newsCount")}</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{marketData.newsCount}</div>
                  <div className="text-xs text-orange-500/70">{t("todayRelatedNews")}</div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-left delay-300 shadow-lg border-0 bg-gradient-to-br from-green-500/10 via-white to-emerald-50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">{t("activeCurrencyPairs")}</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{currencies.length}</div>
                  <div className="text-xs text-green-500/70">{t("supportedCurrencies")}</div>
                </CardContent>
              </Card>
            </div>

            {/* News Sentiment Analysis Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-slide-up delay-100 shadow-xl border-0 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                    <Brain className="h-5 w-5 text-pink-500" />
                    {t("sentimentAnalysis")}
                  </CardTitle>
                  <CardDescription className="text-pink-700/70">
                    {t("newsAnalysisForPrediction")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="news-text">新闻文本</Label>
                    <Textarea
                      id="news-text"
                      placeholder={t("newsInputPlaceholder")}
                      value={newsText}
                      onChange={(e) => setNewsText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnalyzeNews} 
                      disabled={isAnalyzingSentiment || !newsText.trim()}
                      className="flex-1"
                    >
                      {isAnalyzingSentiment ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      {isAnalyzingSentiment ? t("analyzingSentiment") : t("analyzeNews")}
                    </Button>
                    {sentimentResult && (
                      <Button 
                        onClick={handleSaveNews}
                        variant="outline"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {t("saveNews")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Analysis Results */}
              <Card className="animate-slide-up delay-150 shadow-xl border-0 bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    {t("sentimentResult")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sentimentResult ? (
                    <div className="space-y-4">
                      {/* 主要结果概览 */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {sentimentResult.sentiment === 'positive' ? t("positive") :
                             sentimentResult.sentiment === 'negative' ? t("negative") : t("neutral")}
                          </div>
                          <div className="text-xs text-slate-500">主要情感</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {sentimentResult.score.toFixed(3)}
                          </div>
                          <div className="text-xs text-slate-500">综合分数</div>
                        </div>
                      </div>

                      {/* 详细情感分数 */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700">详细情感分析</h4>
                        
                        {/* Positive */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600 font-medium">正面情感</span>
                            <span className="text-sm font-mono">{sentimentResult.scores.positive.toFixed(3)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${sentimentResult.scores.positive * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Neutral */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">中性情感</span>
                            <span className="text-sm font-mono">{sentimentResult.scores.neutral.toFixed(3)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${sentimentResult.scores.neutral * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Negative */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-600 font-medium">负面情感</span>
                            <span className="text-sm font-mono">{sentimentResult.scores.negative.toFixed(3)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${sentimentResult.scores.negative * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* 置信度 */}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium">主要情感置信度</span>
                            <span className="text-sm font-mono text-blue-600">{(sentimentResult.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm">请输入新闻文本并分析</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Import News Data Card */}
            <Card className="animate-slide-up delay-200 shadow-xl border-0 bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  <Newspaper className="h-5 w-5 text-amber-500" />
                  {t("importNewsData")}
                </CardTitle>
                <CardDescription className="text-amber-700/70">{t("importNewsDataDesc")}</CardDescription>
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

          {/* AI Competition Tab */}
          <TabsContent value="competition" className="space-y-8">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🤖 AI汇率预测对战
              </h2>
              <p className="text-gray-600">挑战AI模型，测试你的汇率预测能力</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Trading Pair & Chart */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trading Pair Selection */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-violet-50/40 to-purple-50/40">
                  <CardHeader className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 justify-center">
                      <TrendingUp className="h-5 w-5" />
                      {t("tradingPair")}
                    </CardTitle>
                    <CardDescription className="text-violet-100 text-center">{t("exchangeRateChart")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Currency Selection */}
                    <div className="flex justify-center mb-6">
                      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                        <div className="space-y-2">
                          <Label className="text-center block">{t("baseCurrencyLabel")}</Label>
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
                          <Label className="text-center block">{t("targetCurrencyLabel")}</Label>
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
                    </div>

                    {/* Current Rate Display */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-6">
                      <div className="text-center">
                        <div className="text-sm text-blue-600 mb-1">{t("currentRate")}</div>
                        <div className="text-4xl font-bold text-blue-800 mb-2">
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
                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                      <h4 className="font-medium mb-3 text-center">{t("exchangeRateChartTitle")}</h4>
                      <div className="w-full overflow-x-auto">
                        <SimpleLineChart data={rateHistory} width={600} height={200} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Indicators */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-gray-600" />
                      市场指标
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-semibold text-green-700 text-sm mb-1">{t("volatilityLabel")}</div>
                        <div className="text-2xl font-bold text-green-600">{marketData.volatility.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-700 text-sm mb-1">{t("trendLabel")}</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {marketData.trendDirection === "up"
                            ? "📈 " + t("upward")
                            : marketData.trendDirection === "down"
                              ? "📉 " + t("downward")
                              : "➡️ " + t("stable")}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="font-semibold text-purple-700 text-sm mb-1">{t("sentimentLabel")}</div>
                        <div className="text-2xl font-bold text-purple-600">
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
              </div>

              {/* Right Column - Competition Control */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-rose-50/40 to-orange-50/40 h-fit">
                  <CardHeader className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {t("aiCompetitionConsole")}
                    </CardTitle>
                    <CardDescription className="text-rose-100">{t("startAICompetition")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* 汇率预测对战界面 */}
                    {!predictionBattle && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="text-6xl mb-4">🔮</div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("predictionBattleMode")}</h3>
                          <p className="text-sm text-gray-600">{t("predictionBattleDescription")}</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">{t("selectCurrency")}</label>
                            <select 
                              value={selectedCurrency}
                              onChange={(e) => setSelectedCurrency(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="HKD">CNY/HKD (人民币/港币)</option>
                              <option value="JPY">CNY/JPY (人民币/日元)</option>
                              <option value="KRW">CNY/KRW (人民币/韩元)</option>
                              <option value="MYR">CNY/MYR (人民币/马来西亚林吉特)</option>
                              <option value="SGD">CNY/SGD (人民币/新加坡元)</option>
                              <option value="THB">CNY/THB (人民币/泰铢)</option>
                            </select>
                          </div>
                          
                          {/* 预测模式选择 */}
                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-700">预测模式</label>
                            <div className="grid grid-cols-1 gap-3">
                              <button
                                onClick={() => setPredictionMode('manual')}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                  predictionMode === 'manual' 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="font-semibold text-gray-800">📝 手动预测</div>
                                <div className="text-sm text-gray-600 mt-1">手动输入预测数值</div>
                              </button>
                              <button
                                onClick={() => setPredictionMode('code')}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                  predictionMode === 'code' 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="font-semibold text-gray-800">💻 代码预测</div>
                                <div className="text-sm text-gray-600 mt-1">使用Python代码预测</div>
                              </button>
                            </div>
                          </div>

                          {/* 预测天数选择 */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">预测天数</label>
                            <select 
                              value={predictionDays}
                              onChange={(e) => setPredictionDays(Number(e.target.value))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={3}>3天</option>
                              <option value={5}>5天</option>
                              <option value={7}>7天</option>
                              <option value={10}>10天</option>
                            </select>
                          </div>
                          
                          <Button
                            onClick={async () => {
                              console.log('开始预测按钮被点击');
                              console.log('selectedCurrency:', selectedCurrency);
                              console.log('predictionDays:', predictionDays);
                              
                              try {
                                setIsLoadingPrediction(true);
                                console.log('发送API请求...');
                                
                                const response = await fetch('/api/rate-prediction-battle', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    action: 'start',
                                    currency: selectedCurrency,
                                    predictionDays,
                                    predictionMode
                                  })
                                });
                                
                                console.log('API响应状态:', response.status);
                                
                                if (response.ok) {
                                  const result = await response.json();
                                  console.log('API响应数据:', result);
                                  
                                  setPredictionBattle({
                                    competitionId: result.competitionId || 'comp_' + Date.now(),
                                    currency: selectedCurrency,
                                    historicalData: result.historicalData || [],
                                    predictionPeriod: {
                                      startDate: new Date().toISOString().split('T')[0],
                                      endDate: new Date(Date.now() + predictionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                      actualRates: []
                                    },
                                    playerPredictions: Array(predictionDays).fill(0),
                                    status: 'predicting'
                                  });
                                  console.log('状态已更新');
                                } else {
                                  console.error('API请求失败:', response.status, response.statusText);
                                  const errorText = await response.text();
                                  console.error('错误详情:', errorText);
                                }
                              } catch (error) {
                                console.error('启动预测对战失败:', error);
                              } finally {
                                setIsLoadingPrediction(false);
                                console.log('加载状态已重置');
                              }
                            }}
                            disabled={isLoadingPrediction}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
                          >
                            {isLoadingPrediction ? (
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                              <TrendingUp className="h-5 w-5 mr-2" />
                            )}
                            {t("startPredictionBattle")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {predictionBattle && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">CNY/{predictionBattle.currency} {t("predictionBattleMode")}</h3>
                          <Button
                            onClick={resetPredictionBattle}
                            variant="outline"
                            size="sm"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            返回
                          </Button>
                        </div>

                        {predictionBattle.status === 'predicting' && (
                          <div className="space-y-4">
                            {/* 历史数据图表展示 */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-medium mb-3 text-blue-800">{t("historicalData")}</h4>
                              {/* 图表展示历史数据 */}
                              <div className="w-full bg-white rounded border p-3 mb-3">
                                <SimpleLineChart 
                                  data={predictionBattle.historicalData.map(item => ({
                                    time: item.date,
                                    rate: item.rate,
                                    timestamp: new Date(item.date).getTime()
                                  }))} 
                                  width={400} 
                                  height={150} 
                                />
                              </div>
                              {/* 最近几天的数值展示 */}
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                {predictionBattle.historicalData.slice(-9).map((data, index) => (
                                  <div key={index} className="text-center p-2 bg-white rounded border">
                                    <div className="text-xs text-slate-500">{data.date}</div>
                                    <div className="font-medium">{data.rate.toFixed(4)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 预测期间 */}
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <h4 className="font-medium mb-3 text-yellow-800">{t("predictionPeriod")}</h4>
                              <div className="text-sm text-yellow-700">
                                {predictionBattle.predictionPeriod.startDate} 至 {predictionBattle.predictionPeriod.endDate}
                              </div>
                              <div className="text-xs text-yellow-600 mt-1">
                                {t("predictionPeriodDesc")}
                              </div>
                            </div>

                            {/* 预测输入区域 */}
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <h4 className="font-medium mb-3 text-green-800">{t("enterPredictions")}</h4>
                              
                              {predictionMode === 'manual' ? (
                                // 手动预测模式
                                <div className="space-y-3">
                                  {Array.from({ length: predictionDays }, (_, i) => i + 1).map((day) => (
                                    <div key={day} className="flex items-center space-x-3">
                                      <label className="w-16 text-sm font-medium text-gray-700">
                                        第{day}天:
                                      </label>
                                      <input
                                        type="number"
                                        step="0.0001"
                                        placeholder="0.0000"
                                        value={predictionBattle.playerPredictions[day - 1] || ''}
                                        onChange={(e) => {
                                          const newPredictions = [...predictionBattle.playerPredictions];
                                          newPredictions[day - 1] = parseFloat(e.target.value) || 0;
                                          setPredictionBattle({
                                            ...predictionBattle,
                                            playerPredictions: newPredictions
                                          });
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                // 代码预测模式
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">{t("pythonPredictionCode")}</label>
                                    <div className="relative">
                                      <textarea
                                        value={predictionCode}
                                        onChange={(e) => setPredictionCode(e.target.value)}
                                        placeholder={t("predictionCodePlaceholder")}
                                        className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-900 text-green-400 resize-none overflow-auto"
                                        style={{
                                          fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Consolas', monospace",
                                          fontSize: '14px',
                                          lineHeight: '1.5',
                                          tabSize: 4,
                                          whiteSpace: 'pre'
                                        }}
                                        spellCheck={false}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                      />
                                      <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                        Python
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <strong className="text-blue-800">代码执行环境说明：</strong>
                                    </div>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700">
                                      <li>代码将在安全的Python 3.x环境中执行</li>
                                      <li>可以使用pandas、numpy、matplotlib等数据分析库</li>
                                      <li>输出结果必须是{predictionDays}个数值的列表或数组</li>
                                      <li>示例输出：<code className="bg-gray-100 px-1 rounded">[1.2345, 1.2380, 1.2412, ...]</code></li>
                                      <li>可以使用print()输出调试信息</li>
                                      <li>代码执行时间限制：30秒</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/rate-prediction-battle', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'submit',
                                      competitionId: predictionBattle.competitionId,
                                      playerPredictions: predictionMode === 'manual' ? predictionBattle.playerPredictions : null,
                                      predictionCode: predictionMode === 'code' ? predictionCode : null,
                                      predictionMode,
                                      currency: predictionBattle.currency
                                    })
                                  });
                                  
                                  if (response.ok) {
                                    const result = await response.json();
                                    console.log('提交预测响应:', result);
                                    setPredictionBattle({
                                      ...predictionBattle,
                                      status: 'results',
                                      results: result.results
                                    });
                                  }
                                } catch (error) {
                                  console.error('提交预测失败:', error);
                                }
                              }}
                              disabled={
                                isLoadingPrediction || 
                                (predictionMode === 'manual' && predictionBattle.playerPredictions.some(p => !p)) ||
                                (predictionMode === 'code' && !predictionCode.trim())
                              }
                              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                            >
                              {isLoadingPrediction ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              {t("submitPredictions")}
                            </Button>
                          </div>
                        )}

                        {predictionBattle.status === 'results' && predictionBattle.results && (
                          <div className="space-y-4">
                            {/* 对战结果 */}
                            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                              <div className="text-4xl mb-2">
                                {predictionBattle.results?.winner === 'player' ? "🏆" : 
                                 predictionBattle.results?.winner === 'ai' ? "🤖" : "🤝"}
                              </div>
                              <div className="text-xl font-semibold mb-2 text-gray-800">
                                {predictionBattle.results?.winner === 'player' ? "恭喜你获胜！" :
                                 predictionBattle.results?.winner === 'ai' ? "AI获胜！" : "平局！"}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                <div className="p-3 bg-white rounded-lg">
                                  <div className="text-gray-600 mb-1">{t("playerPrediction")} {t("accuracy")}:</div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {predictionBattle.results?.playerAccuracy?.toFixed(2) || '0.00'}%
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                  <div className="text-gray-600 mb-1">{t("aiPrediction")} {t("accuracy")}:</div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {predictionBattle.results?.aiAccuracy?.toFixed(2) || '0.00'}%
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 详细比较表格 */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <h4 className="font-medium mb-3">{t("battleResults")}</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2">日期</th>
                                      <th className="text-left py-2">你的预测</th>
                                      <th className="text-left py-2">AI预测</th>
                                      <th className="text-left py-2">实际汇率</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Array.from({ length: predictionDays }, (_, i) => i + 1).map((day) => (
                                      <tr key={day} className="border-b">
                                        <td className="py-2">第{day}天</td>
                                        <td className="py-2 text-green-600 font-medium">
                                          {predictionBattle.results?.playerPredictions?.[day - 1]?.toFixed(4) || '0.0000'}
                                        </td>
                                        <td className="py-2 text-blue-600 font-medium">
                                          {predictionBattle.results?.aiPredictions?.[day - 1]?.toFixed(4) || '0.0000'}
                                        </td>
                                        <td className="py-2 font-bold">
                                          {predictionBattle.results?.actualRates?.[day - 1]?.toFixed(4) || '0.0000'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )}
</div>
  )
}

// 汇率预测组件和简单预测逻辑
type RateForecastSectionProps = {
  fromCurrency: string;
  toCurrency: string;
  lastRate: number;
  language: "zh" | "en";
  getText: (key: string, params?: { [key: string]: string | number }) => string;
  bankName?: string;
};

// 简单预测函数（支持LSTM模型和统计学回退）
async function fetchRateForecast(
  fromCurrency: string,
  toCurrency: string,
  lastRate: number,
  days: number = 20,
  bankName?: string
): Promise<Array<{ date: string; rate: number; timestamp: number; isOptimal?: boolean; method?: string }>> {
  try {
    // 首先尝试调用LSTM模型API
    const response = await fetch('/api/rate-prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromCurrency,
        toCurrency,
        days,
        bankName
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('使用LSTM+情感分析模型预测:', result.model_info);
        return result.predictions.map((pred: any) => ({
          ...pred,
          method: 'LSTM'
        }));
      } else {
        console.warn('LSTM模型预测失败，使用统计学策略:', result.error);
      }
    }
  } catch (error) {
    console.warn('LSTM API调用失败，使用统计学策略:', error);
  }

  // 如果LSTM模型不可用，回退到统计学预测策略
  console.log('使用统计学波动预测策略');
  const today = new Date();
  const result: Array<{ date: string; rate: number; timestamp: number; isOptimal?: boolean; method?: string }> = [];
  
  let currentRate = lastRate;
  let trend = (Math.random() - 0.5) * 0.002; // 整体趋势
  const volatility = 0.01; // 波动性
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // 添加周期性波动和随机噪音
    const cyclical = Math.sin(i * 0.3) * 0.005; // 周期性波动
    const noise = (Math.random() - 0.5) * volatility; // 随机噪音
    const dailyChange = trend + cyclical + noise;
    
    currentRate = currentRate * (1 + dailyChange);
    
    result.push({ 
      date: date.toISOString().slice(0, 10), 
      rate: parseFloat(currentRate.toFixed(4)),
      timestamp: date.getTime(),
      method: 'Statistical'
    });
    
    // 调整趋势，让其有变化
    if (Math.random() < 0.1) {
      trend += (Math.random() - 0.5) * 0.001;
    }
  }
  
  // 找出峰值（最高点）作为推荐购买时间
  const maxRate = Math.max(...result.map(item => item.rate));
  result.forEach(item => {
    if (item.rate === maxRate) {
      item.isOptimal = true;
    }
  });
  
  return result;
}

const RateForecastSection = ({ fromCurrency, toCurrency, lastRate, language, getText, bankName }: RateForecastSectionProps) => {
  const [forecast, setForecast] = useState<Array<{ date: string; rate: number; timestamp: number; isOptimal?: boolean; method?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [predictionMethod, setPredictionMethod] = useState<string>('');
  const [lastFetchKey, setLastFetchKey] = useState<string>('');
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // 添加一个单独的useEffect来处理语言变化时的翻译更新（不重新获取数据）
  useEffect(() => {
    if (forecast.length > 0) {
      const method = forecast[0].method || 'Statistical';
      if (method === 'LSTM') {
        setPredictionMethod(getText('lstmSentimentModel'));
      } else {
        setPredictionMethod(getText('statisticalSimulationAlgorithm'));
      }
    }
  }, [language, getText, forecast]);

  // 主要的数据获取useEffect - 只在货币对改变或首次加载时执行
  useEffect(() => {
    // 创建一个唯一的key来标识当前的预测请求
    const currentFetchKey = `${fromCurrency}-${toCurrency}-${bankName || 'default'}`;
    const now = Date.now();
    const cacheValidDuration = 10 * 60 * 1000; // 10分钟缓存
    
    // 如果货币对没变且缓存有效，不重新获取
    if (currentFetchKey === lastFetchKey && 
        forecast.length > 0 && 
        isInitialized &&
        (now - cacheTimestamp) < cacheValidDuration) {
      console.log(`汇率预测缓存有效，跳过重新获取: ${currentFetchKey}`);
      return;
    }

    // 如果是同一个货币对且刚刚获取过（1分钟内），也跳过
    if (currentFetchKey === lastFetchKey && 
        (now - cacheTimestamp) < 60 * 1000) {
      console.log(`汇率预测频率限制，跳过重新获取: ${currentFetchKey}`);
      return;
    }

    console.log(`开始获取汇率预测: ${currentFetchKey}`);
    setLoading(true);
    setPredictionMethod('');
    setLastFetchKey(currentFetchKey);
    setCacheTimestamp(now);
    
    fetchRateForecast(fromCurrency, toCurrency, lastRate, 20, bankName).then((data) => {
      setForecast(data);
      setLoading(false);
      setIsInitialized(true);
      
      // 从预测数据中获取使用的方法
      if (data.length > 0) {
        const method = data[0].method;
        if (method === 'LSTM') {
          setPredictionMethod(getText('lstmSentimentModel'));
        } else {
          setPredictionMethod(getText('statisticalSimulationAlgorithm'));
        }
      }
    }).catch((error) => {
      console.error(getText('predictionLoadingError'), error);
      setLoading(false);
      setIsInitialized(true);
      setPredictionMethod(getText('statisticalSimulationAlgorithm'));
    });
  }, [fromCurrency, toCurrency, bankName, getText]); // 添加了bankName依赖

  // 找出推荐购买时间
  const optimalPoint = forecast.find(item => item.isOptimal);
  const maxRate = Math.max(...forecast.map(item => item.rate));
  const minRate = Math.min(...forecast.map(item => item.rate));

  return (
    <div>
      {loading ? (
        <div className="text-slate-400 text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
          {fromCurrency}/{toCurrency} {getText('rateLoadingMessage')}
          <div className="text-xs mt-1">{getText('initializingAIModel')}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 预测方法指示器 */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${predictionMethod.includes('LSTM') ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <span>{getText('predictionMethod', { method: predictionMethod })}</span>
            </div>
            <div className="flex items-center gap-1">
              {predictionMethod.includes('LSTM') ? (
                <>
                  <span className="text-blue-600">{getText('aiEnhanced')}</span>
                </>
              ) : (
                <>
                  <span className="text-green-600">{getText('statisticalSimulation')}</span>
                </>
              )}
            </div>
          </div>

          {/* 图表区域 */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="w-full overflow-x-auto">
              <div className="relative">
                <SimpleLineChart 
                  data={forecast.map(item => ({
                    time: item.date,
                    rate: item.rate,
                    timestamp: item.timestamp
                  }))} 
                  width={800} 
                  height={300} 
                />
                {/* 推荐购买时间标注 */}
                {optimalPoint && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg">
                    <div className="text-xs font-medium">{getText('recommendedPurchaseTime')}</div>
                    <div className="text-sm">{optimalPoint.date}</div>
                    <div className="text-xs">{getText('exchangeRateLabel')}: {optimalPoint.rate}</div>
                  </div>
                )}
                {/* 模型信息标注 */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border">
                  <div className="text-xs text-slate-600">
                    {predictionMethod.includes('LSTM') ? (
                      <>
                        <div className="flex items-center gap-1 font-medium text-blue-600">
                          <span>🧠</span> {getText('lstmNeuralNetwork')}
                        </div>
                        <div className="text-xs">{getText('newsSentimentAnalysis')}</div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 font-medium text-green-600">
                          <span>📈</span> {getText('statisticalAlgorithm')}
                        </div>
                        <div className="text-xs">{getText('basedOnHistoricalVolatility')}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-800">{getText('highestRate')}</div>
              <div className="text-green-600 text-lg font-bold">{maxRate.toFixed(4)}</div>
              <div className="text-xs text-green-500">{getText('peakPeriod')}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800">{getText('lowestRate')}</div>
              <div className="text-blue-600 text-lg font-bold">{minRate.toFixed(4)}</div>
              <div className="text-xs text-blue-500">{getText('troughPeriod')}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-medium text-orange-800">{getText('volatilityRange')}</div>
              <div className="text-orange-600 text-lg font-bold">{((maxRate - minRate) / minRate * 100).toFixed(2)}%</div>
              <div className="text-xs text-orange-500">{getText('predictionPeriod')}</div>
            </div>
          </div>

          {/* 推荐购买时间详情 */}
          {optimalPoint && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-red-800">{getText('optimalPurchaseTimingRecommendation')}</span>
                {predictionMethod.includes('LSTM') && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{getText('aiEnhancedPrediction')}</span>
                )}
              </div>
              <div className="text-sm text-red-700">
                {getText('analysisRecommendation', {
                  method: predictionMethod.includes('LSTM') ? getText('lstmModelAnalysis') : getText('statisticalAnalysis'),
                  date: optimalPoint.date,
                  currency: toCurrency,
                  rate: optimalPoint.rate.toString(),
                  percentage: ((optimalPoint.rate - lastRate) / lastRate * 100).toFixed(2)
                })}
              </div>
            </div>
          )}

          {/* 预测数据表格（折叠显示） */}
          <details className="border rounded-lg">
            <summary className="p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="font-medium">{getText('viewDetailedPredictionData')}</span>
              <span className="text-xs text-slate-500 ml-2">{getText('clickToExpand')}</span>
            </summary>
            <div className="p-3 max-h-60 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-slate-600 border-b">
                    <th className="px-2 py-1 text-left">{getText('date')}</th>
                    <th className="px-2 py-1 text-right">{getText('predictedRate')}</th>
                    <th className="px-2 py-1 text-right">{getText('change')}</th>
                    <th className="px-2 py-1 text-center">{getText('recommendation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((item, index) => {
                    const prevRate = index === 0 ? lastRate : forecast[index - 1].rate;
                    const change = ((item.rate - prevRate) / prevRate * 100);
                    return (
                      <tr key={`${item.date}-${index}`} className={`border-b hover:bg-slate-50 ${item.isOptimal ? 'bg-red-50' : ''}`}>
                        <td className="px-2 py-1">{item.date}</td>
                        <td className="px-2 py-1 text-right font-mono">{item.rate}</td>
                        <td className={`px-2 py-1 text-right text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </td>
                        <td className="px-2 py-1 text-center">
                          {item.isOptimal ? getText('optimal') : change > 0.5 ? getText('suitable') : change < -0.5 ? getText('wait') : getText('observe')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>

          <div className="text-xs text-slate-400 mt-2 text-center">
            {predictionMethod.includes('LSTM') ? getText('lstmDisclaimerText') : getText('statisticalDisclaimerText')}
          </div>
        </div>
      )}
    </div>
  );
};
