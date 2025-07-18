# 🔥 Firebase Kurulum Rehberi

Bu rehber, Jetson'da Firebase'i çalıştırmak için gerekli adımları açıklar.

## 📋 Firebase Kurulumu

### 1. Firebase Service Account Key Oluşturma

1. **Firebase Console'a git**: https://console.firebase.google.com/
2. **Projenizi seçin**
3. **Project Settings** > **Service accounts**
4. **Generate new private key** butonuna tıklayın
5. **firebase-key.json** dosyasını indirin

### 2. Jetson'a Firebase Key Kopyalama

```bash
# Firebase key dosyasını Jetson'a kopyala
scp firebase-key.json jetson@JETSON_IP:/opt/captive-portal/
```

### 3. Environment Variables (Alternatif)

Firebase key dosyası yoksa, environment variables kullanabilirsiniz:

```bash
# Jetson'da environment variables ayarla
export GOOGLE_APPLICATION_CREDENTIALS="/opt/captive-portal/firebase-key.json"
export FIREBASE_PROJECT_ID="your-project-id"
```

### 4. Firebase Firestore Kuralları

Firestore'da güvenlik kurallarını ayarlayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerini okuyabilir
    match /malzemeKayitlari/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Kullanıcı bilgileri
    match /users_info/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Firestore Koleksiyonları

#### users_info Koleksiyonu
Her kullanıcı için bir doküman ekleyin:
```
users_info/{uid}:
  firstName: "Asude"
  lastName: "Demir"
  organization: "AFAD"
  email: "asude@tulparsada.com"
```

#### malzemeKayitlari Koleksiyonu
Kayıtlar otomatik eklenir:
```
malzemeKayitlari/{docId}:
  firstName: "Asude"
  lastName: "Demir"
  latitude: 38.0272
  longitude: 32.5107
  materialName: "sargı bezi"
  organization: "AFAD"
  quantity: 5
  timestamp: <Firestore Timestamp>
  userId: "uid"
```

## 🔍 Test Etme

### Firebase Bağlantısını Test Et

```bash
# Jetson'da test et
cd /opt/captive-portal
python3 -c "
import firebase_admin
from firebase_admin import firestore
firebase_admin.initialize_app()
db = firestore.client()
print('✅ Firebase bağlantısı başarılı!')
"
```

### Portal Test Et

```bash
# Portal'ı test et
curl http://192.168.4.1

# API'yi test et
curl -X POST http://192.168.4.1/api/submit \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","materialName":"test","quantity":1}'
```

## 🛠️ Sorun Giderme

### Firebase Bağlantı Hatası

```bash
# Firebase key dosyasını kontrol et
ls -la /opt/captive-portal/firebase-key.json

# Environment variables kontrol et
echo $GOOGLE_APPLICATION_CREDENTIALS

# Firebase log'larını kontrol et
sudo journalctl -u captive-portal.service -f
```

### Firestore Kuralları

Firestore kurallarını test ortamında açık bırakabilirsiniz:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Not**: Bu kurallar sadece test için kullanın, production'da güvenli kurallar kullanın.

## 📞 Destek

Sorun yaşarsanız:
1. Firebase key dosyasının doğru konumda olduğunu kontrol edin
2. Environment variables'ları kontrol edin
3. Firestore kurallarını kontrol edin
4. Firebase Console'da proje ayarlarını kontrol edin 