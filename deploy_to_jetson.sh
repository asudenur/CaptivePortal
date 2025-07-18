#!/bin/bash

# Jetson'a Captive Portal Deploy Script

echo "🚀 Captive Portal Jetson'a Deploy Ediliyor..."

# Proje dizinine git
cd /opt/captive-portal

# React uygulamasını build et
echo "📦 React uygulaması build ediliyor..."
npm install
npm run build

# Python virtual environment oluştur
echo "🐍 Python virtual environment oluşturuluyor..."
python3 -m venv venv
source venv/bin/activate

# Python paketlerini kur
echo "📦 Python paketleri kuruluyor..."
pip install flask flask-cors websockets firebase-admin

# nginx konfigürasyonunu kopyala
echo "🌐 nginx konfigürasyonu ayarlanıyor..."
sudo cp nginx_config.conf /etc/nginx/sites-available/captive-portal
sudo ln -sf /etc/nginx/sites-available/captive-portal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# nginx'i yeniden başlat
sudo systemctl restart nginx

# Systemd service'i kur
echo "⚙️ Systemd service kuruluyor..."
sudo cp captive-portal.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable captive-portal.service
sudo systemctl start captive-portal.service

# DNS hijacking için iptables kuralları
echo "🛡️ DNS hijacking kuralları ekleniyor..."
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.4.1:80
sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j DNAT --to-destination 192.168.4.1:80

# iptables kurallarını kaydet
sudo iptables-save | sudo tee /etc/iptables/rules.v4

echo "✅ Deploy tamamlandı!"
echo ""
echo "📋 Kontrol edilecekler:"
echo "1. sudo systemctl status captive-portal.service"
echo "2. sudo systemctl status nginx"
echo "3. curl http://192.168.4.1"
echo "4. sudo iptables -L -t nat" 