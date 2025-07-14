import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, fromCurrency, toCurrency, analysisType } = await request.json()

    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        {
          error: "请提供完整的兑换参数",
        },
        { status: 400 },
      )
    }

    // 这里是你的Python策略分析API调用点
    // 你可以在这里调用你自己的Python代码
    const pythonBackendUrl = process.env.PYTHON_STRATEGY_URL || "http://localhost:5001"

    try {
      const response = await fetch(`${pythonBackendUrl}/analyze_strategy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRATEGY_API_KEY || ""}`,
        },
        body: JSON.stringify({
          amount,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          analysis_type: analysisType,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(30000), // 30秒超时
      })

      if (!response.ok) {
        throw new Error(`Python策略服务响应错误: ${response.status}`)
      }

      const strategyResult = await response.json()
      return NextResponse.json(strategyResult)
    } catch (fetchError) {
      console.warn("Python策略服务不可用，返回模拟结果:", fetchError)

      // 如果Python后端不可用，返回模拟策略结果
      const mockStrategy = {
        id: Date.now().toString(),
        timestamp: new Date(),
        fromCurrency,
        toCurrency,
        amount,
        currentRate: 7.2 + Math.random() * 0.5, // 模拟汇率
        recommendedAction: ["BUY", "SELL", "HOLD", "WAIT"][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        expectedReturn: (Math.random() - 0.5) * 10, // -5% to +5%
        riskLevel: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
        timeframe: ["1-3天", "1周", "2-4周", "1-3个月"][Math.floor(Math.random() * 4)],
        reasoning: [
          "技术指标显示超买/超卖信号",
          "基本面分析支持当前判断",
          "市场情绪偏向积极/消极",
          "历史数据显示类似模式",
          "央行政策影响预期",
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        technicalIndicators: {
          rsi: Math.floor(Math.random() * 100),
          macd: (Math.random() - 0.5) * 2,
          bollinger: ["UPPER", "MIDDLE", "LOWER"][Math.floor(Math.random() * 3)],
          support: 7.0 + Math.random() * 0.3,
          resistance: 7.3 + Math.random() * 0.3,
        },
        marketSentiment: {
          score: Math.floor(Math.random() * 100),
          trend: ["BULLISH", "BEARISH", "NEUTRAL"][Math.floor(Math.random() * 3)],
          volatility: Math.floor(Math.random() * 20) + 10,
        },
        alternativeStrategies: [
          {
            action: "分批建仓",
            description: "将总金额分成3-5次进行兑换，降低时机风险",
            expectedReturn: Math.random() * 3,
            riskLevel: "LOW",
          },
          {
            action: "设置止损",
            description: "在不利汇率达到3%时自动执行兑换",
            expectedReturn: Math.random() * 2,
            riskLevel: "MEDIUM",
          },
        ],
      }

      return NextResponse.json(mockStrategy)
    }
  } catch (error) {
    console.error("策略分析API错误:", error)
    return NextResponse.json(
      {
        error: "策略分析服务暂时不可用",
      },
      { status: 500 },
    )
  }
}
