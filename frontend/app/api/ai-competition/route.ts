import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userStrategy, round, marketCondition } = await request.json()

    // Generate AI strategy for this round
    const aiStrategy = generateAIStrategy(round, marketCondition)

    // Simulate round results
    const results = simulateRound(userStrategy, aiStrategy, marketCondition)

    return NextResponse.json({
      aiStrategy,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI Competition API Error:", error)
    return NextResponse.json({ error: "AI对战服务暂时不可用" }, { status: 500 })
  }
}

function generateAIStrategy(round: number, marketCondition: string) {
  const strategies = ["AGGRESSIVE", "CONSERVATIVE", "BALANCED"]
  const baseStrategy = strategies[Math.floor(Math.random() * strategies.length)]

  // AI adapts strategy based on market condition and round
  const adaptedStrategy = { ...getBaseStrategyParams(baseStrategy) }

  // Market condition adaptations
  switch (marketCondition) {
    case "牛市":
      adaptedStrategy.buyThreshold *= 0.8 // More aggressive buying
      adaptedStrategy.expectedReturn *= 1.3
      break
    case "熊市":
      adaptedStrategy.sellThreshold *= 0.7 // Quicker selling
      adaptedStrategy.riskLevel = Math.max(1, adaptedStrategy.riskLevel - 1)
      break
    case "震荡":
      adaptedStrategy.buyThreshold *= 1.2
      adaptedStrategy.sellThreshold *= 1.1
      break
  }

  // Round-based learning (AI gets smarter over time)
  if (round > 2) {
    adaptedStrategy.confidence += (round - 2) * 5
  }

  return {
    id: `ai_strategy_${round}_${Date.now()}`,
    name: "AI策略",
    type: baseStrategy,
    ...adaptedStrategy,
  }
}

function getBaseStrategyParams(type: string) {
  switch (type) {
    case "AGGRESSIVE":
      return {
        buyThreshold: 0.015,
        sellThreshold: 0.04,
        riskLevel: 4,
        expectedReturn: 8.0,
        confidence: 85,
      }
    case "CONSERVATIVE":
      return {
        buyThreshold: 0.03,
        sellThreshold: 0.02,
        riskLevel: 2,
        expectedReturn: 3.5,
        confidence: 90,
      }
    default: // BALANCED
      return {
        buyThreshold: 0.02,
        sellThreshold: 0.03,
        riskLevel: 3,
        expectedReturn: 5.5,
        confidence: 80,
      }
  }
}

function simulateRound(userStrategy: any, aiStrategy: any, marketCondition: string) {
  // Complex simulation logic based on strategies and market conditions
  const userProfit = calculateProfit(userStrategy, marketCondition)
  const aiProfit = calculateProfit(aiStrategy, marketCondition)

  let winner = "tie"
  if (userProfit > aiProfit) winner = "user"
  else if (aiProfit > userProfit) winner = "ai"

  return {
    userProfit: Number.parseFloat(userProfit.toFixed(2)),
    aiProfit: Number.parseFloat(aiProfit.toFixed(2)),
    winner,
    marketCondition,
    analysis: generateRoundAnalysis(userStrategy, aiStrategy, marketCondition),
  }
}

function calculateProfit(strategy: any, marketCondition: string) {
  let baseProfit = strategy.expectedReturn
  const riskFactor = strategy.riskLevel / 5

  // Market condition effects
  const marketMultipliers = {
    牛市: strategy.type === "AGGRESSIVE" ? 1.5 : 1.2,
    熊市: strategy.type === "CONSERVATIVE" ? 1.3 : 0.7,
    震荡: strategy.type === "BALANCED" ? 1.4 : 0.9,
    突发事件: Math.random() > 0.5 ? 1.8 : 0.3,
    政策影响: 0.8 + Math.random() * 0.6,
  }

  baseProfit *= marketMultipliers[marketCondition as keyof typeof marketMultipliers] || 1.0

  // Add some randomness
  baseProfit *= 0.8 + Math.random() * 0.4

  return baseProfit
}

function generateRoundAnalysis(userStrategy: any, aiStrategy: any, marketCondition: string) {
  return {
    marketImpact: `${marketCondition}对策略的影响`,
    userStrengths: [`${userStrategy.type}策略在当前市场表现良好`],
    aiStrengths: [`AI采用${aiStrategy.type}策略应对市场变化`],
    suggestions: ["建议根据市场条件调整策略参数"],
  }
}
