from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import contextlib
import traceback
import time
import threading
import signal

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 全局变量用于存储执行状态
execution_timeout = 30  # 30秒超时

class TimeoutException(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutException("代码执行超时")

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'message': 'Python后端运行正常',
        'timestamp': time.time()
    })

@app.route('/execute', methods=['POST'])
def execute_code():
    """执行Python代码"""
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': '请提供要执行的代码'}), 400
        
        code = data['code']
        if not isinstance(code, str):
            return jsonify({'error': '代码必须是字符串格式'}), 400
        
        # 限制代码长度
        if len(code) > 10000:
            return jsonify({'error': '代码长度不能超过10000字符'}), 400
        
        # 检查危险操作
        dangerous_keywords = [
            'import os', 'import subprocess', 'import shutil',
            'open(', 'file(', 'exec(', 'eval(',
            '__import__', 'compile(', 'globals()', 'locals()',
            'input(', 'raw_input('
        ]
        
        for keyword in dangerous_keywords:
            if keyword in code:
                return jsonify({
                    'error': f'出于安全考虑，不允许使用: {keyword}'
                }), 400
        
        # 捕获输出
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        
        try:
            # 设置超时
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(execution_timeout)
            
            # 重定向输出
            sys.stdout = stdout_capture
            sys.stderr = stderr_capture
            
            # 创建受限的执行环境
            safe_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'str': str,
                    'int': int,
                    'float': float,
                    'bool': bool,
                    'list': list,
                    'dict': dict,
                    'tuple': tuple,
                    'set': set,
                    'range': range,
                    'enumerate': enumerate,
                    'zip': zip,
                    'map': map,
                    'filter': filter,
                    'sum': sum,
                    'min': min,
                    'max': max,
                    'abs': abs,
                    'round': round,
                    'sorted': sorted,
                    'reversed': reversed,
                }
            }
            
            # 允许导入一些安全的模块
            allowed_modules = ['math', 'random', 'datetime', 'json', 're']
            for module in allowed_modules:
                try:
                    safe_globals[module] = __import__(module)
                except ImportError:
                    pass
            
            # 执行代码
            exec(code, safe_globals)
            
            # 取消超时
            signal.alarm(0)
            
            # 获取输出
            output = stdout_capture.getvalue()
            error_output = stderr_capture.getvalue()
            
            result = {
                'output': output,
                'error': error_output if error_output else None,
                'success': True
            }
            
            return jsonify(result)
            
        except TimeoutException:
            return jsonify({
                'error': '代码执行超时（超过30秒）',
                'success': False
            }), 400
            
        except Exception as e:
            error_msg = traceback.format_exc()
            return jsonify({
                'error': error_msg,
                'success': False
            }), 400
            
        finally:
            # 恢复输出
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            signal.alarm(0)  # 确保取消超时
            
    except Exception as e:
        return jsonify({
            'error': f'服务器错误: {str(e)}',
            'success': False
        }), 500

@app.route('/modules', methods=['GET'])
def list_modules():
    """列出可用的模块"""
    available_modules = []
    test_modules = ['math', 'random', 'datetime', 'json', 're', 'collections', 'itertools']
    
    for module in test_modules:
        try:
            __import__(module)
            available_modules.append(module)
        except ImportError:
            pass
    
    return jsonify({
        'modules': available_modules,
        'message': '可用的Python模块列表'
    })

if __name__ == '__main__':
    print("启动Python后端服务...")
    print("访问 http://localhost:5000/health 检查服务状态")
    print("按 Ctrl+C 停止服务")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
