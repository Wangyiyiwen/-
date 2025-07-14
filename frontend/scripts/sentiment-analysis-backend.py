import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Ensure TensorFlow is not used
os.environ["TRANSFORMERS_NO_TF"] = "1"

app = Flask(__name__)
CORS(app) # Enable CORS for all origins

# Load models globally to avoid reloading on each request
try:
    logger.info("开始加载AI模型...")
    Scorer = pipeline("text-classification", model="ProsusAI/finbert")
    Summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    logger.info("模型加载成功: FinBERT and BART-large-cnn")
except Exception as e:
    logger.error(f"模型加载失败: {e}")
    Scorer = None
    Summarizer = None

@app.route('/score', methods=['POST'])
def score_text():
    if Scorer is None or Summarizer is None:
        logger.error("AI模型未加载，无法处理请求")
        return jsonify({"error": "AI models not loaded. Please check server logs for details."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        text = data.get('text')
        if not text:
            return jsonify({"error": "No text provided"}), 400

        logger.info(f"收到情感分析请求，文本长度: {len(text)}")

        # Summarize if text is too long
        summary = text
        if len(text) > 512: # Max input length for FinBERT is typically 512 tokens
            logger.info("文本过长，开始摘要处理...")
            # Adjust max_length and min_length for summarizer based on typical news article length
            # and desired summary length. Max_length for BART-large-cnn is 1024 tokens.
            # We want a summary that FinBERT can handle, so aiming for < 512 tokens.
            summary_output = Summarizer(text, max_length=200, min_length=50, do_sample=False)
            summary = summary_output[0]['summary_text']
            logger.info(f"摘要完成 - 原长度: {len(text)}, 摘要长度: {len(summary)}")

        # Score the summary
        logger.info("开始情感分析...")
        ret = Scorer(summary, return_all_scores=True)  # 返回所有分数
        logger.info(f"情感分析结果: {ret}")

        # FinBERT returns all 3 sentiment scores when return_all_scores=True
        # Format: [[{'label': 'positive', 'score': 0.898}, {'label': 'neutral', 'score': 0.067}, {'label': 'negative', 'score': 0.034}]]
        
        # 获取第一个（也是唯一的）结果
        all_scores = ret[0] if isinstance(ret[0], list) else ret
        
        # 解析所有情感分数
        sentiment_scores = {}
        main_sentiment = None
        main_score = 0
        
        # 提取所有情感分数并找到最高分
        for result in all_scores:
            label = result['label'].lower()
            score = result['score']
            sentiment_scores[label] = score
            
            if score > main_score:
                main_score = score
                main_sentiment = result['label']
        
        # 确保所有三个类别都存在
        positive_score = sentiment_scores.get('positive', 0.0)
        neutral_score = sentiment_scores.get('neutral', 0.0)
        negative_score = sentiment_scores.get('negative', 0.0)
        
        # 计算综合情感分数：positive - negative（范围 -1 到 1）
        overall_score = positive_score - negative_score

        return jsonify({
            "sentiment": main_sentiment,           # 主要情感标签
            "score": overall_score,               # 综合情感分数 (-1 到 1)
            "scores": {                           # 所有情感分数
                "positive": positive_score,
                "neutral": neutral_score,
                "negative": negative_score
            },
            "confidence": main_score,             # 主要情感的置信度
            "label": main_sentiment              # 向后兼容
        })
    except Exception as e:
        logger.error(f"处理文本时出错: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    models_loaded = Scorer is not None and Summarizer is not None
    status = "healthy" if models_loaded else "unhealthy"
    logger.info(f"健康检查 - 状态: {status}, 模型已加载: {models_loaded}")
    return jsonify({
        "status": status, 
        "models_loaded": models_loaded,
        "message": "情感分析服务运行正常" if models_loaded else "AI模型未加载"
    }), 200 if models_loaded else 503

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "service": "智能货币兑换策略系统 - 情感分析API",
        "version": "1.0.0",
        "endpoints": [
            {"path": "/score", "method": "POST", "description": "文本情感分析"},
            {"path": "/health", "method": "GET", "description": "健康检查"}
        ]
    })

if __name__ == '__main__':
    logger.info("启动情感分析服务...")
    # Use 0.0.0.0 to make it accessible from outside the container/localhost
    app.run(host='0.0.0.0', port=5000, debug=False) # Set debug=False for production
