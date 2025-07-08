import ExchangeStrategy

def test_new_strategies():
    """测试新添加的支付策略"""
    print("=== 测试新添加的支付策略 ===")
    
    # 获取所有策略
    strategies = ExchangeStrategy.getstrategys()
    
    print(f"总共有 {len(strategies)} 种兑换策略：")
    for i, strategy in enumerate(strategies):
        cash_type = "现金兑换" if strategy.is_cash else "电子支付"
        print(f"{i+1}. {strategy.name} ({cash_type})")
    
    print("\n=== 计算不同金额的手续费 ===")
    test_amounts = [500, 2000, 5000, 10000]
    
    for amount in test_amounts:
        print(f"\n兑换金额：{amount} 元")
        print("-" * 50)
        
        for strategy in strategies:
            fee = strategy.fee_structure.calculate_fee(amount)
            fee_rate = (fee / amount) * 100 if amount > 0 else 0
            cash_type = "现金" if strategy.is_cash else "电子"
            
            print(f"{strategy.name:15} | {cash_type:4} | 手续费: {fee:8.2f}元 ({fee_rate:.2f}%)")
    
    print("\n=== 按支付方式分类 ===")
    cash_strategies = [s for s in strategies if s.is_cash]
    digital_strategies = [s for s in strategies if not s.is_cash]
    
    print(f"\n现金兑换策略 ({len(cash_strategies)}种):")
    for strategy in cash_strategies:
        print(f"  - {strategy.name}")
        print(f"    办理时长: {strategy.processing_time}个工作日")
        print(f"    方便程度: {strategy.convenience}/5")
        print(f"    国际兼容性: {strategy.international_compatibility}/5")
        print(f"    适合大额交易: {'是' if strategy.is_suitable_for_large_transactions else '否'}")
        print()
    
    print(f"电子支付策略 ({len(digital_strategies)}种):")
    for strategy in digital_strategies:
        print(f"  - {strategy.name}")
        print(f"    办理时长: {strategy.processing_time}个工作日")
        print(f"    方便程度: {strategy.convenience}/5")
        print(f"    国际兼容性: {strategy.international_compatibility}/5")
        print(f"    适合大额交易: {'是' if strategy.is_suitable_for_large_transactions else '否'}")
        print()

if __name__ == "__main__":
    test_new_strategies()
