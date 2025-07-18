# TULPARSADA Captive Portal (Firebase Sürümü)

Bu proje, TULPARSADA ağına bağlanan kullanıcıların malzeme taleplerini Firebase Authentication ile giriş yaparak ve Firestore veritabanına kaydederek yönetir.

## Özellikler
- Kullanıcılar Firebase Authentication ile giriş yapar.
- Malzeme talepleri Firestore'daki `malzemeKayitlari` koleksiyonuna kaydedilir.
- Kullanıcıya ait bilgiler (isim, soyisim, kurum) Firestore'daki `users_info` koleksiyonundan otomatik çekilir.
- Her kullanıcı sadece kendi bildirimlerini görebilir.
- Konum bilgisi otomatik eklenir (kullanıcı izin verirse).

## Kurulum

### 1. Gerekli Paketler
```bash
npm install
npm install firebase
```

### 2. Firebase Ayarları
- `src/services/firebase.js` dosyasındaki `firebaseConfig` alanını kendi Firebase projenize göre güncelleyin (veya mevcut config ile devam edin).
- Firestore'da iki koleksiyon oluşturun:
  - `users_info`: Kullanıcı bilgileri (her dokümanın ID'si, kullanıcının Firebase UID'si olmalı)
  - `malzemeKayitlari`: Malzeme talepleri

#### users_info Örneği
Her kullanıcı için bir doküman ekleyin:
```
users_info/{uid}:
  firstName: "Asude"
  lastName: "Demir"
  organization: "AFAD"
  email: "asude@tulparsada.com"
```

#### malzemeKayitlari Örneği
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

### 3. Uygulamayı Çalıştırma
```bash
npm run dev
```

### 4. Giriş ve Kullanım
- Kullanıcılar Firebase Authentication ile giriş yapar.
- Malzeme talebi formunu doldurup gönderir.
- Sadece kendi bildirimlerini görebilirler.

## Notlar
- Tüm veri işlemleri Firebase ile yapılır.
- Firestore güvenlik kurallarınızı test ortamında açık bırakabilirsiniz, gerçek ortamda mutlaka güvenli hale getirin.