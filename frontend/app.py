from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.json
    text = data.get('text', '')
    # 这里可以加你的业务逻辑，比如AI预测
    reply = text[::-1]  # 举例：字符串反转
    return jsonify({'result': reply})

if __name__ == '__main__':
    app.run(debug=True)
