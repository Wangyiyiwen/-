import os
os.environ["TRANSFORMERS_NO_TF"] = "1"  # 保证不用 TensorFlow
from transformers import pipeline

Scorer = pipeline("text-classification", model="ProsusAI/finbert")
Summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def score(text):
    """
    使用 FinBERT 评分文本情感
    先概括， 再打分
    """
    lenth = len(text)
    if lenth > 60:
        summary = Summarizer(text, max_length=60, min_length=5, do_sample=False)
        summary = summary[0]['summary_text']
        print (f"概括结果: {summary}")
    else:
        summary = text
    ret = Scorer(summary)
    return ret

def example():
    article = """
    Stocks rallied today as the Federal Reserve signaled that interest rates would remain steady for the rest of the year.
    The S&P 500 closed at a new record high, driven by gains in technology and consumer discretionary shares.
    Investors responded positively to economic data showing steady job growth and easing inflation pressures.
    """
    print (score(article))
