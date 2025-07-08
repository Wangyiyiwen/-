import pandas as pd

# 手续费结构体
class FeeStructure:
    """
    手续费结构类，用于定义不同类型的手续费计算方式
    
    用法示例：
    # 创建百分比手续费结构（1%手续费）
    fee1 = FeeStructure("percentage", 0.01)
    
    # 创建固定手续费结构（固定收取50元）
    fee2 = FeeStructure("fixed", 50)
    
    # 创建复杂手续费结构（根据金额不同收取不同费用）
    fee3 = FeeStructure("complex", [38, 50])  # 小于2000收38元，其他金额收50元
    
    # 计算手续费
    fee = fee1.calculate_fee(1000)  # 计算1000元的手续费
    """
    
    def __init__(self, fee_type, fee_value):
        """
        初始化手续费结构
        
        参数:
        fee_type (str): 手续费类型
            - "percentage": 百分比手续费，fee_value为小数形式（如0.01表示1%）
            - "fixed": 固定手续费，fee_value为固定金额
            - "complex": 复杂手续费，fee_value为列表[小额费用, 大额费用]
        fee_value (float或list): 手续费值
            - percentage类型时：小数形式的百分比
            - fixed类型时：固定金额数值
            - complex类型时：包含两个元素的列表[小额费用, 大额费用]
        """
        self.fee_type = fee_type  # 手续费类型（如百分比，固定费用等）
        self.fee_value = fee_value  # 手续费值

    def calculate_fee(self, amount):
        """
        计算指定金额的手续费
        
        参数:
        amount (float): 需要计算手续费的金额
        
        返回:
        float: 计算出的手续费金额
        
        用法示例:
        fee_structure = FeeStructure("percentage", 0.01)
        fee = fee_structure.calculate_fee(1000)  # 返回 10.0（1000 * 0.01）
        """
        if self.fee_type == "percentage":
            return amount * self.fee_value
        elif self.fee_type == "fixed":
            return self.fee_value
        elif self.fee_type == "complex":
            # 复杂类型，例如手续费是根据具体金额不同计算的
            if amount < 2000:
                return self.fee_value[0]  # 小于2000时收取的手续费
            else:
                return self.fee_value[1]  # 大于等于2000时收取的手续费
        else:
            return 0

# 构造策略数据库的类
class CurrencyExchangeStrategy:
    """
    货币兑换策略类，用于表示一种具体的兑换方式
    
    用法示例：
    # 创建一个银行兑换策略
    fee_structure = FeeStructure("percentage", 0.01)  # 1%手续费
    strategy = CurrencyExchangeStrategy(
        name="中国银行兑换",
        is_cash=True,
        fee_structure=fee_structure,
        processing_time=3,  # 办理时长，单位：工作日
        convenience=3,  # 1-5，1为最不便捷，5为最便捷
        international_compatibility=4,  # 1-5，1为最不兼容，5为最兼容
        is_suitable_for_large_transactions=True  # 是否适合大额交易
    )
    
    # 使用策略计算手续费
    fee = strategy.fee_structure.calculate_fee(1000)  # 计算1000元的手续费
    
    # 获取策略信息
    print(f"策略名称: {strategy.name}")
    print(f"是否现金兑换: {strategy.is_cash}")
    print(f"手续费类型: {strategy.fee_structure.fee_type}")
    """
    
    def __init__(self, name, is_cash, fee_structure, processing_time, convenience, international_compatibility, is_suitable_for_large_transactions):
        """
        初始化货币兑换策略
        
        参数:
        name (str): 策略名称（如"银行兑换"、"外币兑换点"等）
        is_cash (bool): 是否是现金兑换
            - True: 现金兑换（获得纸币）
            - False: 非现金兑换（如银行卡、电子支付等）
        fee_structure (FeeStructure): 手续费结构对象
        processing_time (int): 办理时长（单位：工作日）
        convenience (int): 换钱的方便程度（1-5，1为最不便捷，5为最便捷）
        international_compatibility (int): 在目标国际使用这个方式的便利程度（1-5，1为最不兼容，5为最兼容）
        is_suitable_for_large_transactions (bool): 是否适合大额交易
        """
        self.name = name
        self.is_cash = is_cash  # 是否是现金兑换
        self.fee_structure = fee_structure  # 手续费计算结构
        self.processing_time = processing_time  # 办理时长（单位：工作日）
        self.convenience = convenience  # 换钱的方便程度（1-5）
        self.international_compatibility = international_compatibility  # 国际兼容性（1-5）
        self.is_suitable_for_large_transactions = is_suitable_for_large_transactions  # 是否适合大额交易

# 创建策略数据库（只包含0，2，5，6这四个方法）
strategies = []

# 现金兑换策略（换纸币）
# 策略0：银行兑换
strategies.append(CurrencyExchangeStrategy(
    "银行兑换", 
    is_cash=True, 
    fee_structure=FeeStructure("percentage", 0.01),  # 1%手续费
    processing_time=3,  # 办理时长：3个工作日
    convenience=4,  # 比较方便
    international_compatibility=5,  # 国际通用
    is_suitable_for_large_transactions=True
))

# 策略2：外币兑换点
strategies.append(CurrencyExchangeStrategy(
    "外币兑换点", 
    is_cash=True, 
    fee_structure=FeeStructure("complex", [38, 50]),  # 小于2000时收38元，其他金额收50元
    processing_time=1,  # 办理时长：1个工作日
    convenience=5,  # 方便
    international_compatibility=2,  # 不太适合某些国家
    is_suitable_for_large_transactions=False
))

# 策略5：国际ATM取款
strategies.append(CurrencyExchangeStrategy(
    "国际ATM取款", 
    is_cash=True, 
    fee_structure=FeeStructure("complex", [12, 12]),  # 固定手续费12元
    processing_time=0,  # 立即办理
    convenience=3,  # 方便，但有双重收费
    international_compatibility=5,  # 全球通用
    is_suitable_for_large_transactions=False
))

# 策略6：外币现金提现卡
strategies.append(CurrencyExchangeStrategy(
    "外币现金提现卡", 
    is_cash=True, 
    fee_structure=FeeStructure("percentage", 0.005),  # 0.5%的手续费
    processing_time=5,  # 办理时长：5个工作日
    convenience=3,  # 需要提前申请
    international_compatibility=5,  # 全球通用
    is_suitable_for_large_transactions=True
))

# 非现金兑换策略（电子支付）
# 策略7：微信支付跨境
strategies.append(CurrencyExchangeStrategy(
    "微信支付", 
    is_cash=False,  # 非现金支付
    fee_structure=FeeStructure("percentage", 0.012),  # 1.2%手续费
    processing_time=0,  # 立即支付
    convenience=5,  # 非常方便（无需现金携带）
    international_compatibility=3,  # 部分国家支持（主要在亚洲）
    is_suitable_for_large_transactions=False  # 单笔限额较低
))

# 策略8：支付宝跨境支付
strategies.append(CurrencyExchangeStrategy(
    "支付宝支付", 
    is_cash=False,  # 非现金支付
    fee_structure=FeeStructure("percentage", 0.015),  # 1.5%手续费
    processing_time=0,  # 立即支付
    convenience=5,  # 非常方便（无需现金携带）
    international_compatibility=3,  # 部分国家支持（主要在亚洲和部分欧洲）
    is_suitable_for_large_transactions=False  # 单笔限额较低
))

# 策略9：银行卡跨境支付
strategies.append(CurrencyExchangeStrategy(
    "银行卡跨境支付", 
    is_cash=False,  # 非现金支付
    fee_structure=FeeStructure("complex", [15, 30]),  # 小于2000收15元，其他金额收30元
    processing_time=0,  # 立即支付
    convenience=4,  # 比较方便（需要POS机或ATM）
    international_compatibility=5,  # 全球通用（Visa/MasterCard）
    is_suitable_for_large_transactions=True  # 支持大额交易
))

# 策略10：PayPal跨境支付
strategies.append(CurrencyExchangeStrategy(
    "PayPal跨境支付", 
    is_cash=False,  # 非现金支付
    fee_structure=FeeStructure("percentage", 0.044),  # 4.4%手续费（包含汇率差）
    processing_time=0,  # 立即支付
    convenience=5,  # 非常方便（在线支付）
    international_compatibility=5,  # 全球通用（200多个国家）
    is_suitable_for_large_transactions=True  # 支持大额交易
))

# 将策略数据转换为DataFrame
data = {
    "策略名": [s.name for s in strategies],
    "是否是纸币兑换": [s.is_cash for s in strategies],
    "手续费计算方式": [s.fee_structure.fee_type for s in strategies],
    "手续费计算值": [s.fee_structure.fee_value for s in strategies],
    "办理时长（工作日）": [s.processing_time for s in strategies],
    "换钱方便程度": [s.convenience for s in strategies],
    "目标国际使用便利程度": [s.international_compatibility for s in strategies],
    "适合大额交易": [s.is_suitable_for_large_transactions for s in strategies],
}

def getstrategys():
    """
    获取所有货币兑换策略
    
    返回:
    list: 包含所有CurrencyExchangeStrategy对象的列表
    """
    return strategies
def usestrategys(name):
    """
    根据策略名称获取特定的货币兑换策略
    参数:
    name (str): 策略名称
    返回:
    CurrencyExchangeStrategy: 对应名称的策略对象，如果不存在则返回None
    """
    for strategy in strategies:
        if strategy.name == name:
            return strategy
    return None

# 创建DataFrame对象用于数据展示
df = pd.DataFrame(data)

def get_dataframe():
    """
    获取策略数据的DataFrame格式
    
    返回:
    pd.DataFrame: 包含所有策略信息的DataFrame对象
    
    用法示例:
    import ExchangeStrategy
    df = ExchangeStrategy.get_dataframe()
    print(df)
    """
    return df

def print_strategies_summary():
    """
    打印策略摘要信息
    
    用法示例:
    import ExchangeStrategy
    ExchangeStrategy.print_strategies_summary()
    """
    print("=== 货币兑换策略数据库 ===")
    print(df)
    print()
    
    # 示例：计算某种兑换方式的手续费
    print("=== 手续费计算示例（兑换金额：1000元）===")
    amount = 1000  # 输入的金额
    for strategy in strategies:
        fee = strategy.fee_structure.calculate_fee(amount)
        print(f"{strategy.name} 手续费为：{fee} CNY")

# 如果直接运行此文件，则显示策略信息
if __name__ == "__main__":
    print_strategies_summary()
    
    print("\n=== 使用说明 ===")
    print("在main.py中调用本模块的方法：")
    print("1. import ExchangeStrategy")
    print("2. strategies = ExchangeStrategy.getstrategys()  # 获取所有策略")
    print("3. strategy = ExchangeStrategy.usestrategys('银行兑换')  # 获取特定策略")
    print("4. fee = strategy.fee_structure.calculate_fee(1000)  # 计算手续费")
    print("5. 直接访问: ExchangeStrategy.strategies  # 访问策略列表")
    print("6. df = ExchangeStrategy.get_dataframe()  # 获取DataFrame数据")