import ExchangeStrategy
import dateparser
import re
import processor
import NewsSentimentAnalyzer
from datetime import datetime, timedelta

#pip install vaderSentiment

def init():
    """
    初始化函数，用于加载或设置初始数据
    """
    # 这里可以添加初始化代码，例如加载配置文件或数据库连接等
    print("初始化货币兑换策略数据库...")

def get_user_preferences():
    """
    获取用户对不同策略属性的偏好分数
    """
    preferences = {}
    questions = {
        "processing_time": "办理时长（工作日）",
        "convenience": "换钱方便程度",
        "international_compatibility": "目标国际使用便利程度",
        "is_suitable_for_large_transactions": "适合大额交易",
        "price_sensitivity": "价格敏感程度",
        "is_cash": "是否支持纸币兑换",
    }

    print("\n--- 请对以下各项的重要性进行打分 (1-5分，5分最重要, 对于纸币则为0/1) ---")
    for key, question in questions.items():
        while True:
            try:
                score = int(input(f"{question}: "))
                if 1 <= score <= 5:
                    preferences[key] = score
                    break
                else:
                    print("请输入1到5之间的整数。")
            except ValueError:
                print("无效输入，请输入一个整数。")
    return preferences

def AnalyzeCommand():
    print("输入人民币数量")
    money = input()
    if not money.isdigit():
        print("请输入有效的人民币数量")
        return None, None
    user_preferences = get_user_preferences()
    print("\n--- 您的偏好分数 ---")
    print(user_preferences)

    print("请输入截止日期 (例:7-10)：")
    command = input()
    # 处理命令
    
    date = None
    # 首先尝试用正则表达式提取 M.D 或 M-D 格式的日期
    match = re.search(r'(\d{1,2}[.-]\d{1,2})', command)
    
    if match:
        date_str = match.group(1)
        # 将.替换为-，以帮助dateparser正确解析
        date = dateparser.parse(date_str.replace('.', '-'), settings={'PREFER_DATES_FROM': 'future'})
    else:
        # 如果正则匹配失败，尝试解析整个命令字符串，以处理“明天”等情况
        date = dateparser.parse(command, settings={'PREFER_DATES_FROM': 'future'})

    due_date = None
    if date:
        due_date = date
        print(f"需要在 {due_date.strftime('%Y-%m-%d')}之前完成换货币任务")
    else:
        print("无法识别命令中的日期")
    return due_date, user_preferences, money

def solve(due_date, user_preferences, money):
    """
    解决用户的货币兑换需求
    参数:
        due_date (datetime): 任务截止日期
        user_preferences (dict): 用户偏好分数
    """
    print(f"正在处理截止日期为 {due_date.strftime('%Y-%m-%d')} 的货币兑换任务...")
    # 这里可以添加具体的处理逻辑，例如选择合适的兑换策略等
    # 目前只是打印用户偏好分数
    print("用户偏好分数:", user_preferences)

    best_strategy = None
    best_score = float('-inf')
    strategies = ExchangeStrategy.getstrategys()
    for strategy in strategies:
        # 检查是否满足纸币兑换偏好
        if strategy.is_cash != (user_preferences.get("is_cash", 0) == 1):
            continue

        # 检查时间是否充足
        if due_date:
            estimated_completion_date = datetime.now() + timedelta(days=strategy.processing_time)
            if estimated_completion_date > due_date:
                print(f"策略 '{strategy.name}' 因时间不足（预计在 {estimated_completion_date.strftime('%Y-%m-%d')} 完成）而被跳过。")
                continue
        if strategy.is_suitable_for_large_transactions and not user_preferences.get("is_suitable_for_large_transactions", 0):
            print(f"策略 '{strategy.name}' 因不适合大额交易而被跳过。")
            continue
        if strategy.name == "银行兑换":
            res = processor.solverForBankExchange(due_date, user_preferences, money)
            # 找到最优秀解，和最优解比对
        if strategy.name == "微信支付":
            res = processor.solverForWeChatPay(due_date, user_preferences, money)
        #TODO: 添加其他策略的处理逻辑
    # 输出策略
    #TODO: 添加输出逻辑

def main():

    #情感分析接口
    #ret = NewsSentimentAnalyzer.score("The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today.The stock market crashed today. The stock market crashed today. The stock market crashed today. The stock market crashed today. The stock market crashed today.")
    #print (f"情感分析结果: {ret}")
    #return

    strategies = ExchangeStrategy.getstrategys()
    # print names of all strategies
    print("=== 货币兑换策略列表 ===")
    for strategy in strategies:
        print(f"- {strategy.name} (纸币兑换: {strategy.is_cash})")

    #TODO:将客户直接输入打分切换为model判断
    due_date, user_preferences, money = AnalyzeCommand()

    solve (due_date, user_preferences, money)
    

if __name__ == "__main__":
    main()

