import pandas as pd

def convert_myr_to_csv():
    """
    将myr.txt文件转换为CSV格式，只保留日期和现汇卖出价两列
    """
    # 读取原始文件
    input_file = 'myr.txt'
    output_file = 'myr.csv'
    
    try:
        # 读取制表符分隔的文件
        df = pd.read_csv(input_file, sep='\t', encoding='utf-8')
        
        # 只保留日期和现汇卖出价两列
        df_filtered = df[['日期', '现钞卖出价']].copy()
        
        # 重命名列名为英文（可选）
        df_filtered.columns = ['Date', 'Exchange_Rate']
        
        # 保存为CSV文件
        df_filtered.to_csv(output_file, index=False, encoding='utf-8')
        
        print(f"转换完成！")
        print(f"输入文件: {input_file}")
        print(f"输出文件: {output_file}")
        print(f"总共处理了 {len(df_filtered)} 条记录")
        print(f"\n前5行数据预览:")
        print(df_filtered.head())
        
    except Exception as e:
        print(f"转换过程中出现错误: {e}")

if __name__ == "__main__":
    convert_myr_to_csv()
