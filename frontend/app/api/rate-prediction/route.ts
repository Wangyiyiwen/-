import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency, days = 20 } = await request.json();
    
    // 目前支持的货币对（基于现有的数据文件）
    const supportedCurrencies = ['JPY', 'HKD', 'SGD', 'THB', 'MYR', 'KRW'];
    
    // 验证货币对
    if (fromCurrency !== 'CNY') {
      return NextResponse.json({
        success: false,
        error: 'Currently only CNY as base currency is supported'
      }, { status: 400 });
    }
    
    if (!supportedCurrencies.includes(toCurrency)) {
      return NextResponse.json({
        success: false,
        error: `Currency ${toCurrency} is not supported. Supported currencies: ${supportedCurrencies.join(', ')}`
      }, { status: 400 });
    }

    // 构建Python脚本路径
    const pythonScriptPath = path.join(process.cwd(), '..', '结合新闻情感预测', 'predict_api.py');
    
    // 执行Python预测脚本
    const result = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [pythonScriptPath, toCurrency, days.toString()]);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse Python output: ' + output));
          }
        } else {
          reject(new Error('Python script failed: ' + errorOutput));
        }
      });
      
      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Rate prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
