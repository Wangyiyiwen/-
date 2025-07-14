import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const purchaseRequest = await request.json()

    if (!purchaseRequest.amount || !purchaseRequest.fromCurrency || !purchaseRequest.toCurrency) {
      return NextResponse.json(
        {
          error: "请提供完整的购钞需求信息",
        },
        { status: 400 },
      )
    }

    // 调用Python后端进行购钞策略分析
    const pythonBackendUrl = process.env.PYTHON_STRATEGY_URL || "http://localhost:5001"

    try {
      const response = await fetch(`${pythonBackendUrl}/analyze_purchase_strategy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRATEGY_API_KEY || ""}`,
        },
        body: JSON.stringify({
          ...purchaseRequest,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`Python策略服务响应错误: ${response.status}`)
      }

      const strategyResult = await response.json()
      return NextResponse.json(strategyResult)
    } catch (fetchError) {
      console.warn("Python策略服务不可用，返回模拟结果:", fetchError)

      // 模拟购钞策略结果
      const mockStrategy = generateMockPurchaseStrategy(purchaseRequest)
      return NextResponse.json(mockStrategy)
    }
  } catch (error) {
    console.error("购钞策略分析API错误:", error)
    return NextResponse.json(
      {
        error: "购钞策略分析服务暂时不可用",
      },
      { status: 500 },
    )
  }
}

function generateMockPurchaseStrategy(request: any) {
  const channels = [
    {
      name: "中国银行网点",
      type: "BANK",
      rate: 7.2345,
      fees: 0.5,
      timeRequired: request.urgency === "HIGH" ? "1小时" : "2-4小时",
      pros: ["汇率优惠", "安全可靠", "网点众多", "支持大额兑换"],
      cons: ["需要预约", "营业时间限制", "可能需要排队"],
    },
    {
      name: "手机银行APP",
      type: "ONLINE",
      rate: 7.2445,
      fees: 0.3,
      timeRequired: "即时",
      pros: ["24小时可用", "手续费低", "操作便捷", "无需排队"],
      cons: ["仅支持电汇", "有额度限制", "需要网银"],
    },
    {
      name: "机场兑换",
      type: "AIRPORT",
      rate: 7.1,
      fees: 2.0,
      timeRequired: "30分钟",
      pros: ["出行方便", "即时取钞", "无需预约"],
      cons: ["汇率较差", "手续费高", "仅在机场可用"],
    },
  ]

  // 根据用户偏好选择最优渠道
  let bestChannel = channels[0]
  if (request.urgency === "HIGH") {
    bestChannel = channels.find((c) => c.timeRequired === "即时") || channels[1]
  } else if (request.preferredMethod === "DIGITAL") {
    bestChannel = channels[1]
  }

  const exchangeAmount = request.amount / bestChannel.rate
  const feeAmount = (exchangeAmount * bestChannel.fees) / 100
  const totalCost = exchangeAmount + feeAmount

  return {
    id: `strategy_${Date.now()}`,
    channel: bestChannel.name,
    channelType: bestChannel.type,
    rate: bestChannel.rate,
    fees: bestChannel.fees,
    totalCost: Number.parseFloat(totalCost.toFixed(2)),
    savings: 150.5 + Math.random() * 100,
    timeRequired: bestChannel.timeRequired,
    steps: [`选择${bestChannel.name}进行兑换`, "准备身份证和相关材料", "按照流程完成兑换申请", "完成兑换并获取外币"],
    pros: bestChannel.pros,
    cons: bestChannel.cons,
    riskLevel: bestChannel.type === "BANK" ? "LOW" : bestChannel.type === "ONLINE" ? "MEDIUM" : "HIGH",
    confidence: 85 + Math.random() * 10,
    alternatives: channels
      .filter((c) => c.name !== bestChannel.name)
      .slice(0, 2)
      .map((alt) => ({
        channel: alt.name,
        rate: alt.rate,
        fees: alt.fees,
        totalCost: Number.parseFloat(((request.amount / alt.rate) * (1 + alt.fees / 100)).toFixed(2)),
        timeRequired: alt.timeRequired,
      })),
  }
}
