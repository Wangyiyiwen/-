import { NextRequest, NextResponse } from "next/server"
import * as fs from "fs"
import * as path from "path"
import { spawn } from "child_process"

export async function POST(request: NextRequest) {
  try {
    const { code, historicalData, predictionDays, currency } = await request.json()

    console.log('执行Python预测代码:', {
      codeLength: code?.length,
      historicalDataLength: historicalData?.length,
      predictionDays,
      currency
    })

    if (!code || !historicalData || !predictionDays) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 创建临时Python文件
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const timestamp = Date.now()
    const scriptPath = path.join(tempDir, `prediction_${timestamp}.py`)
    
    // 准备Python代码，注入数据
    const fullPythonCode = `
import json
import numpy as np
import pandas as pd
import sys
import traceback

# 注入数据
historical_data = ${JSON.stringify(historicalData)}
prediction_days = ${predictionDays}
currency = "${currency}"

try:
    # 执行用户代码
${code.split('\n').map((line: string) => '    ' + line).join('\n')}
    
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    print(traceback.format_exc(), file=sys.stderr)
    sys.exit(1)
`

    // 写入Python文件
    fs.writeFileSync(scriptPath, fullPythonCode)

    // 执行Python代码
    const result = await executePythonScript(scriptPath)
    
    // 清理临时文件
    try {
      fs.unlinkSync(scriptPath)
    } catch (e) {
      console.warn('清理临时文件失败:', e)
    }

    if (result.success) {
      // 解析输出的预测结果
      const predictions = parsePredictionOutput(result.output)
      
      if (!predictions || predictions.length !== predictionDays) {
        return NextResponse.json({ 
          error: `代码输出格式错误。预期输出${predictionDays}个预测值，实际得到${predictions?.length || 0}个`,
          output: result.output,
          stderr: result.stderr
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        predictions,
        output: result.output,
        stderr: result.stderr
      })
    } else {
      return NextResponse.json({
        error: '代码执行失败',
        stderr: result.stderr,
        output: result.output
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Python代码执行API错误:', error)
    return NextResponse.json({ 
      error: '服务器内部错误', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

async function executePythonScript(scriptPath: string): Promise<{
  success: boolean,
  output: string,
  stderr: string
}> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000, // 30秒超时
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout.trim(),
        stderr: stderr.trim()
      })
    })

    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        stderr: `进程执行错误: ${error.message}`
      })
    })

    // 超时处理
    setTimeout(() => {
      if (!pythonProcess.killed) {
        pythonProcess.kill()
        resolve({
          success: false,
          output: '',
          stderr: '代码执行超时（30秒）'
        })
      }
    }, 30000)
  })
}

function parsePredictionOutput(output: string): number[] | null {
  try {
    // 尝试从输出中找到数组形式的预测结果
    const lines = output.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      try {
        // 尝试解析JSON数组
        const parsed = JSON.parse(line)
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          return parsed
        }
      } catch (e) {
        // 尝试解析Python列表格式
        const match = line.match(/\[([\d.,\s]+)\]/)
        if (match) {
          const numbers = match[1].split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
          if (numbers.length > 0) {
            return numbers
          }
        }
      }
    }
    
    // 如果没有找到数组，尝试逐行解析数字
    const numbers = lines
      .map(line => parseFloat(line.trim()))
      .filter(n => !isNaN(n))
    
    return numbers.length > 0 ? numbers : null
  } catch (error) {
    console.error('解析预测输出失败:', error)
    return null
  }
}
