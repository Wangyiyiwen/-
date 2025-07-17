import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromCurrency, toCurrency } = body

    // 调用后端实时汇率服务
    const response = await fetch('http://localhost:5002/get_real_time_rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_currency: fromCurrency,
        to_currency: toCurrency
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({
        success: true,
        rate: data.rate,
        isRealTime: data.is_real_time,
        timestamp: data.timestamp,
        ratePair: `${fromCurrency}/${toCurrency}`,
        inverseRate: data.inverse_rate,
        source: data.is_real_time ? 'Real-time API' : 'Fallback data'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || '获取汇率失败'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Real-time rate fetch error:', error)
    
    // 降级到静态汇率
    const fallbackRates: Record<string, number> = {
      'CNYJPY': 20.45,
      'CNYSGD': 5.20,
      'CNYHKD': 0.92,
      'CNYUSD': 7.20,
      'CNYEUR': 7.80,
      'CNYTHB': 0.197,
      'CNYMYR': 1.58,
      'CNYKRW': 185.67
    }

    const body = await request.json()
    const { fromCurrency, toCurrency } = body
    const rateKey = `${fromCurrency}${toCurrency}`
    const reverseKey = `${toCurrency}${fromCurrency}`
    
    let rate = fallbackRates[rateKey]
    if (!rate && fallbackRates[reverseKey]) {
      rate = 1 / fallbackRates[reverseKey]
    }
    
    if (rate) {
      return NextResponse.json({
        success: true,
        rate: rate,
        isRealTime: false,
        timestamp: new Date().toISOString(),
        ratePair: `${fromCurrency}/${toCurrency}`,
        inverseRate: 1 / rate,
        source: 'Fallback static data'
      })
    }

    return NextResponse.json({
      success: false,
      error: `实时汇率服务不可用且未找到${fromCurrency}/${toCurrency}的备用汇率`
    }, { status: 500 })
  }
}
