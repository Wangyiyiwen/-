import { NextResponse } from "next/server"

export async function GET() {
  try {
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5000"

    try {
      const response = await fetch(`${pythonBackendUrl}/health`, {
        signal: AbortSignal.timeout(5000), // 5秒超时
      })

      if (response.ok) {
        return NextResponse.json({ status: "connected", backend: "python" })
      } else {
        return NextResponse.json({ status: "disconnected", backend: "mock" })
      }
    } catch (fetchError) {
      return NextResponse.json({ status: "disconnected", backend: "mock" })
    }
  } catch (error) {
    return NextResponse.json({ error: "健康检查失败" }, { status: 500 })
  }
}
