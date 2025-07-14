import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 这里是你的汇率数据API调用点
    // 你可以接入实时汇率API或你自己的Python汇率服务
    const ratesBackendUrl = process.env.RATES_API_URL || "http://localhost:5001"

    try {
      const response = await fetch(`${ratesBackendUrl}/current_rates`, {
        headers: {
          Authorization: `Bearer ${process.env.RATES_API_KEY || ""}`,
        },
        signal: AbortSignal.timeout(10000), // 10秒超时
      })

      if (!response.ok) {
        throw new Error(`汇率服务响应错误: ${response.status}`)
      }

      const ratesData = await response.json()
      return NextResponse.json(ratesData)
    } catch (fetchError) {
      console.warn("汇率服务不可用，返回模拟汇率:", fetchError)

      // 模拟汇率数据
      const mockRates = {
        rates: {
          USDCNY: 7.2345,
          EURCNY: 7.8901,
          GBPCNY: 9.1234,
          JPYCNY: 0.0543,
          CNYKRW: 185.67,
          USDEUR: 0.9123,
          USDGBP: 0.7891,
          USDJPY: 149.23,
          USDAUD: 1.5234,
          USDCAD: 1.3567,
          USDCHF: 0.8901,
          USDHKD: 7.8234,
        },
        timestamp: new Date().toISOString(),
        source: "mock_data",
      }

      return NextResponse.json(mockRates)
    }
  } catch (error) {
    console.error("汇率API错误:", error)
    return NextResponse.json(
      {
        error: "汇率服务暂时不可用",
      },
      { status: 500 },
    )
  }
}
