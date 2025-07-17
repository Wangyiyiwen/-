from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import random
from datetime import datetime, timedelta
import numpy as np
import requests
import logging

app = Flask(__name__)
CORS(app)

# 配置日志
logging.basicConfig(level=logging.INFO)

class AdvancedCurrencyAnalyzer:
    def __init__(self):
        self.supported_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'THB', 'MYR']
        
        # 定义兑换渠道
        self.exchange_channels = {
            'major_bank': {
                'id': 'major_bank',
                'name': '大型银行',
                'type': 'BANK',
                'description': '中国银行、工商银行等大型银行网点',
                'base_rate_modifier': 0.998,
                'base_fee_rate': 0.5,
                'convenience': 3,
                'security': 5,
                'speed': 2,
                'availability': {
                    'cash': True,
                    'digital': True,
                    'min_amount': 100,
                    'max_amount': 50000
                }
            },
            'online_bank': {
                'id': 'online_bank',
                'name': '网上银行',
                'type': 'ONLINE',
                'description': '手机银行APP在线兑换',
                'base_rate_modifier': 0.999,
                'base_fee_rate': 0.3,
                'convenience': 5,
                'security': 4,
                'speed': 5,
                'availability': {
                    'cash': False,
                    'digital': True,
                    'min_amount': 50,
                    'max_amount': 100000
                }
            },
            'airport_exchange': {
                'id': 'airport_exchange',
                'name': '机场兑换',
                'type': 'AIRPORT',
                'description': '机场内货币兑换柜台',
                'base_rate_modifier': 0.985,
                'base_fee_rate': 2.0,
                'convenience': 4,
                'security': 4,
                'speed': 4,
                'availability': {
                    'cash': True,
                    'digital': False,
                    'min_amount': 100,
                    'max_amount': 10000
                }
            },
            'exchange_shop': {
                'id': 'exchange_shop',
                'name': '兑换店',
                'type': 'EXCHANGE_SHOP',
                'description': '专业货币兑换店',
                'base_rate_modifier': 0.992,
                'base_fee_rate': 1.0,
                'convenience': 3,
                'security': 3,
                'speed': 4,
                'availability': {
                    'cash': True,
                    'digital': False,
                    'min_amount': 200,
                    'max_amount': 20000
                }
            },
            'atm_withdrawal': {
                'id': 'atm_withdrawal',
                'name': 'ATM取现',
                'type': 'ATM',
                'description': '境外ATM直接取现',
                'base_rate_modifier': 0.995,
                'base_fee_rate': 1.5,
                'convenience': 5,
                'security': 4,
                'speed': 5,
                'availability': {
                    'cash': True,
                    'digital': True,
                    'min_amount': 100,
                    'max_amount': 5000
                }
            }
        }
    
    def analyze_advanced_strategy(self, amount, from_currency, to_currency, preferences):
        """
        高级策略分析 - 考虑用户偏好和多个渠道
        
        在这里实现你的高级分析逻辑：
        1. 用户偏好权重计算
        2. 多渠道成本效益分析
        3. 风险评估
        4. 个性化推荐
        """
        
        # 获取基础汇率
        base_rate = self._get_base_rate(from_currency, to_currency)
        
        # 分析所有可用渠道
        available_channels = self._filter_available_channels(
            amount, preferences['exchangeMethod'], preferences['location']
        )
        
        strategies = []
        
        for channel_id, channel_info in available_channels.items():
            # 计算该渠道的具体策略
            strategy = self._calculate_channel_strategy(
                channel_info, amount, from_currency, to_currency, 
                base_rate, preferences
            )
            strategies.append(strategy)
        
        # 根据用户偏好排序
        strategies = self._rank_strategies_by_preferences(strategies, preferences)
        
        return {
            'strategies': strategies,
            'analysis_summary': self._generate_analysis_summary(strategies, preferences),
            'market_conditions': self._get_market_conditions(from_currency, to_currency),
            'recommendations': self._generate_recommendations(strategies, preferences)
        }
    
    def _filter_available_channels(self, amount, exchange_method, location):
        """根据金额、兑换方式和地理位置筛选可用渠道"""
        available = {}
        
        for channel_id, channel in self.exchange_channels.items():
            # 检查兑换方式兼容性
            if exchange_method == 'CASH' and not channel['availability']['cash']:
                continue
            if exchange_method == 'DIGITAL' and not channel['availability']['digital']:
                continue
                
            # 检查金额限制
            if (amount < channel['availability']['min_amount'] or 
                amount > channel['availability']['max_amount']):
                continue
            
            # 检查地理位置可用性（这里可以添加更复杂的逻辑）
            if self._is_channel_available_in_location(channel, location):
                available[channel_id] = channel
                
        return available
    
    def _is_channel_available_in_location(self, channel, location):
        """检查渠道在指定位置是否可用"""
        # 这里可以实现基于地理位置的可用性检查
        # 例如：机场兑换只在机场可用，某些银行在特定城市没有网点等
        
        major_cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆']
        
        if channel['type'] == 'AIRPORT':
            # 机场兑换在主要城市的机场可用
            return location in major_cities
        elif channel['type'] == 'ONLINE':
            # 在线渠道全国可用
            return True
        else:
            # 其他渠道在主要城市可用
            return location in major_cities
    
    def _calculate_channel_strategy(self, channel, amount, from_currency, to_currency, base_rate, preferences):
        """计算特定渠道的策略详情"""
        
        # 计算实际汇率（考虑渠道费率）
        final_rate = base_rate * channel['base_rate_modifier']
        
        # 计算手续费
        fee_rate = self._calculate_dynamic_fee_rate(channel, amount, preferences)
        fee_amount = (amount * final_rate * fee_rate) / 100
        
        # 计算总成本
        total_cost = amount * final_rate + fee_amount
        
        # 计算用户评分
        user_score = self._calculate_user_score(channel, preferences)
        
        # 生成策略建议
        recommended_action = self._determine_recommended_action(channel, preferences, user_score)
        
        # 计算预期节省
        expected_savings = self._calculate_expected_savings(channel, amount, base_rate)
        
        # 生成优缺点分析
        pros, cons = self._analyze_pros_cons(channel, preferences)
        
        # 生成推理过程
        reasoning = self._generate_reasoning(channel, preferences, user_score)
        
        return {
            'id': f"strategy_{channel['id']}_{int(time.time() * 1000)}",
            'timestamp': datetime.now().isoformat(),
            'fromCurrency': from_currency,
            'toCurrency': to_currency,
            'amount': amount,
            'method': preferences['exchangeMethod'],
            'channel': channel,
            'currentRate': base_rate,
            'finalRate': round(final_rate, 4),
            'totalCost': round(total_cost, 2),
            'fees': round(fee_amount, 2),
            'recommendedAction': recommended_action,
            'confidence': self._calculate_confidence(channel, preferences),
            'expectedSavings': round(expected_savings, 2),
            'riskLevel': self._assess_risk_level(channel, amount),
            'timeframe': self._estimate_timeframe(channel, preferences),
            'reasoning': reasoning,
            'pros': pros,
            'cons': cons,
            'userScore': user_score,
            'alternativeStrategies': []  # 将在后续填充
        }
    
    def _calculate_dynamic_fee_rate(self, channel, amount, preferences):
        """动态计算手续费率"""
        base_fee = channel['base_fee_rate']
        
        # 根据金额调整费率（大额可能有优惠）
        if amount > 10000:
            base_fee *= 0.8
        elif amount > 50000:
            base_fee *= 0.6
            
        # 根据用户等级调整（这里可以根据实际业务逻辑调整）
        if preferences.get('vip_level', 0) > 0:
            base_fee *= (1 - preferences['vip_level'] * 0.1)
            
        return max(0.1, base_fee)  # 最低0.1%
    
    def _calculate_user_score(self, channel, preferences):
        """根据用户偏好计算渠道评分"""
        score = 0
        total_weight = 0
        
        # 便利性权重
        convenience_weight = preferences['conveniencePriority']
        score += channel['convenience'] * convenience_weight * 4
        total_weight += convenience_weight
        
        # 安全性权重
        security_weight = preferences['securityPriority']
        score += channel['security'] * security_weight * 4
        total_weight += security_weight
        
        # 速度权重（基于时间紧急程度）
        speed_weight = preferences['timeUrgency']
        score += channel['speed'] * speed_weight * 4
        total_weight += speed_weight
        
        # 成本权重（费率越低分数越高）
        cost_weight = preferences['costPriority']
        cost_score = max(0, 5 - channel['base_fee_rate'])
        score += cost_score * cost_weight * 4
        total_weight += cost_weight
        
        # 归一化到100分制
        if total_weight > 0:
            final_score = min(100, max(0, (score / total_weight)))
        else:
            final_score = 50
            
        return round(final_score)
    
    def _determine_recommended_action(self, channel, preferences, user_score):
        """确定推荐操作"""
        if user_score >= 80:
            return 'EXECUTE'
        elif user_score >= 60:
            return 'COMPARE'
        elif channel['base_fee_rate'] > preferences.get('maxAcceptableFee', 2.0):
            return 'NEGOTIATE'
        else:
            return 'WAIT'
    
    def _calculate_expected_savings(self, channel, amount, base_rate):
        """计算预期节省金额"""
        # 与最差渠道比较的节省金额
        worst_rate = base_rate * 0.98  # 假设最差汇率
        worst_fee = amount * worst_rate * 0.025  # 假设最高2.5%手续费
        worst_total = amount * worst_rate + worst_fee
        
        current_total = amount * base_rate * channel['base_rate_modifier'] + \
                       (amount * base_rate * channel['base_rate_modifier'] * channel['base_fee_rate']) / 100
        
        return max(0, worst_total - current_total)
    
    def _analyze_pros_cons(self, channel, preferences):
        """分析渠道优缺点"""
        pros = []
        cons = []
        
        # 基于渠道特性生成优缺点
        if channel['convenience'] >= 4:
            pros.append("操作便利，随时可用")
        else:
            cons.append("需要到指定地点办理")
            
        if channel['security'] >= 4:
            pros.append("安全性高，资金有保障")
        else:
            cons.append("安全性相对较低，需要注意风险")
            
        if channel['speed'] >= 4:
            pros.append("处理速度快，即时到账")
        else:
            cons.append("处理时间较长，需要等待")
            
        if channel['base_fee_rate'] <= 1.0:
            pros.append("手续费较低，成本优势明显")
        else:
            cons.append("手续费相对较高")
            
        # 基于兑换方式的特殊优缺点
        if channel['type'] == 'ONLINE':
            pros.append("24小时可用，无需排队")
            if preferences['exchangeMethod'] == 'CASH':
                cons.append("仅支持电子账户，不支持现金")
        elif channel['type'] == 'AIRPORT':
            pros.append("出行时方便兑换")
            cons.append("汇率通常不是最优")
        elif channel['type'] == 'BANK':
            pros.append("正规渠道，信誉有保障")
            cons.append("营业时间限制，可能需要排队")
            
        return pros[:3], cons[:3]  # 限制数量
    
    def _generate_reasoning(self, channel, preferences, user_score):
        """生成推理过程"""
        reasoning = []
        
        reasoning.append(f"基于您的{preferences['exchangeMethod']}偏好，该渠道{'支持' if channel['availability'][preferences['exchangeMethod'].lower()] else '不支持'}此方式")
        
        if preferences['timeUrgency'] >= 4:
            reasoning.append(f"考虑到您的时间紧急程度，该渠道速度评级{channel['speed']}/5")
        
        if preferences['securityPriority'] >= 4:
            reasoning.append(f"该渠道安全等级{channel['security']}/5，符合您的安全要求")
            
        if preferences['costPriority'] >= 4:
            reasoning.append(f"手续费率{channel['base_fee_rate']}%，在您的可接受范围内")
            
        reasoning.append(f"综合评分{user_score}/100，推荐程度{'高' if user_score >= 80 else '中等' if user_score >= 60 else '较低'}")
        
        return reasoning
    
    def _calculate_confidence(self, channel, preferences):
        """计算置信度"""
        base_confidence = 70
        
        # 根据渠道稳定性调整
        if channel['security'] >= 4:
            base_confidence += 10
        if channel['type'] in ['BANK', 'ONLINE']:
            base_confidence += 10
            
        # 根据用户偏好匹配度调整
        user_score = self._calculate_user_score(channel, preferences)
        if user_score >= 80:
            base_confidence += 15
        elif user_score >= 60:
            base_confidence += 5
            
        return min(95, max(50, base_confidence))
    
    def _assess_risk_level(self, channel, amount):
        """评估风险等级"""
        risk_score = 0
        
        # 基于渠道安全性
        risk_score += (5 - channel['security']) * 20
        
        # 基于金额大小
        if amount > 50000:
            risk_score += 20
        elif amount > 10000:
            risk_score += 10
            
        # 基于渠道类型
        if channel['type'] == 'EXCHANGE_SHOP':
            risk_score += 15
        elif channel['type'] == 'AIRPORT':
            risk_score += 10
            
        if risk_score <= 30:
            return 'LOW'
        elif risk_score <= 60:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def _estimate_timeframe(self, channel, preferences):
        """估算完成时间"""
        timeframes = {
            1: "2-3天",
            2: "1-2天", 
            3: "半天",
            4: "1-2小时",
            5: "即时"
        }
        return timeframes.get(channel['speed'], "1-2天")
    
    def _rank_strategies_by_preferences(self, strategies, preferences):
        """根据用户偏好对策略排序"""
        return sorted(strategies, key=lambda x: x['userScore'], reverse=True)
    
    def _generate_analysis_summary(self, strategies, preferences):
        """生成分析摘要"""
        if not strategies:
            return "未找到合适的兑换渠道"
            
        best_strategy = strategies[0]
        return {
            'total_options': len(strategies),
            'best_option': best_strategy['channel']['name'],
            'best_score': best_strategy['userScore'],
            'avg_score': round(sum(s['userScore'] for s in strategies) / len(strategies)),
            'cost_range': {
                'min': min(s['totalCost'] for s in strategies),
                'max': max(s['totalCost'] for s in strategies)
            }
        }
    
    def _get_market_conditions(self, from_currency, to_currency):
        """获取市场条件"""
        return {
            'volatility': random.uniform(0.5, 2.5),
            'trend': random.choice(['BULLISH', 'BEARISH', 'NEUTRAL']),
            'liquidity': random.choice(['HIGH', 'MEDIUM', 'LOW']),
            'news_sentiment': random.uniform(-1, 1)
        }
    
    def _generate_recommendations(self, strategies, preferences):
        """生成总体建议"""
        if not strategies:
            return []
            
        recommendations = []
        
        best_strategy = strategies[0]
        if best_strategy['userScore'] >= 80:
            recommendations.append(f"强烈推荐使用{best_strategy['channel']['name']}，综合评分{best_strategy['userScore']}/100")
        
        if preferences['timeUrgency'] >= 4:
            fast_options = [s for s in strategies if s['channel']['speed'] >= 4]
            if fast_options:
                recommendations.append(f"考虑到时间紧急，推荐{fast_options[0]['channel']['name']}等快速渠道")
        
        if preferences['costPriority'] >= 4:
            cheap_options = sorted(strategies, key=lambda x: x['totalCost'])
            if cheap_options:
                recommendations.append(f"从成本角度考虑，{cheap_options[0]['channel']['name']}最经济")
        
        return recommendations
    
    def _get_base_rate(self, from_currency, to_currency):
        """获取基础汇率 - 优先使用实时API，失败时使用备用数据"""
        try:
            # 尝试从实时API获取汇率
            real_time_rate = self._fetch_real_time_rate(from_currency, to_currency)
            if real_time_rate:
                logging.info(f"获取实时汇率成功: {from_currency}/{to_currency} = {real_time_rate}")
                return real_time_rate
        except Exception as e:
            logging.warning(f"实时汇率获取失败: {e}，使用备用汇率")
        
        # 备用汇率数据（当实时API不可用时使用）
        fallback_rates = {
            'USDCNY': 7.2345,
            'EURCNY': 7.8901,
            'GBPCNY': 9.1234,
            'JPYCNY': 0.0489,  # 更新为实际JPY汇率
            'CNYJPY': 20.45,   # CNY到JPY
            'CNYSGD': 5.20,    # CNY到SGD
            'CNYHKD': 0.92,    # CNY到HKD
            'CNYKRW': 185.67,
            'CNYTHB': 0.197,   # CNY到THB
            'CNYMYR': 1.58,    # CNY到MYR
        }
        
        rate_key = f'{from_currency}{to_currency}'
        reverse_key = f'{to_currency}{from_currency}'
        
        if rate_key in fallback_rates:
            return fallback_rates[rate_key]
        elif reverse_key in fallback_rates:
            return 1.0 / fallback_rates[reverse_key]
        else:
            logging.warning(f"未找到汇率对: {from_currency}/{to_currency}，使用默认值1.0")
            return 1.0
    
    def _fetch_real_time_rate(self, from_currency, to_currency):
        """从实时API获取汇率"""
        try:
            # 方案1: 使用 exchangerate-api.com (免费tier每月1500次请求)
            api_key = "YOUR_API_KEY"  # 如果有API key可以填入
            
            # 免费的API (无需API key)
            free_apis = [
                {
                    'name': 'exchangerate-api',
                    'url': f'https://api.exchangerate-api.com/v4/latest/{from_currency}',
                    'parser': lambda data: data.get('rates', {}).get(to_currency)
                },
                {
                    'name': 'fixer.io',
                    'url': f'https://api.fixer.io/latest?base={from_currency}&symbols={to_currency}',
                    'parser': lambda data: data.get('rates', {}).get(to_currency)
                },
                {
                    'name': 'currencylayer', 
                    'url': f'https://apilayer.net/api/live?access_key=free&currencies={to_currency}&source={from_currency}&format=1',
                    'parser': lambda data: data.get('quotes', {}).get(f'{from_currency}{to_currency}')
                }
            ]
            
            # 尝试每个API
            for api in free_apis:
                try:
                    response = requests.get(api['url'], timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        rate = api['parser'](data)
                        if rate and isinstance(rate, (int, float)) and rate > 0:
                            logging.info(f"从 {api['name']} 获取汇率成功: {rate}")
                            return float(rate)
                except Exception as api_error:
                    logging.warning(f"{api['name']} API 失败: {api_error}")
                    continue
            
            # 如果所有免费API都失败，尝试一个简单的汇率计算
            return self._calculate_cross_rate(from_currency, to_currency)
            
        except Exception as e:
            logging.error(f"实时汇率获取完全失败: {e}")
            return None
    
    def _calculate_cross_rate(self, from_currency, to_currency):
        """计算交叉汇率（通过USD中转）"""
        try:
            if from_currency == 'USD':
                # 直接获取USD到目标货币的汇率
                response = requests.get(f'https://api.exchangerate-api.com/v4/latest/USD', timeout=3)
                if response.status_code == 200:
                    data = response.json()
                    return data.get('rates', {}).get(to_currency)
            elif to_currency == 'USD':
                # 获取源货币到USD的汇率
                response = requests.get(f'https://api.exchangerate-api.com/v4/latest/{from_currency}', timeout=3)
                if response.status_code == 200:
                    data = response.json()
                    return data.get('rates', {}).get('USD')
            else:
                # 通过USD计算交叉汇率
                usd_response = requests.get('https://api.exchangerate-api.com/v4/latest/USD', timeout=3)
                if usd_response.status_code == 200:
                    usd_data = usd_response.json()
                    usd_rates = usd_data.get('rates', {})
                    
                    from_to_usd = 1.0 / usd_rates.get(from_currency, 1.0)  # 源货币到USD
                    usd_to_target = usd_rates.get(to_currency, 1.0)  # USD到目标货币
                    
                    cross_rate = from_to_usd * usd_to_target
                    if cross_rate > 0:
                        return cross_rate
        except Exception as e:
            logging.error(f"交叉汇率计算失败: {e}")
        
        return None

# 创建分析器实例
analyzer = AdvancedCurrencyAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'service': 'advanced_currency_analyzer',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat(),
        'features': ['multi_channel', 'user_preferences', 'risk_assessment']
    })

@app.route('/analyze_advanced_strategy', methods=['POST'])
def analyze_advanced_strategy():
    """高级策略分析接口"""
    try:
        data = request.get_json()
        
        # 验证必需参数
        required_fields = ['amount', 'from_currency', 'to_currency', 'preferences']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需参数: {field}'}), 400
        
        amount = data['amount']
        from_currency = data['from_currency']
        to_currency = data['to_currency']
        preferences = data['preferences']
        
        # 验证数据
        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({'error': '金额必须是正数'}), 400
            
        if from_currency not in analyzer.supported_currencies:
            return jsonify({'error': f'不支持的源货币: {from_currency}'}), 400
            
        if to_currency not in analyzer.supported_currencies:
            return jsonify({'error': f'不支持的目标货币: {to_currency}'}), 400
        
        # 执行高级策略分析
        result = analyzer.analyze_advanced_strategy(
            amount, from_currency, to_currency, preferences
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'策略分析失败: {str(e)}'}), 500

@app.route('/get_available_channels', methods=['POST'])
def get_available_channels():
    """获取可用渠道"""
    try:
        data = request.get_json()
        amount = data.get('amount', 1000)
        exchange_method = data.get('exchange_method', 'DIGITAL')
        location = data.get('location', '北京')
        
        available = analyzer._filter_available_channels(amount, exchange_method, location)
        
        return jsonify({
            'available_channels': list(available.keys()),
            'channel_details': available,
            'total_count': len(available)
        })
        
    except Exception as e:
        return jsonify({'error': f'获取渠道信息失败: {str(e)}'}), 500

@app.route('/get_real_time_rate', methods=['POST'])
def get_real_time_rate():
    """获取实时汇率"""
    try:
        data = request.get_json()
        from_currency = data.get('from_currency', 'CNY')
        to_currency = data.get('to_currency', 'USD')
        
        # 验证货币代码
        if from_currency not in analyzer.supported_currencies:
            return jsonify({'error': f'不支持的源货币: {from_currency}'}), 400
        if to_currency not in analyzer.supported_currencies:
            return jsonify({'error': f'不支持的目标货币: {to_currency}'}), 400
        
        # 获取实时汇率
        rate = analyzer._get_base_rate(from_currency, to_currency)
        
        # 尝试获取实时汇率详情
        try:
            real_time_rate = analyzer._fetch_real_time_rate(from_currency, to_currency)
            is_real_time = real_time_rate is not None
        except:
            real_time_rate = None
            is_real_time = False
        
        return jsonify({
            'success': True,
            'from_currency': from_currency,
            'to_currency': to_currency,
            'rate': rate,
            'real_time_rate': real_time_rate,
            'is_real_time': is_real_time,
            'timestamp': datetime.now().isoformat(),
            'rate_pair': f'{from_currency}/{to_currency}',
            'inverse_rate': round(1.0 / rate, 6) if rate > 0 else 0
        })
        
    except Exception as e:
        return jsonify({'error': f'获取汇率失败: {str(e)}'}), 500

if __name__ == '__main__':
    print("启动高级货币兑换策略分析服务...")
    print("服务地址: http://localhost:5002")
    print("健康检查: http://localhost:5002/health")
    print("高级策略分析: POST http://localhost:5002/analyze_advanced_strategy")
    print("可用渠道查询: POST http://localhost:5002/get_available_channels")
    print("实时汇率查询: POST http://localhost:5002/get_real_time_rate")
    print("按 Ctrl+C 停止服务")
    
    app.run(
        host='0.0.0.0',
        port=5002,
        debug=True,
        threaded=True
    )
