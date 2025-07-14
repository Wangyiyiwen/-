from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

class PurchaseStrategyAnalyzer:
    def __init__(self):
        self.supported_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'THB', 'MYR', 'VND', 'PHP']
        
        # 定义兑换渠道及其特性
        self.exchange_channels = {
            'major_bank': {
                'name': '大型银行网点',
                'type': 'BANK',
                'base_rate_modifier': 1.0,
                'base_fee_rate': 0.5,
                'time_factor': {
                    'LOW': '1-2天',
                    'MEDIUM': '2-4小时', 
                    'HIGH': '1小时'
                },
                'pros': ['汇率优惠', '安全可靠', '网点众多', '支持大额兑换'],
                'cons': ['需要预约', '营业时间限制', '可能需要排队'],
                'risk_level': 'LOW',
                'supports_cash': True,
                'supports_digital': True
            },
            'online_bank': {
                'name': '手机银行APP',
                'type': 'ONLINE',
                'base_rate_modifier': 1.002,
                'base_fee_rate': 0.3,
                'time_factor': {
                    'LOW': '即时',
                    'MEDIUM': '即时',
                    'HIGH': '即时'
                },
                'pros': ['24小时可用', '手续费低', '操作便捷', '无需排队'],
                'cons': ['仅支持电汇', '有额度限制', '需要网银'],
                'risk_level': 'LOW',
                'supports_cash': False,
                'supports_digital': True
            },
            'airport_exchange': {
                'name': '机场兑换',
                'type': 'AIRPORT',
                'base_rate_modifier': 0.985,
                'base_fee_rate': 2.0,
                'time_factor': {
                    'LOW': '30分钟',
                    'MEDIUM': '30分钟',
                    'HIGH': '30分钟'
                },
                'pros': ['出行方便', '即时取钞', '无需预约'],
                'cons': ['汇率较差', '手续费高', '仅在机场可用'],
                'risk_level': 'MEDIUM',
                'supports_cash': True,
                'supports_digital': False
            },
            'exchange_shop': {
                'name': '专业兑换店',
                'type': 'EXCHANGE_SHOP',
                'base_rate_modifier': 0.995,
                'base_fee_rate': 1.0,
                'time_factor': {
                    'LOW': '1小时',
                    'MEDIUM': '1小时',
                    'HIGH': '30分钟'
                },
                'pros': ['汇率较好', '专业服务', '手续简便'],
                'cons': ['网点较少', '营业时间限制', '可能缺货'],
                'risk_level': 'MEDIUM',
                'supports_cash': True,
                'supports_digital': False
            },
            'atm_overseas': {
                'name': '境外ATM取现',
                'type': 'ATM',
                'base_rate_modifier': 0.998,
                'base_fee_rate': 1.5,
                'time_factor': {
                    'LOW': '到达后即时',
                    'MEDIUM': '到达后即时',
                    'HIGH': '到达后即时'
                },
                'pros': ['到达后取现', '汇率实时', '24小时可用'],
                'cons': ['需要境外操作', '可能有额度限制', '依赖ATM可用性'],
                'risk_level': 'MEDIUM',
                'supports_cash': True,
                'supports_digital': True
            }
        }
        
        # 货币汇率 (相对于人民币)
        self.exchange_rates = {
            'USD': 7.2345,
            'EUR': 7.8901,
            'GBP': 9.1234,
            'JPY': 0.0543,
            'CNY': 1.0000,
            'KRW': 0.0055,
            'AUD': 4.8567,
            'CAD': 5.3421,
            'CHF': 8.1234,
            'HKD': 0.9234,
            'SGD': 5.4321,
            'THB': 0.2012,
            'MYR': 1.5432,
            'VND': 0.0003,
            'PHP': 0.1287
        }
    
    def analyze_purchase_strategy(self, purchase_request):
        """
        分析购钞策略的核心函数
        
        在这里实现你的购钞策略分析逻辑：
        1. 根据用户需求筛选可用渠道
        2. 计算各渠道的成本效益
        3. 考虑时间、地点、偏好等因素
        4. 推荐最优策略
        """
        
        amount = purchase_request['amount']
        from_currency = purchase_request['fromCurrency']
        to_currency = purchase_request['toCurrency']
        urgency = purchase_request['urgency']
        location = purchase_request['location']
        preferred_method = purchase_request['preferredMethod']
        max_fee = purchase_request['maxFee']
        purpose = purchase_request['purpose']
        
        # 1. 筛选可用渠道
        available_channels = self._filter_available_channels(
            amount, from_currency, to_currency, preferred_method, location
        )
        
        # 2. 计算各渠道策略
        channel_strategies = []
        for channel_id, channel_info in available_channels.items():
            strategy = self._calculate_channel_strategy(
                channel_info, amount, from_currency, to_currency, 
                urgency, max_fee, purpose
            )
            channel_strategies.append(strategy)
        
        # 3. 根据用户偏好排序
        best_strategy = self._select_best_strategy(
            channel_strategies, urgency, preferred_method, max_fee
        )
        
        # 4. 生成备选方案
        alternatives = [s for s in channel_strategies if s['channel'] != best_strategy['channel']][:2]
        
        return {
            **best_strategy,
            'alternatives': alternatives,
            'analysis_time': datetime.now().isoformat(),
            'market_conditions': self._get_market_conditions(from_currency, to_currency)
        }
    
    def _filter_available_channels(self, amount, from_currency, to_currency, preferred_method, location):
        """根据用户需求筛选可用渠道"""
        available = {}
        
        for channel_id, channel in self.exchange_channels.items():
            # 检查兑换方式兼容性
            if preferred_method == 'CASH' and not channel['supports_cash']:
                continue
            if preferred_method == 'DIGITAL' and not channel['supports_digital']:
                continue
            
            # 检查地理位置可用性
            if self._is_channel_available_in_location(channel, location):
                available[channel_id] = channel
                
        return available
    
    def _is_channel_available_in_location(self, channel, location):
        """检查渠道在指定位置是否可用"""
        major_cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '武汉', '西安']
        
        if channel['type'] == 'AIRPORT':
            # 机场兑换在主要城市的机场可用
            return location in major_cities
        elif channel['type'] == 'ONLINE':
            # 在线渠道全国可用
            return True
        elif channel['type'] == 'ATM':
            # ATM取现需要目的地支持
            return True
        else:
            # 其他渠道在主要城市可用
            return location in major_cities
    
    def _calculate_channel_strategy(self, channel, amount, from_currency, to_currency, urgency, max_fee, purpose):
        """计算特定渠道的策略详情"""
        
        # 获取基础汇率
        base_rate = self.exchange_rates.get(to_currency, 1.0)
        
        # 应用渠道汇率修正
        final_rate = base_rate * channel['base_rate_modifier']
        
        # 计算手续费
        fee_rate = self._calculate_dynamic_fee_rate(channel, amount, purpose)
        
        # 计算总成本
        if from_currency == 'CNY':
            # 从人民币兑换
            foreign_amount = amount / final_rate
            fee_amount = foreign_amount * fee_rate / 100
            total_cost = foreign_amount + fee_amount
        else:
            # 从外币兑换到人民币或其他外币
            cny_amount = amount * self.exchange_rates.get(from_currency, 1.0)
            foreign_amount = cny_amount / final_rate
            fee_amount = foreign_amount * fee_rate / 100
            total_cost = foreign_amount + fee_amount
        
        # 计算节省金额（与最差方案比较）
        worst_rate = base_rate * 0.97  # 假设最差汇率
        worst_fee = 2.5  # 假设最高手续费
        worst_cost = (amount / worst_rate) * (1 + worst_fee / 100)
        savings = max(0, worst_cost - total_cost)
        
        return {
            'id': f"strategy_{channel['name']}_{int(time.time() * 1000)}",
            'channel': channel['name'],
            'channelType': channel['type'],
            'rate': round(final_rate, 4),
            'fees': round(fee_rate, 2),
            'totalCost': round(total_cost, 2),
            'savings': round(savings, 2),
            'timeRequired': channel['time_factor'][urgency],
            'steps': self._generate_steps(channel, purpose),
            'pros': channel['pros'],
            'cons': channel['cons'],
            'riskLevel': channel['risk_level'],
            'confidence': self._calculate_confidence(channel, urgency, fee_rate, max_fee)
        }
    
    def _calculate_dynamic_fee_rate(self, channel, amount, purpose):
        """动态计算手续费率"""
        base_fee = channel['base_fee_rate']
        
        # 根据金额调整费率
        if amount > 50000:
            base_fee *= 0.8  # 大额优惠
        elif amount > 100000:
            base_fee *= 0.6  # 更大优惠
        
        # 根据用途调整费率
        if purpose in ['留学', '移民']:
            base_fee *= 0.9  # 特殊用途优惠
        elif purpose == '投资':
            base_fee *= 1.1  # 投资用途费率稍高
        
        return max(0.1, base_fee)
    
    def _generate_steps(self, channel, purpose):
        """生成操作步骤"""
        base_steps = {
            'BANK': [
                f"在线预约{channel['name']}",
                "准备身份证和购汇申请材料",
                "前往指定网点办理",
                "完成购汇并取钞"
            ],
            'ONLINE': [
                "登录手机银行APP",
                "选择外汇兑换功能",
                "输入兑换金额和币种",
                "确认交易并完成支付"
            ],
            'AIRPORT': [
                "前往机场兑换柜台",
                "出示身份证和机票",
                "填写兑换申请表",
                "完成兑换并取钞"
            ],
            'EXCHANGE_SHOP': [
                "查找附近的兑换店",
                "携带身份证前往",
                "确认汇率和手续费",
                "完成兑换交易"
            ],
            'ATM': [
                "确认目的地ATM网络",
                "开通境外取现功能",
                "到达后寻找合作ATM",
                "使用银行卡直接取现"
            ]
        }
        
        steps = base_steps.get(channel['type'], base_steps['BANK'])
        
        # 根据用途添加特殊步骤
        if purpose == '留学':
            steps.insert(1, "准备留学相关证明材料")
        elif purpose == '移民':
            steps.insert(1, "准备移民签证等相关文件")
        
        return steps
    
    def _calculate_confidence(self, channel, urgency, fee_rate, max_fee):
        """计算推荐置信度"""
        confidence = 80  # 基础置信度
        
        # 根据渠道类型调整
        if channel['type'] == 'BANK':
            confidence += 10  # 银行更可靠
        elif channel['type'] == 'ONLINE':
            confidence += 5   # 在线便捷
        
        # 根据费率调整
        if fee_rate <= max_fee:
            confidence += 10
        else:
            confidence -= 20
        
        # 根据紧急程度调整
        if urgency == 'HIGH' and '即时' in channel['time_factor']['HIGH']:
            confidence += 15
        
        return min(95, max(50, confidence))
    
    def _select_best_strategy(self, strategies, urgency, preferred_method, max_fee):
        """选择最佳策略"""
        if not strategies:
            return None
        
        # 多维度评分
        for strategy in strategies:
            score = 0
            
            # 费率评分 (40%)
            if strategy['fees'] <= max_fee:
                score += 40 * (1 - strategy['fees'] / max_fee)
            
            # 时间评分 (30%)
            time_scores = {'即时': 30, '30分钟': 25, '1小时': 20, '2-4小时': 15, '1-2天': 10}
            score += time_scores.get(strategy['timeRequired'], 5)
            
            # 风险评分 (20%)
            risk_scores = {'LOW': 20, 'MEDIUM': 15, 'HIGH': 10}
            score += risk_scores.get(strategy['riskLevel'], 10)
            
            # 置信度评分 (10%)
            score += strategy['confidence'] * 0.1
            
            strategy['score'] = score
        
        # 返回评分最高的策略
        return max(strategies, key=lambda x: x['score'])
    
    def _get_market_conditions(self, from_currency, to_currency):
        """获取市场条件"""
        return {
            'volatility': round(random.uniform(0.5, 2.5), 2),
            'trend': random.choice(['上升', '下降', '稳定']),
            'liquidity': random.choice(['高', '中', '低']),
            'recommendation': '建议关注汇率波动，选择合适时机兑换'
        }

# 创建分析器实例
analyzer = PurchaseStrategyAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'service': 'purchase_strategy_analyzer',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'supported_currencies': analyzer.supported_currencies
    })

@app.route('/analyze_purchase_strategy', methods=['POST'])
def analyze_purchase_strategy():
    """购钞策略分析接口"""
    try:
        data = request.get_json()
        
        # 验证必需参数
        required_fields = ['amount', 'fromCurrency', 'toCurrency', 'urgency', 'location', 'preferredMethod']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需参数: {field}'}), 400
        
        # 验证数据有效性
        if not isinstance(data['amount'], (int, float)) or data['amount'] <= 0:
            return jsonify({'error': '金额必须是正数'}), 400
        
        if data['fromCurrency'] not in analyzer.supported_currencies:
            return jsonify({'error': f'不支持的源货币: {data["fromCurrency"]}'}), 400
        
        if data['toCurrency'] not in analyzer.supported_currencies:
            return jsonify({'error': f'不支持的目标货币: {data["toCurrency"]}'}), 400
        
        # 执行策略分析
        result = analyzer.analyze_purchase_strategy(data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'购钞策略分析失败: {str(e)}'}), 500

@app.route('/get_exchange_rates', methods=['GET'])
def get_exchange_rates():
    """获取当前汇率"""
    try:
        # 添加一些随机波动
        current_rates = {}
        for currency, rate in analyzer.exchange_rates.items():
            fluctuation = random.uniform(-0.01, 0.01)  # ±1%波动
            current_rates[currency] = round(rate * (1 + fluctuation), 4)
        
        return jsonify({
            'rates': current_rates,
            'timestamp': datetime.now().isoformat(),
            'source': 'purchase_strategy_backend'
        })
        
    except Exception as e:
        return jsonify({'error': f'获取汇率失败: {str(e)}'}), 500

@app.route('/get_supported_currencies', methods=['GET'])
def get_supported_currencies():
    """获取支持的货币列表"""
    try:
        currencies_info = []
        for code in analyzer.supported_currencies:
            rate = analyzer.exchange_rates.get(code, 1.0)
            currencies_info.append({
                'code': code,
                'rate': rate,
                'name': get_currency_name(code)
            })
        
        return jsonify({
            'currencies': currencies_info,
            'total_count': len(currencies_info)
        })
        
    except Exception as e:
        return jsonify({'error': f'获取货币列表失败: {str(e)}'}), 500

def get_currency_name(code):
    """获取货币中文名称"""
    names = {
        'USD': '美元', 'EUR': '欧元', 'GBP': '英镑', 'JPY': '日元', 'CNY': '人民币',
        'KRW': '韩元', 'AUD': '澳元', 'CAD': '加元', 'CHF': '瑞士法郎', 'HKD': '港币',
        'SGD': '新加坡元', 'THB': '泰铢', 'MYR': '马来西亚林吉特', 'VND': '越南盾', 'PHP': '菲律宾比索'
    }
    return names.get(code, code)

if __name__ == '__main__':
    print("启动购钞策略分析服务...")
    print("服务地址: http://localhost:5001")
    print("健康检查: http://localhost:5001/health")
    print("购钞策略分析: POST http://localhost:5001/analyze_purchase_strategy")
    print("汇率查询: GET http://localhost:5001/get_exchange_rates")
    print("支持货币: GET http://localhost:5001/get_supported_currencies")
    print("按 Ctrl+C 停止服务")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
