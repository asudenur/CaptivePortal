# TULPARSADA Captive Portal

Bu proje, afet anında Wi-Fi üzerinden erişilen bir captive portal uygulamasıdır. Arama kurtarma ekiplerinin eksik malzeme ihtiyaçlarını bildirmelerini sağlar.

## Sistem Mimarisi

### Donanım Gereksinimleri
- **Access Point**: TPLink CPE510 (Jetson Nano'ya bağlı)
- **Client**: Ubiquiti LiteBeam M5
- **Server**: Jetson Nano (İHA üzerinde)

### Ağ Yapısı
- **SSID**: TULPARSADA
- **IP Range**: 192.168.1.100-200
- **Gateway**: 192.168.1.1
- **DNS**: 192.168.1.1 (DNS hijacking ile)

## Özellikler

- ✅ Kullanıcı girişi (JWT tabanlı)
- ✅ Eksik malzeme bildirimi
- ✅ Gerçek zamanlı malzeme talepleri görüntüleme
- ✅ Konum bilgisi ile birlikte kayıt
- ✅ Captive portal (DNS hijacking)
- ✅ Firebase olmadan çalışır (SQLite veritabanı)
- ✅ **Real-time veri izleme (WebSocket)**

## Teknolojiler

### Frontend
- React 19
- Material-UI
- React Router
- Vite

### Backend
- Node.js
- Express.js
- SQLite3
- JWT Authentication
- bcryptjs
- **WebSocket (ws)**

### Infrastructure
- dnsmasq (DNS hijacking)
- hostapd (WiFi Access Point)
- nginx (Reverse proxy)
- iptables (Port forwarding)

## Kurulum

### 1. Sistem Gereksinimleri
```bash
# Ubuntu/Debian tabanlı sistem (Jetson Nano)
sudo apt update
sudo apt install -y git nodejs npm
```

### 2. Proje Klonlama
```bash
git clone [repo-url]
cd captive-portal
```

### 3. Captive Portal Kurulumu
```bash
# Kurulum scriptini çalıştır
chmod +x scripts/setup-captive-portal.sh
sudo ./scripts/setup-captive-portal.sh
```

### 4. Development Kurulumu (Opsiyonel)
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..

# Development server başlat
npm run dev
```

## Kullanım

### Captive Portal Erişimi
1. **TULPARSADA** ağına bağlanın
2. Herhangi bir web sitesine gitmeye çalışın
3. Otomatik olarak captive portal açılacak
4. Giriş yapın ve malzeme talebi gönderin

### Manuel Erişim
- **URL**: http://192.168.1.1
- **Domain**: tulparsada.local

### Real-time Veri İzleme
- **URL**: http://192.168.1.1/monitor
- **Özellikler**:
  - Gerçek zamanlı veri akışı
  - İstatistikler (toplam talep, bugün, aktif kullanıcı)
  - Yeni kayıtlar için animasyon
  - Konum bilgisi ile harita linki

### API Endpoints
- `POST /api/register` - Kullanıcı kaydı
- `POST /api/login` - Kullanıcı girişi
- `POST /api/material-requests` - Malzeme talebi ekleme
- `GET /api/material-requests` - Tüm malzeme talepleri
- `GET /api/my-material-requests` - Kullanıcının talepleri
- `GET /api/websocket-status` - WebSocket durumu

## Real-time Veri Aktarımı

### WebSocket Bağlantısı
```javascript
// Başka bir cihazdan bağlanma
const ws = new WebSocket('ws://192.168.1.1:3001');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Yeni veri:', data);
};
```

### Veri Formatı
```json
{
  "type": "new_data",
  "data": {
    "id": 1,
    "material_name": "Enjektör",
    "quantity": 5,
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "organization": "AFAD",
    "latitude": 39.9334,
    "longitude": 32.8597,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## Deployment

### Yeni Versiyon Deploy Etme
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manuel Deploy
```bash
# Frontend build
npm run build

# Backend restart
sudo systemctl restart tulparsada-server

# Nginx restart
sudo systemctl restart nginx
```

## Veritabanı

### SQLite Şeması
```sql
-- Kullanıcılar
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    organization TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Malzeme talepleri
CREATE TABLE material_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    material_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Veritabanı Yönetimi
```bash
# Veritabanı dosyası
/var/www/tulparsada/database/tulparsada.db

# SQLite komut satırı
sqlite3 /var/www/tulparsada/database/tulparsada.db
```

## Güvenlik

### JWT Secret
- Production'da `.env` dosyasında `JWT_SECRET` değiştirin
- Güçlü bir secret key kullanın

### Network Security
- WiFi şifresi: `tulparsada123`
- WPA2 encryption
- MAC address filtering (opsiyonel)

### Rate Limiting
- 15 dakikada maksimum 100 istek
- IP bazlı kısıtlama

## Monitoring

### Log Dosyaları
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo journalctl -u tulparsada-server -f

# DNS logs
sudo tail -f /var/log/dnsmasq.log
```

### Service Durumu
```bash
# Tüm servislerin durumu
sudo systemctl status tulparsada-server
sudo systemctl status nginx
sudo systemctl status dnsmasq
sudo systemctl status hostapd
```

### WebSocket Bağlantıları
```bash
# Aktif WebSocket bağlantılarını görme
curl http://192.168.1.1/api/websocket-status
```

## Troubleshooting

### Captive Portal Çalışmıyor
1. DNS hijacking kontrolü:
   ```bash
   sudo systemctl status dnsmasq
   ```

2. iptables kuralları:
   ```bash
   sudo iptables -t nat -L
   ```

3. Nginx konfigürasyonu:
   ```bash
   sudo nginx -t
   ```

### WiFi Bağlantı Sorunu
1. hostapd durumu:
   ```bash
   sudo systemctl status hostapd
   ```

2. Interface ayarları:
   ```bash
   ip addr show wlan0
   ```

### Backend Server Sorunu
1. Log kontrolü:
   ```bash
   sudo journalctl -u tulparsada-server -n 50
   ```

2. Port kontrolü:
   ```bash
   netstat -tlnp | grep 3001
   ```

### WebSocket Bağlantı Sorunu
1. WebSocket port kontrolü:
   ```bash
   netstat -tlnp | grep 3001
   ```

2. Firewall kontrolü:
   ```bash
   sudo iptables -L | grep 3001
   ```

## Lisans

MIT License - TULPARSADA Team
