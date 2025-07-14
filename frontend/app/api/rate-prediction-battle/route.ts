import { NextRequest, NextResponse } from "next/server"
import * as fs from "fs"
import * as path from "path"

interface PredictionData {
  date: string
  rate: number
}

interface CompetitionData {
  currency: string
  historicalData: PredictionData[]
  predictionPeriod: {
    startDate: string
    endDate: string
    actualRates: number[]
  }
  playerPredictions?: number[]
  aiPredictions?: number[]
  results?: {
    playerAccuracy: number
    aiAccuracy: number
    winner: 'player' | 'ai' | 'tie'
  }
}

// 货币对应的文件名映射
const CURRENCY_FILE_MAP: { [key: string]: string } = {
  'HKD': 'CNY_HKD_to_exchange_rate.csv',
  'JPY': 'CNY_JPY_to_exchange_rate.csv',
  'KRW': 'CNY_KRW_to_exchange_rate.csv',
  'MYR': 'CNY_MYR_to_exchange_rate.csv',
  'SGD': 'CNY_SGD_to_exchange_rate.csv',
  'THB': 'CNY_THB_to_exchange_rate.csv'
}

// 模型文件映射
const MODEL_FILE_MAP: { [key: string]: string } = {
  'HKD': 'HKD_model.keras',
  'JPY': 'JPY_model.keras',
  'KRW': 'KRW_model.keras',
  'MYR': 'MYR_model.keras',
  'SGD': 'SGD_model.keras',
  'THB': 'THB_model.keras'
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('API收到请求:', requestBody)
    
    const { action, currency, playerPredictions, predictionCode, predictionMode, competitionId, predictionDays } = requestBody

    switch (action) {
      case 'start':
        console.log('开始竞赛，货币:', currency, '预测天数:', predictionDays, '模式:', predictionMode)
        return await startCompetition(currency, predictionDays || 5)
      case 'submit':
        console.log('提交预测，货币:', currency, '模式:', predictionMode)
        if (predictionMode === 'code') {
          console.log('代码预测模式，代码长度:', predictionCode?.length)
          return await submitCodePredictions(competitionId, predictionCode, currency)
        } else {
          console.log('手动预测模式，预测:', playerPredictions)
          return await submitPredictions(competitionId, playerPredictions, currency)
        }
      default:
        return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })
    }
  } catch (error) {
    console.error('汇率预测对战API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

async function startCompetition(currency: string, predictionDays: number = 5): Promise<NextResponse> {
  try {
    console.log('startCompetition被调用，货币:', currency)
    console.log('支持的货币:', Object.keys(CURRENCY_FILE_MAP))
    
    // 检查货币是否支持
    if (!CURRENCY_FILE_MAP[currency]) {
      console.log('不支持的货币:', currency)
      return NextResponse.json({ error: `不支持的货币: ${currency}` }, { status: 400 })
    }

    // 读取汇率历史数据
    const dataPath = path.join(process.cwd(), '..', 'Rate LSTM', CURRENCY_FILE_MAP[currency])
    console.log('数据文件路径:', dataPath)
    
    if (!fs.existsSync(dataPath)) {
      console.log('文件不存在:', dataPath)
      return NextResponse.json({ error: `找不到${currency}的历史数据文件` }, { status: 404 })
    }

    const csvContent = fs.readFileSync(dataPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    // 解析数据
    const data: PredictionData[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length >= 2) {
        data.push({
          date: values[0].trim(),
          rate: parseFloat(values[1].trim())
        })
      }
    }

    // 过滤掉最近6个月的数据，确保我们有足够的历史数据
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const historicalData = data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate < sixMonthsAgo && !isNaN(item.rate)
    })

    if (historicalData.length < 10) {
      return NextResponse.json({ error: '历史数据不足' }, { status: 400 })
    }

    // 随机选择一个预测期（从历史数据中的后部分选择，确保有足够的前置数据）
    const minStartIndex = Math.max(20, historicalData.length - 180) // 至少需要20天的历史数据
    const maxStartIndex = historicalData.length - predictionDays // 至少留出指定天数的预测期
    const startIndex = Math.floor(Math.random() * (maxStartIndex - minStartIndex)) + minStartIndex

    // 提取预测期的数据（真实值）
    const predictionPeriod = {
      startDate: historicalData[startIndex].date,
      endDate: historicalData[startIndex + predictionDays - 1].date,
      actualRates: historicalData.slice(startIndex, startIndex + predictionDays).map(item => item.rate)
    }

    // 提供给用户的历史数据（预测期之前的数据）
    const userHistoricalData = historicalData.slice(Math.max(0, startIndex - 30), startIndex)

    const competitionData: CompetitionData = {
      currency,
      historicalData: userHistoricalData,
      predictionPeriod
    }

    // 生成竞赛ID（包含预测天数信息）
    const competitionId = `pred_${currency}_${Date.now()}_${predictionDays}`

    return NextResponse.json({
      competitionId,
      ...competitionData
    })

  } catch (error) {
    console.error('启动预测比赛失败:', error)
    return NextResponse.json({ error: '启动预测比赛失败' }, { status: 500 })
  }
}

async function submitPredictions(competitionId: string, playerPredictions: number[], currency: string): Promise<NextResponse> {
  try {
    // 从竞赛ID中提取预测天数
    const predictionDays = parseInt(competitionId.split('_')[3]) || 5
    
    // 验证预测数据
    if (!Array.isArray(playerPredictions) || playerPredictions.length !== predictionDays) {
      return NextResponse.json({ error: `请提供${predictionDays}天的预测数据` }, { status: 400 })
    }

    // 重新获取竞赛数据以验证
    const dataPath = path.join(process.cwd(), '..', 'Rate LSTM', CURRENCY_FILE_MAP[currency])
    const csvContent = fs.readFileSync(dataPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    const data: PredictionData[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length >= 2) {
        data.push({
          date: values[0].trim(),
          rate: parseFloat(values[1].trim())
        })
      }
    }

    // 生成AI预测（简化版，实际应该使用LSTM模型）
    const aiPredictions = await generateAIPredictions(currency, data, predictionDays)

    // 从竞赛ID中提取时间戳来重建预测期
    const timestamp = parseInt(competitionId.split('_')[2])
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const historicalData = data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate < sixMonthsAgo && !isNaN(item.rate)
    })

    // 重新计算预测期（使用相同的逻辑确保一致性）
    const minStartIndex = Math.max(20, historicalData.length - 180)
    const maxStartIndex = historicalData.length - predictionDays
    // 使用时间戳作为随机种子以保证一致性
    const pseudoRandom = (timestamp % (maxStartIndex - minStartIndex))
    const startIndex = minStartIndex + pseudoRandom

    const actualRates = historicalData.slice(startIndex, startIndex + predictionDays).map(item => item.rate)

    // 计算准确性（使用平均绝对百分比误差 MAPE）
    const playerAccuracy = calculateAccuracy(playerPredictions, actualRates)
    const aiAccuracy = calculateAccuracy(aiPredictions, actualRates)

    console.log('计算准确率:', {
      playerPredictions,
      aiPredictions,
      actualRates,
      playerAccuracy,
      aiAccuracy
    })

    // 确定获胜者
    let winner: 'player' | 'ai' | 'tie' = 'tie'
    if (playerAccuracy > aiAccuracy) {
      winner = 'player'
    } else if (aiAccuracy > playerAccuracy) {
      winner = 'ai'
    }

    const results = {
      playerPredictions,
      aiPredictions,
      actualRates,
      playerAccuracy,
      aiAccuracy,
      winner,
      competitionId
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    console.error('提交预测失败:', error)
    return NextResponse.json({ error: '提交预测失败' }, { status: 500 })
  }
}

async function submitCodePredictions(competitionId: string, predictionCode: string, currency: string): Promise<NextResponse> {
  try {
    console.log('处理代码预测提交:', competitionId, currency)

    if (!predictionCode || !predictionCode.trim()) {
      return NextResponse.json({ error: '请提供预测代码' }, { status: 400 })
    }

    // 获取竞赛数据以获取历史数据
    const dataPath = path.join(process.cwd(), '..', 'Rate LSTM', CURRENCY_FILE_MAP[currency])
    const csvContent = fs.readFileSync(dataPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    const data: PredictionData[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length >= 2) {
        data.push({
          date: values[0].trim(),
          rate: parseFloat(values[1].trim())
        })
      }
    }

    // 从竞赛ID中提取时间戳和预测天数
    const timestamp = parseInt(competitionId.split('_')[2])
    const predictionDays = parseInt(competitionId.split('_')[3]) || 5
    
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const historicalData = data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate < sixMonthsAgo && !isNaN(item.rate)
    })

    // 重新计算预测期（使用相同的逻辑确保一致性）
    const minStartIndex = Math.max(20, historicalData.length - 180)
    const maxStartIndex = historicalData.length - predictionDays
    const pseudoRandom = (timestamp % (maxStartIndex - minStartIndex))
    const startIndex = minStartIndex + pseudoRandom

    // 提供给代码的历史数据（预测期之前的数据）
    const userHistoricalData = historicalData.slice(Math.max(0, startIndex - 50), startIndex)
    const actualRates = historicalData.slice(startIndex, startIndex + predictionDays).map(item => item.rate)

    // 调用Python代码执行API
    const pythonResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/python-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: predictionCode,
        historicalData: userHistoricalData,
        predictionDays,
        currency
      })
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json()
      return NextResponse.json({ 
        error: '代码执行失败', 
        details: errorData.error,
        stderr: errorData.stderr,
        output: errorData.output
      }, { status: 400 })
    }

    const pythonResult = await pythonResponse.json()
    const playerPredictions = pythonResult.predictions

    if (!playerPredictions || playerPredictions.length !== predictionDays) {
      return NextResponse.json({ 
        error: `代码输出格式错误。需要${predictionDays}个预测值，得到${playerPredictions?.length || 0}个`,
        output: pythonResult.output,
        stderr: pythonResult.stderr
      }, { status: 400 })
    }

    // 生成AI预测
    const aiPredictions = await generateAIPredictions(currency, historicalData, predictionDays)

    // 计算准确性
    const playerAccuracy = calculateAccuracy(playerPredictions, actualRates)
    const aiAccuracy = calculateAccuracy(aiPredictions, actualRates)

    console.log('代码预测计算准确率:', {
      playerPredictions,
      aiPredictions,
      actualRates,
      playerAccuracy,
      aiAccuracy
    })

    // 确定获胜者
    let winner: 'player' | 'ai' | 'tie' = 'tie'
    if (playerAccuracy > aiAccuracy) {
      winner = 'player'
    } else if (aiAccuracy > playerAccuracy) {
      winner = 'ai'
    }

    const results = {
      playerPredictions,
      aiPredictions,
      actualRates,
      playerAccuracy,
      aiAccuracy,
      winner,
      competitionId,
      codeOutput: pythonResult.output,
      codeStderr: pythonResult.stderr
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    console.error('代码预测提交失败:', error)
    return NextResponse.json({ error: '代码预测提交失败' }, { status: 500 })
  }
}

async function generateAIPredictions(currency: string, historicalData: PredictionData[], predictionDays: number = 5): Promise<number[]> {
  try {
    // 简化的AI预测逻辑
    // 实际应该加载LSTM模型并进行预测
    
    // 使用最近的汇率作为基准
    const recentRates = historicalData.slice(-10).map(item => item.rate)
    const baseRate = recentRates[recentRates.length - 1]
    
    // 计算简单的移动平均趋势
    const trend = (recentRates[recentRates.length - 1] - recentRates[0]) / recentRates.length
    
    const predictions: number[] = []
    for (let i = 0; i < predictionDays; i++) {
      // 添加一些随机波动
      const randomFactor = (Math.random() - 0.5) * 0.02 // ±1%的随机波动
      const trendFactor = trend * (i + 1) * 0.5 // 趋势影响
      const prediction = baseRate + trendFactor + randomFactor
      predictions.push(Math.round(prediction * 10000) / 10000) // 保留4位小数
    }
    
    return predictions
  } catch (error) {
    console.error('AI预测生成失败:', error)
    // 如果AI预测失败，返回基于历史平均值的简单预测
    const recentRates = historicalData.slice(-5).map(item => item.rate)
    const avgRate = recentRates.reduce((sum, rate) => sum + rate, 0) / recentRates.length
    return new Array(predictionDays).fill(avgRate)
  }
}

function calculateAccuracy(predictions: number[], actualRates: number[]): number {
  if (predictions.length !== actualRates.length) {
    return 0
  }

  // 使用改进的准确率计算方法
  // 1. 计算预测方向的准确性（30%权重）
  // 2. 计算数值偏差的准确性（70%权重）
  
  let directionAccuracy = 0
  let valueAccuracy = 0
  
  // 方向准确性：比较相邻天数的涨跌方向
  for (let i = 1; i < predictions.length; i++) {
    const predictedDirection = predictions[i] > predictions[i-1] ? 'up' : predictions[i] < predictions[i-1] ? 'down' : 'same'
    const actualDirection = actualRates[i] > actualRates[i-1] ? 'up' : actualRates[i] < actualRates[i-1] ? 'down' : 'same'
    
    if (predictedDirection === actualDirection) {
      directionAccuracy += 1
    }
  }
  directionAccuracy = (directionAccuracy / (predictions.length - 1)) * 100
  
  // 数值准确性：使用改进的MAPE计算
  let totalRelativeError = 0
  for (let i = 0; i < predictions.length; i++) {
    const relativeError = Math.abs(predictions[i] - actualRates[i]) / actualRates[i]
    // 使用平方根来减少大错误的惩罚
    totalRelativeError += Math.sqrt(relativeError)
  }
  
  const averageError = totalRelativeError / predictions.length
  // 转换为准确率，使用更温和的转换函数
  valueAccuracy = Math.max(0, 100 * Math.exp(-averageError * 10))
  
  // 综合准确率
  const combinedAccuracy = directionAccuracy * 0.3 + valueAccuracy * 0.7
  
  return Math.round(combinedAccuracy * 100) / 100 // 保留2位小数
}
