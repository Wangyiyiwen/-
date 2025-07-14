import { NextResponse } from "next/server"

export async function GET() {
  try {
    const pythonBackendUrl = process.env.PYTHON_STRATEGY_URL || "http://localhost:5001"

    try {
      const response = await fetch(`${pythonBackendUrl}/health`, {
        signal: AbortSignal.timeout(5000), // 5秒超时
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          status: "connected",
          backend: "python_strategy",
          ...data,
        })
      } else {
        return NextResponse.json({
          status: "disconnected",
          backend: "mock",
          message: "Python策略服务不可用",
        })
      }
    } catch (fetchError) {
      return NextResponse.json({
        status: "disconnected",
        backend: "mock",
        message: "无法连接到Python策略服务",
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "健康检查失败",
      },
      { status: 500 },
    )
  }
}
