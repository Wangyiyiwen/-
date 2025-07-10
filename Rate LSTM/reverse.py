import pandas as pd

def reverse_csv_file(input_file, output_file):
    """
    反转CSV文件的行顺序
    
    参数:
    input_file: 输入CSV文件的路径
    output_file: 输出CSV文件的路径
    """
    try:
        # 读取CSV文件
        df = pd.read_csv(input_file)
        
        # 反转行顺序
        df_reversed = df.iloc[::-1]
        
        # 重置索引
        df_reversed = df_reversed.reset_index(drop=True)
        
        # 保存到新文件
        df_reversed.to_csv(output_file, index=False)
        
        print(f"成功将 {input_file} 反转并保存为 {output_file}")
        print(f"原始文件行数: {len(df)}")
        print(f"反转后文件行数: {len(df_reversed)}")
        
    except Exception as e:
        print(f"处理文件时出错: {e}")

# 使用示例
if __name__ == "__main__":
    # 假设要反转的文件名为 myr.csv
    input_file = "CNY_SGD_to_exchange_rate.csv"
    output_file = "myr_reversed.csv"
    
    reverse_csv_file(input_file, output_file)