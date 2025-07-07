from flask import Flask, request, jsonify, send_from_directory
import threading
import asyncio
import websockets
import sqlite3
import json
import hashlib
import os
from flask_cors import CORS

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)  # React uygulamasından gelen isteklere izin ver
clients = set()

def init_db():
    conn = sqlite3.connect('tulparsada.db')
    cursor = conn.cursor()
    
    # Material requests tablosu
    cursor.execute('''CREATE TABLE IF NOT EXISTS material_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        company TEXT,
        material TEXT,
        amount INTEGER,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Kullanıcılar tablosu
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        company TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    
    conn.commit()
    conn.close()

init_db()

# Login API endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Şifreyi hash'le
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    conn = sqlite3.connect('tulparsada.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, company FROM users WHERE email = ? AND password = ?', 
                  (email, hashed_password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            "success": True,
            "user": {
                "id": user[0],
                "email": email,
                "company": user[1]
            }
        })
    else:
        return jsonify({
            "success": False,
            "error": "Geçersiz e-posta veya şifre"
        }), 401

# Material request gönderme API
@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.json
    conn = sqlite3.connect('tulparsada.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO material_requests (name, company, material, amount, location)
        VALUES (?, ?, ?, ?, ?)
    ''', (data.get('name'), data.get('company'), data.get('material'), data.get('amount'), data.get('location')))
    conn.commit()
    conn.close()

    asyncio.run(notify_clients(data))
    return jsonify({"status": "success"})

# Tüm verileri getiren API
@app.route('/api/data', methods=['GET'])
def get_all_data():
    conn = sqlite3.connect('tulparsada.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM material_requests ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    
    data = []
    for row in rows:
        data.append({
            'id': row[0],
            'name': row[1],
            'company': row[2],
            'material': row[3],
            'amount': row[4],
            'location': row[5],
            'created_at': row[6]
        })
    
    return jsonify(data)

# Test kullanıcısı ekleme endpoint'i (sadece geliştirme için)
@app.route('/api/init-test-user', methods=['POST'])
def init_test_user():
    conn = sqlite3.connect('tulparsada.db')
    cursor = conn.cursor()
    
    # Test kullanıcısı ekle
    email = "test@tulparsada.com"
    password = "123456"
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        cursor.execute('INSERT INTO users (email, password, company) VALUES (?, ?, ?)', 
                      (email, hashed_password, "Tulparsada Test"))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Test kullanıcısı oluşturuldu"})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"success": False, "message": "Kullanıcı zaten mevcut"})

async def notify_clients(data):
    if clients:
        message = json.dumps(data)
        await asyncio.gather(*[client.send(message) for client in clients], return_exceptions=True)

async def ws_handler(websocket, path):
    clients.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except:
        pass
    finally:
        clients.remove(websocket)

def start_ws_server():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    start_server = websockets.serve(ws_handler, "0.0.0.0", 8765)
    loop.run_until_complete(start_server)
    loop.run_forever()

# Ana sayfa route'u - React uygulamasını serve et
@app.route('/')
def serve_react():
    return send_from_directory('dist', 'index.html')

# Tüm diğer route'lar için React router'ı handle et
@app.route('/<path:path>')
def serve_react_routes(path):
    return send_from_directory('dist', 'index.html')

if __name__ == '__main__':
    t = threading.Thread(target=start_ws_server)
    t.daemon = True
    t.start()
    app.run(host='0.0.0.0', port=5000, debug=False) 