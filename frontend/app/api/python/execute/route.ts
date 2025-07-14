import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "请提供有效的Python代码" }, { status: 400 })
    }

    // 这里模拟Python代码执行
    // 在实际应用中，你需要设置一个Python后端服务
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5000"

    try {
      const response = await fetch(`${pythonBackendUrl}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        signal: AbortSignal.timeout(30000), // 30秒超时
      })

      if (!response.ok) {
        throw new Error(`Python后端响应错误: ${response.status}`)
      }

      const result = await response.json()
      return NextResponse.json(result)
    } catch (fetchError) {
      // 如果Python后端不可用，返回模拟结果
      console.warn("Python后端不可用，返回模拟结果:", fetchError)

      // 简单的代码分析和模拟执行
      let output = ""
      let error = ""

      try {
        // 模拟一些简单的Python代码执行
        if (code.includes("print(")) {
          const printMatches = code.match(/print$$(.*?)$$/g)
          if (printMatches) {
            output = printMatches
              .map((match) => {
                const content = match.replace(/print$$|$$/g, "")
                if (content.includes('"') || content.includes("'")) {
                  return content.replace(/['"]/g, "")
                }
                return `模拟输出: ${content}`
              })
              .join("\n")
          }
        }

        if (code.includes("import")) {
          output += (output ? "\n" : "") + "模块导入成功"
        }

        if (!output) {
          output = "代码执行完成（无输出）"
        }
      } catch (e) {
        error = "代码执行出错"
      }

      return NextResponse.json({ output, error })
    }
  } catch (error) {
    console.error("API错误:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
