import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, fromCurrency, toCurrency, preferences, analysisType } = await request.json()

    if (!amount || !fromCurrency || !toCurrency || !preferences) {
      return NextResponse.json(
        {
          error: "请提供完整的兑换参数和偏好设置",
        },
        { status: 400 },
      )
    }

    // 调用Python后端进行高级策略分析
    const pythonBackendUrl = process.env.PYTHON_STRATEGY_URL || "http://localhost:5001"

    try {
      const response = await fetch(`${pythonBackendUrl}/analyze_advanced_strategy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRATEGY_API_KEY || ""}`,
        },
        body: JSON.stringify({
          amount,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          preferences,
          analysis_type: analysisType,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`Python策略服务响应错误: ${response.status}`)
      }

      const strategiesResult = await response.json()
      return NextResponse.json(strategiesResult)
    } catch (fetchError) {
      console.warn("Python策略服务不可用，返回模拟结果:", fetchError)

      // 模拟多个策略结果
      const mockStrategies = generateMockStrategies(amount, fromCurrency, toCurrency, preferences)

      return NextResponse.json({
        strategies: mockStrategies,
        timestamp: new Date().toISOString(),
        source: "mock_data",
      })
    }
  } catch (error) {
    console.error("高级策略分析API错误:", error)
    return NextResponse.json(
      {
        error: "策略分析服务暂时不可用",
      },
      { status: 500 },
    )
  }
}

function generateMockStrategies(amount: number, fromCurrency: string, toCurrency: string, preferences: any) {
  const channels = [
    {
      id: "major_bank",
      name: "大型银行",
      type: "BANK",
      description: "中国银行、工商银行等大型银行网点",
      avgRate: 0.998,
      fees: 0.5,
      convenience: 3,
      security: 5,
      speed: 2,
    },
    {
      id: "online_bank",
      name: "网上银行",
      type: "ONLINE",
      description: "手机银行APP在线兑换",
      avgRate: 0.999,
      fees: 0.3,
      convenience: 5,
      security: 4,
      speed: 5,
    },
    {
      id: "airport_exchange",
      name: "机场兑换",
      type: "AIRPORT",
      description: "机场内货币兑换柜台",
      avgRate: 0.985,
      fees: 2.0,
      convenience: 4,
      security: 4,
      speed: 4,
    },
    {
      id: "exchange_shop",
      name: "兑换店",
      type: "EXCHANGE_SHOP",
      description: "专业货币兑换店",
      avgRate: 0.992,
      fees: 1.0,
      convenience: 3,
      security: 3,
      speed: 4,
    },
    {
      id: "atm_withdrawal",
      name: "ATM取现",
      type: "ATM",
      description: "境外ATM直接取现",
      avgRate: 0.995,
      fees: 1.5,
      convenience: 5,
      security: 4,
      speed: 5,
    },
  ]

  const baseRate = 7.2345 // USD to CNY example rate

  return channels
    .map((channel, index) => {
      const finalRate = baseRate * channel.avgRate
      const feeAmount = (amount * finalRate * channel.fees) / 100
      const totalCost = amount * finalRate + feeAmount
      const expectedSavings = Math.random() * 200 + 50

      // Calculate user score based on preferences
      let userScore = 0
      userScore += channel.convenience * preferences.conveniencePriority * 4
      userScore += channel.security * preferences.securityPriority * 4
      userScore += channel.speed * preferences.timeUrgency * 4
      userScore += (5 - channel.fees) * preferences.costPriority * 4
      userScore = Math.min(100, Math.max(0, Math.round(userScore)))

      const timeframes = ["即时", "1-2小时", "半天", "1天", "2-3天"]
      const actions = ["EXECUTE", "WAIT", "COMPARE", "NEGOTIATE"]

      return {
        id: `strategy_${channel.id}_${Date.now() + index}`,
        timestamp: new Date(),
        fromCurrency,
        toCurrency,
        amount,
        method: preferences.exchangeMethod,
        channel: {
          ...channel,
          icon: null, // Will be handled in frontend
        },
        currentRate: baseRate,
        finalRate: Number.parseFloat(finalRate.toFixed(4)),
        totalCost: Number.parseFloat(totalCost.toFixed(2)),
        fees: Number.parseFloat(feeAmount.toFixed(2)),
        recommendedAction: actions[Math.floor(Math.random() * actions.length)],
        confidence: Math.floor(Math.random() * 30) + 70,
        expectedSavings: Number.parseFloat(expectedSavings.toFixed(2)),
        riskLevel: channel.security >= 4 ? "LOW" : channel.security >= 3 ? "MEDIUM" : "HIGH",
        timeframe: timeframes[channel.speed - 1] || "1-2天",
        reasoning: [
          `基于您的${preferences.exchangeMethod === "CASH" ? "现金" : "电子账户"}偏好`,
          `${channel.name}在${preferences.location}地区可用性较好`,
          `手续费率${channel.fees}%符合您的预期`,
          `安全等级${channel.security}/5星满足要求`,
        ],
        pros: [
          channel.convenience >= 4 ? "操作便利，随时可用" : "网点较多，容易找到",
          channel.security >= 4 ? "安全性高，资金有保障" : "正规渠道，相对安全",
          channel.fees <= 1 ? "手续费较低" : "费率透明，无隐藏费用",
        ],
        cons: [
          channel.speed <= 2 ? "处理时间较长" : "可能需要排队等待",
          channel.fees >= 2 ? "手续费相对较高" : "汇率可能不是最优",
          channel.convenience <= 3 ? "需要到指定地点办理" : "需要提前预约",
        ],
        alternativeStrategies: channels
          .filter((c) => c.id !== channel.id)
          .slice(0, 2)
          .map((altChannel) => ({
            channel: { ...altChannel, icon: null },
            rate: Number.parseFloat((baseRate * altChannel.avgRate).toFixed(4)),
            fees: Number.parseFloat(((amount * baseRate * altChannel.avgRate * altChannel.fees) / 100).toFixed(2)),
            totalCost: Number.parseFloat(
              (
                amount * baseRate * altChannel.avgRate +
                (amount * baseRate * altChannel.avgRate * altChannel.fees) / 100
              ).toFixed(2),
            ),
            score: Math.floor(Math.random() * 30) + 60,
            timeToComplete: timeframes[altChannel.speed - 1] || "1-2天",
            description: `通过${altChannel.name}进行兑换的备选方案`,
          })),
        userScore,
      }
    })
    .sort((a, b) => b.userScore - a.userScore) // Sort by user score descending
}
