# 🚀 Jetson Captive Portal Kurulum Rehberi

Bu rehber, React + Flask + Firebase tabanlı captive portal uygulamanızı Jetson Nano'da çalıştırmak için hazırlanmıştır.

## 📋 Gereksinimler

- Jetson Nano (Ubuntu 18.04)
- TP-Link CPE510 (AP modunda)
- Internet bağlantısı
- USB WiFi adapter (opsiyonel)
- Firebase projesi ve service account key

## 🔧 Adım Adım Kurulum

### Yöntem 1: Otomatik Transfer (Önerilen)

```bash
# Transfer script'ini çalıştırılabilir yap
chmod +x transfer_to_jetson.sh

# Transfer'i başlat
./transfer_to_jetson.sh
```

Bu script:
1. Jetson IP adresini sorar
2. Proje dosyalarını kopyalar
3. Firebase key dosyasını kopyalar (varsa)
4. Otomatik kurulum yapar

### Yöntem 2: Manuel Kurulum

#### 1. Temel Sistem Kurulumu

```bash
# Script'i çalıştırılabilir yap
chmod +x jetson_setup.sh

# Temel kurulumu başlat
./jetson_setup.sh
```

#### 2. Network Konfigürasyonu

```bash
# Network script'ini çalıştır
chmod +x network_config.sh
./network_config.sh
```

**Önemli:** Script size hangi network interface'lerinin kullanılacağını soracak:
- `eth0` veya `wlan0`: Internet bağlantısı olan interface
- `wlan0` veya `usb0`: AP olacak interface

#### 3. Firebase Kurulumu

```bash
# Firebase key dosyasını kopyala
scp firebase-key.json jetson@JETSON_IP:/opt/captive-portal/

# veya environment variables ayarla
export GOOGLE_APPLICATION_CREDENTIALS="/opt/captive-portal/firebase-key.json"
```

#### 4. Proje Dosyalarını Kopyala

```bash
# Proje dosyalarını Jetson'a kopyala
sudo cp -r . /opt/captive-portal/
sudo chown -R jetson:jetson /opt/captive-portal/
```

#### 5. Deploy Script'ini Çalıştır

```bash
# Deploy script'ini çalıştırılabilir yap
chmod +x deploy_to_jetson.sh

# Deploy'u başlat
./deploy_to_jetson.sh
```

## 🌐 Network Yapılandırması

### Jetson Network Ayarları:
- **WAN Interface**: Internet bağlantısı (eth0/wlan0)
- **LAN Interface**: AP interface (wlan0/usb0)
- **Gateway IP**: 192.168.4.1
- **DHCP Range**: 192.168.4.2 - 192.168.4.20

### TP-Link CPE510 Ayarları:
1. CPE510'u AP moduna al
2. SSID ayarla (örn: "CaptivePortal")
3. IP adresini 192.168.4.1 yap
4. Gateway'i 192.168.4.1 yap

## 🔥 Firebase Kurulumu

### 1. Firebase Service Account Key
1. Firebase Console'a git: https://console.firebase.google.com/
2. Projenizi seçin
3. Project Settings > Service accounts
4. Generate new private key butonuna tıklayın
5. firebase-key.json dosyasını indirin

### 2. Jetson'a Kopyalama
```bash
scp firebase-key.json jetson@JETSON_IP:/opt/captive-portal/
```

### 3. Firestore Kuralları
Firestore'da güvenlik kurallarını ayarlayın:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /malzemeKayitlari/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /users_info/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔍 Test ve Kontrol

### Servis Durumları:
```bash
# Captive portal servisi
sudo systemctl status captive-portal.service

# nginx servisi
sudo systemctl status nginx

# dnsmasq servisi
sudo systemctl status dnsmasq
```

### Firebase Test:
```bash
# Firebase bağlantısını test et
cd /opt/captive-portal
python3 -c "
import firebase_admin
from firebase_admin import firestore
firebase_admin.initialize_app()
db = firestore.client()
print('✅ Firebase bağlantısı başarılı!')
"
```

### Network Testleri:
```bash
# Portal erişimi test et
curl http://192.168.4.1

# iptables kurallarını kontrol et
sudo iptables -L -t nat

# DHCP client'ları listele
sudo cat /var/lib/misc/dnsmasq.leases
```

## 📱 Cihaz Bağlantısı

1. **Telefon/Tablet** TP-Link CPE510'a bağlan
2. **Otomatik olarak** captive portal sayfası açılacak
3. **Kullanıcılar** Firebase Authentication ile giriş yapar
4. **Malzeme talepleri** Firestore'a kaydedilir
5. **Admin paneli** http://192.168.4.1/admin adresinden erişilebilir

## 🛠️ Sorun Giderme

### Portal Açılmıyor:
```bash
# nginx log'larını kontrol et
sudo tail -f /var/log/nginx/error.log

# Flask log'larını kontrol et
sudo journalctl -u captive-portal.service -f
```

### Firebase Bağlantı Hatası:
```bash
# Firebase key dosyasını kontrol et
ls -la /opt/captive-portal/firebase-key.json

# Environment variables kontrol et
echo $GOOGLE_APPLICATION_CREDENTIALS

# Firebase log'larını kontrol et
sudo journalctl -u captive-portal.service -f
```

### Internet Bağlantısı Yok:
```bash
# IP forwarding kontrol et
cat /proc/sys/net/ipv4/ip_forward

# iptables kurallarını kontrol et
sudo iptables -L -t nat
```

### DHCP Çalışmıyor:
```bash
# dnsmasq log'larını kontrol et
sudo tail -f /var/log/dnsmasq.log

# DHCP lease'leri kontrol et
sudo cat /var/lib/misc/dnsmasq.leases
```

## 🔄 Güncelleme

Yeni kod değişiklikleri için:

```bash
# Proje dosyalarını güncelle
sudo cp -r . /opt/captive-portal/

# React uygulamasını yeniden build et
cd /opt/captive-portal
npm run build

# Servisi yeniden başlat
sudo systemctl restart captive-portal.service
```

## 📞 Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin
2. Network ayarlarını doğrulayın
3. Firebase bağlantısını kontrol edin
4. Servis durumlarını kontrol edin
5. iptables kurallarını kontrol edin

---

**Not:** Bu kurulum Jetson Nano'da Ubuntu 18.04 ile test edilmiştir. 