from flask import Flask, request, jsonify, send_from_directory
import threading
import asyncio
import websockets
import json
import os
import logging
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

# Flask uygulaması başlatılıyor
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Firebase başlatma
clients = set()
try:
    if os.path.exists('firebase-key.json'):
        cred = credentials.Certificate('firebase-key.json')
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
    db = firestore.client()
    print("✅ Firebase başarıyla başlatıldı")
except Exception as e:
    print(f"⚠️ Firebase başlatılamadı: {e}")
    db = None

# Malzeme form verisini kaydeden API
@app.route('/api/submit', methods=['POST'])
def submit():
    if not db:
        return jsonify({"status": "error", "message": "Firebase bağlantısı yok"}), 500
    try:
        data = request.json
        doc_ref = db.collection('malzemeKayitlari').add({
            'firstName': data.get('firstName', ''),
            'lastName': data.get('lastName', ''),
            'latitude': data.get('latitude', ''),
            'longitude': data.get('longitude', ''),
            'materialName': data.get('materialName', ''),
            'organization': data.get('organization', ''),
            'quantity': data.get('quantity', 0),
            'timestamp': firestore.SERVER_TIMESTAMP,
            'userId': data.get('userId', '')
        })
        asyncio.run(notify_clients(data))
        return jsonify({"status": "success", "id": doc_ref[1].id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Tüm kayıtları listeleyen API
@app.route('/api/data', methods=['GET'])
def get_all_data():
    if not db:
        return jsonify({"status": "error", "message": "Firebase bağlantısı yok"}), 500
    try:
        docs = db.collection('malzemeKayitlari').order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
        data = [{**doc.to_dict(), 'id': doc.id} for doc in docs]
        return jsonify(data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Belirli bir kullanıcıyı getiren API
@app.route('/api/user-info/<user_id>', methods=['GET'])
def get_user_info(user_id):
    if not db:
        return jsonify({"status": "error", "message": "Firebase bağlantısı yok"}), 500
    try:
        doc = db.collection('users_info').document(user_id).get()
        if doc.exists:
            return jsonify(doc.to_dict())
        return jsonify({"status": "error", "message": "Kullanıcı bulunamadı"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# WebSocket bağlantı bildirimi
async def notify_clients(data):
    if clients:
        message = json.dumps(data)
        await asyncio.gather(
            *(client.send(message) for client in clients),
            return_exceptions=True
        )

# WebSocket bağlantı yöneticisi
async def ws_handler(websocket, path):
    clients.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        logging.warning(f"WebSocket bağlantı hatası: {e}")
    finally:
        clients.discard(websocket)

# WebSocket sunucusunu başlat
def start_ws_server():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    start_server = websockets.serve(ws_handler, "0.0.0.0", 8765)
    loop.run_until_complete(start_server)
    loop.run_forever()

# Ana sayfa route'u
@app.route('/')
def serve_react_index():
    return send_from_directory(app.static_folder, 'index.html')

# Static dosya ve fallback route
@app.route('/<path:path>')
def serve_static_or_react(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Uygulama başlangıcı
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    threading.Thread(target=start_ws_server, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=False)
