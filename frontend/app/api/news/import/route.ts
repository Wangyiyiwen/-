import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as Blob | null

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const csvString = buffer.toString("utf-8")

    const records = parse(csvString, {
      columns: true, // Treat the first row as column headers
      skip_empty_lines: true,
    })

    let totalSentimentScore = 0
    let processedArticlesCount = 0

    for (const record of records) {
      const recordData = record as any // Type assertion for CSV record
      const articleText = recordData.content || recordData.article_text || recordData.text // Try multiple column names
      if (articleText) {
        try {
          // Call the Python Flask sentiment analysis service directly
          const sentimentResponse = await fetch("http://localhost:5000/score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: articleText }),
          })

          if (sentimentResponse.ok) {
            const sentimentData = await sentimentResponse.json()
            // Assuming sentimentData.sentiment is a numerical score (e.g., -1 to 1)
            totalSentimentScore += sentimentData.sentiment
            processedArticlesCount++
          } else {
            console.warn(`Failed to get sentiment for an article: ${sentimentResponse.statusText}`)
          }
        } catch (sentimentError) {
          console.error(`Error calling sentiment API for an article: ${sentimentError}`)
        }
      }
    }

    const overallSentiment = processedArticlesCount > 0 ? totalSentimentScore / processedArticlesCount : 0

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${processedArticlesCount} news articles.`,
      importedCount: processedArticlesCount,
      overallSentiment: overallSentiment,
    })
  } catch (error) {
    console.error("Error processing CSV upload:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process CSV file.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
