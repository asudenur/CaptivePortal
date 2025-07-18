#!/bin/bash

# Jetson Captive Portal Setup Script
# Ubuntu 18.04 için

echo "🚀 Jetson Captive Portal Kurulumu Başlıyor..."

# Sistem güncellemesi
echo "📦 Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# Gerekli paketlerin kurulumu
echo "🔧 Gerekli paketler kuruluyor..."
sudo apt install -y python3 python3-pip python3-venv
sudo apt install -y nodejs npm
sudo apt install -y nginx
sudo apt install -y hostapd dnsmasq
sudo apt install -y iptables-persistent
sudo apt install -y git curl

# Node.js güncel versiyon kurulumu
echo "📦 Node.js güncel versiyon kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python paketleri
echo "🐍 Python paketleri kuruluyor..."
pip3 install flask flask-cors websockets firebase-admin

# Proje dizini oluşturma
echo "📁 Proje dizini oluşturuluyor..."
sudo mkdir -p /opt/captive-portal
sudo chown $USER:$USER /opt/captive-portal

echo "✅ Temel kurulum tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Proje dosyalarını /opt/captive-portal'a kopyala"
echo "2. React uygulamasını build et"
echo "3. Network konfigürasyonu yap"
echo "4. nginx ayarlarını yap"
echo "5. Systemd service oluştur" 