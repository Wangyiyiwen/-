#!/usr/bin/env python3
import os
from transformers import pipeline

# Ensure TensorFlow is not used
os.environ["TRANSFORMERS_NO_TF"] = "1"

print("Loading FinBERT model...")
scorer = pipeline("text-classification", model="ProsusAI/finbert")

test_text = "Stocks rallied and the British pound gained."
print(f"Test text: {test_text}")

print("\n--- 测试 return_all_scores=False (默认) ---")
result1 = scorer(test_text)
print(f"Result: {result1}")

print("\n--- 测试 return_all_scores=True ---")
result2 = scorer(test_text, return_all_scores=True)
print(f"Result: {result2}")

print("\n--- 数据结构分析 ---")
print(f"result2 type: {type(result2)}")
print(f"result2[0] type: {type(result2[0])}")
if isinstance(result2[0], list):
    print(f"result2[0] 内容: {result2[0]}")
    for item in result2[0]:
        print(f"  - {item}")
