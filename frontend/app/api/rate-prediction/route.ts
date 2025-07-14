import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency, days = 20, bankName } = await request.json();
    
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

    // 银行名称映射到文件夹名
    const bankFolderMap: { [key: string]: string } = {
      '中国银行': 'china bank',
      '工商银行': 'ICBC',
      '建设银行': 'CCB', 
      '招商银行': 'CMB'
    };
    
    // 默认使用通用数据，如果有银行特定数据则使用银行数据
    let datasetPath = '';
    if (bankName && bankFolderMap[bankName]) {
      // 尝试使用银行特定数据
      const bankFolder = bankFolderMap[bankName];
      datasetPath = path.join(process.cwd(), '..', 'Rate LSTM', 'bank-data', bankFolder);
      console.log(`Using bank-specific dataset for ${bankName} at: ${datasetPath}`);
    } else {
      // 使用通用数据
      datasetPath = path.join(process.cwd(), '..', 'Rate LSTM');
      console.log('Using general dataset at:', datasetPath);
    }

    // 构建Python脚本路径
    const pythonScriptPath = path.join(process.cwd(), '..', '结合新闻情感预测', 'predict_api_enhanced.py');
    
    // 执行Python预测脚本，传递数据集路径
    const result = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [
        pythonScriptPath, 
        toCurrency, 
        days.toString(),
        datasetPath  // 传递数据集路径给Python脚本
      ]);
      
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
