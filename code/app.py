from flask import Flask, render_template, request, jsonify
import your_python_script  # 引入你的 Python 脚本
import NewsSentimentAnalyzer

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')  # 渲染前端页面

@app.route('/run_python', methods=['POST'])
def run_python():
    # 从前端获取数据
    data = request.json.get('input_data', '')
    
    # 调用 Python 程序或脚本进行处理
    #result = your_python_script.process(data)  # 假设 `process` 是你 Python 程序的处理函数
    result = NewsSentimentAnalyzer.score(data)
    result = result[0]['label'] + " " + str(result[0]['score'])
    return jsonify({'result': result})  # 将结果返回给前端

if __name__ == '__main__':
    app.run(debug=True)
