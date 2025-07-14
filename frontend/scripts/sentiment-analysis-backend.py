import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# Ensure TensorFlow is not used
os.environ["TRANSFORMERS_NO_TF"] = "1"

app = Flask(__name__)
CORS(app) # Enable CORS for all origins

# Load models globally to avoid reloading on each request
try:
    Scorer = pipeline("text-classification", model="ProsusAI/finbert")
    Summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    print("Models loaded successfully: FinBERT and BART-large-cnn")
except Exception as e:
    print(f"Error loading models: {e}")
    Scorer = None
    Summarizer = None

@app.route('/score', methods=['POST'])
def score_text():
    if Scorer is None or Summarizer is None:
        return jsonify({"error": "AI models not loaded. Please check server logs for details."}), 500

    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Summarize if text is too long
        summary = text
        if len(text) > 512: # Max input length for FinBERT is typically 512 tokens
            # Adjust max_length and min_length for summarizer based on typical news article length
            # and desired summary length. Max_length for BART-large-cnn is 1024 tokens.
            # We want a summary that FinBERT can handle, so aiming for < 512 tokens.
            summary_output = Summarizer(text, max_length=200, min_length=50, do_sample=False)
            summary = summary_output[0]['summary_text']
            print(f"Original length: {len(text)}, Summarized length: {len(summary)}")
            print(f"Summary: {summary[:100]}...") # Print first 100 chars of summary

        # Score the summary
        ret = Scorer(summary)
        print(f"Scoring result: {ret}")

        # FinBERT output format: [{'label': 'positive', 'score': 0.999}]
        # Map labels to a numerical sentiment score:
        # POSITIVE: 1, NEUTRAL: 0, NEGATIVE: -1
        sentiment_label = ret[0]['label']
        sentiment_score = ret[0]['score']

        numerical_sentiment = 0
        if sentiment_label.lower() == 'positive':
            numerical_sentiment = sentiment_score
        elif sentiment_label.lower() == 'negative':
            numerical_sentiment = -sentiment_score
        # For neutral, it's already 0 or close to 0 if score is low

        return jsonify({
            "sentiment": sentiment_label,  # Keep label format for frontend
            "score": numerical_sentiment,  # Numerical score (-1 to 1)
            "confidence": sentiment_score,  # Raw confidence score
            "label": sentiment_label,      # Backward compatibility
            "raw_score": sentiment_score   # Backward compatibility
        })
    except Exception as e:
        print(f"Error processing text: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "models_loaded": Scorer is not None and Summarizer is not None}), 200

if __name__ == '__main__':
    # Use 0.0.0.0 to make it accessible from outside the container/localhost
    app.run(host='0.0.0.0', port=5000, debug=False) # Set debug=False for production
