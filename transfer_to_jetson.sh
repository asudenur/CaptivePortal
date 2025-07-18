#!/bin/bash

# Projeyi Jetson'a Transfer Script

echo "📤 Proje Jetson'a Transfer Ediliyor..."

# Jetson IP adresini al
read -p "Jetson'un IP adresini girin: " JETSON_IP
read -p "Jetson'daki kullanıcı adını girin (örn: jetson): " JETSON_USER

echo "🌐 Jetson'a bağlanılıyor: $JETSON_USER@$JETSON_IP"

# Proje dosyalarını Jetson'a kopyala (tüm proje)
echo "📁 Proje dosyaları kopyalanıyor..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./ $JETSON_USER@$JETSON_IP:/opt/captive-portal/

# Firebase key dosyasını kontrol et ve kopyala
if [ -f "firebase-key.json" ]; then
    echo "🔑 Firebase key dosyası kopyalanıyor..."
    scp firebase-key.json $JETSON_USER@$JETSON_IP:/opt/captive-portal/
else
    echo "⚠️ firebase-key.json dosyası bulunamadı. Firebase environment variables kullanılacak."
fi

# Jetson'da kurulum script'lerini çalıştır
echo "🚀 Jetson'da kurulum başlatılıyor..."
ssh $JETSON_USER@$JETSON_IP << 'EOF'
cd /opt/captive-portal

# Script'leri çalıştırılabilir yap
chmod +x jetson_setup.sh network_config.sh deploy_to_jetson.sh

# Temel kurulum
./jetson_setup.sh

# Network konfigürasyonu
./network_config.sh

# Deploy
./deploy_to_jetson.sh

echo "✅ Kurulum tamamlandı!"
EOF

echo "🎉 Transfer ve kurulum tamamlandı!"
echo ""
echo "📋 Test etmek için:"
echo "1. ssh $JETSON_USER@$JETSON_IP"
echo "2. curl http://192.168.4.1"
echo "3. sudo systemctl status captive-portal.service" 