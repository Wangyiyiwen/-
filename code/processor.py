import datetime
import ExchangeStrategy

def solverForBankExchange(due_date, user_preferences, money):
    """
    处理银行兑换的逻辑。
    """
    # 这里可以添加银行兑换的具体逻辑
    print(f"处理银行兑换，截止日期: {due_date}, 用户偏好: {user_preferences}")
    strategy = ExchangeStrategy.usestrategys("银行兑换")
    # TODO：添加返回的格式讨论

def solverForWeChatPay(due_date, user_preferences, money):
    """
    处理微信支付兑换的逻辑。
    """
    # 这里可以添加微信支付兑换的具体逻辑
    print(f"处理微信支付兑换，截止日期: {due_date}, 用户偏好: {user_preferences}")
    strategy = ExchangeStrategy.usestrategys("微信支付")

def solverForAlipay(due_date, user_preferences, money):
    """
    处理支付宝兑换的逻辑。
    """
    # 这里可以添加支付宝兑换的具体逻辑
    print(f"处理支付宝兑换，截止日期: {due_date}, 用户偏好: {user_preferences}")
    strategy = ExchangeStrategy.usestrategys("支付宝支付")
