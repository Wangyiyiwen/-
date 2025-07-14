import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Use the environment variable for the Python sentiment API URL
    const pythonApiUrl = process.env.PYTHON_SENTIMENT_API_URL

    if (!pythonApiUrl) {
      console.error("PYTHON_SENTIMENT_API_URL is not set.")
      return NextResponse.json({ error: "Sentiment API URL not configured" }, { status: 500 })
    }

    const pythonResponse = await fetch(pythonApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text()
      console.error(`Python API error: ${pythonResponse.status} - ${errorText}`)
      return NextResponse.json(
        { error: `Failed to get sentiment from Python API: ${errorText}` },
        { status: pythonResponse.status },
      )
    }

    const sentimentData = await pythonResponse.json()
    return NextResponse.json(sentimentData)
  } catch (error) {
    console.error("Error in sentiment score API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
