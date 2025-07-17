#!/usr/bin/env python3
"""
实时汇率测试工具
测试高级金融后端服务的实时汇率API功能
"""

import requests
import json
import time
from datetime import datetime

def test_currency_pair(from_currency, to_currency, api_url="http://localhost:5002/get_real_time_rate"):
    """测试特定货币对的实时汇率"""
    try:
        payload = {
            "from_currency": from_currency,
            "to_currency": to_currency
        }
        
        response = requests.post(api_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ {from_currency}/{to_currency}: {data['rate']:.6f}")
                print(f"   实时汇率: {'是' if data['is_real_time'] else '否'}")
                print(f"   反向汇率: {data['inverse_rate']:.6f}")
                print(f"   时间戳: {data['timestamp']}")
                return True
            else:
                print(f"❌ {from_currency}/{to_currency}: {data.get('error', '未知错误')}")
                return False
        else:
            print(f"❌ {from_currency}/{to_currency}: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ {from_currency}/{to_currency}: 请求失败 - {e}")
        return False

def main():
    """主测试函数"""
    print("🌐 实时汇率API测试工具")
    print("=" * 50)
    
    # 测试货币对列表
    currency_pairs = [
        ('CNY', 'JPY'),
        ('CNY', 'SGD'),
        ('CNY', 'HKD'),
        ('CNY', 'USD'),
        ('CNY', 'EUR'),
        ('CNY', 'THB'),
        ('CNY', 'MYR'),
        ('CNY', 'KRW'),
        ('USD', 'JPY'),
        ('EUR', 'USD'),
    ]
    
    success_count = 0
    total_count = len(currency_pairs)
    
    for from_curr, to_curr in currency_pairs:
        print(f"\n📊 测试 {from_curr} → {to_curr}")
        if test_currency_pair(from_curr, to_curr):
            success_count += 1
        time.sleep(0.5)  # 避免请求过快
    
    print("\n" + "=" * 50)
    print(f"📈 测试完成: {success_count}/{total_count} 成功")
    print(f"成功率: {(success_count/total_count)*100:.1f}%")
    
    if success_count == total_count:
        print("🎉 所有汇率测试通过！实时汇率API运行正常。")
    elif success_count > total_count * 0.7:
        print("⚠️  大部分汇率测试通过，少数可能需要检查。")
    else:
        print("❌ 多数汇率测试失败，请检查API服务。")

if __name__ == "__main__":
    main()
