'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Clock, Wifi, WifiOff } from 'lucide-react'

interface RealTimeRateProps {
  fromCurrency: string
  toCurrency: string
  className?: string
}

interface RateData {
  rate: number
  isRealTime: boolean
  timestamp: string
  ratePair: string
  inverseRate: number
  source: string
}

export function RealTimeRate({ fromCurrency, toCurrency, className }: RealTimeRateProps) {
  const [rateData, setRateData] = useState<RateData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchRate = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/real-time-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency,
          toCurrency
        })
      })

      const data = await response.json()

      if (data.success) {
        setRateData(data)
      } else {
        setError(data.error || '获取汇率失败')
      }
    } catch (err) {
      setError('网络请求失败')
      console.error('Rate fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRate()
  }, [fromCurrency, toCurrency])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchRate()
    }, 30000) // 30秒自动刷新

    return () => clearInterval(interval)
  }, [autoRefresh, fromCurrency, toCurrency])

  const formatRate = (rate: number) => {
    if (rate < 0.01) {
      return rate.toFixed(6)
    } else if (rate < 1) {
      return rate.toFixed(4)
    } else if (rate < 100) {
      return rate.toFixed(2)
    } else {
      return rate.toFixed(0)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          实时汇率 {fromCurrency}/{toCurrency}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {rateData?.isRealTime ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              实时
            </Badge>
          ) : (
            <Badge variant="secondary">
              <WifiOff className="w-3 h-3 mr-1" />
              备用
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRate}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : rateData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatRate(rateData.rate)}
              </span>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  反向汇率: {formatRate(rateData.inverseRate)}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(rateData.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 border-t pt-2">
              数据源: {rateData.source}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span 
                className={`cursor-pointer ${autoRefresh ? 'text-blue-500' : 'text-gray-400'}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? '🔄 自动刷新' : '⏸️ 手动刷新'}
              </span>
              <span className="text-gray-400">
                每30秒更新
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-16">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-500">加载中...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RealTimeRate
