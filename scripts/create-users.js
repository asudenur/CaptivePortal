const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Veritabanı bağlantısı
const db = new sqlite3.Database('./database/tulparsada.db');

// Önceden tanımlı kullanıcılar
const users = [
  {
    email: 'admin@tulparsada.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    organization: 'TULPARSADA'
  },
  {
    email: 'afad1@tulparsada.com',
    password: 'afad123',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    organization: 'AFAD'
  },
  {
    email: 'afad2@tulparsada.com',
    password: 'afad123',
    firstName: 'Fatma',
    lastName: 'Demir',
    organization: 'AFAD'
  },
  {
    email: 'kizilay1@tulparsada.com',
    password: 'kizilay123',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    organization: 'Kızılay'
  },
  {
    email: 'kizilay2@tulparsada.com',
    password: 'kizilay123',
    firstName: 'Ayşe',
    lastName: 'Özkan',
    organization: 'Kızılay'
  },
  {
    email: 'umke1@tulparsada.com',
    password: 'umke123',
    firstName: 'Ali',
    lastName: 'Çelik',
    organization: 'UMKE'
  },
  {
    email: 'umke2@tulparsada.com',
    password: 'umke123',
    firstName: 'Zeynep',
    lastName: 'Arslan',
    organization: 'UMKE'
  }
];

async function createUsers() {
  console.log('🔄 Kullanıcılar oluşturuluyor...');
  
  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      db.run(
        'INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, organization) VALUES (?, ?, ?, ?, ?)',
        [user.email, hashedPassword, user.firstName, user.lastName, user.organization],
        function(err) {
          if (err) {
            console.error(`❌ ${user.email} oluşturma hatası:`, err);
          } else {
            if (this.changes > 0) {
              console.log(`✅ ${user.email} oluşturuldu`);
            } else {
              console.log(`ℹ️ ${user.email} zaten mevcut`);
            }
          }
        }
      );
    } catch (error) {
      console.error(`❌ ${user.email} hatası:`, error);
    }
  }
  
  // 3 saniye sonra kapat
  setTimeout(() => {
    console.log('\n📋 Kullanıcı Bilgileri:');
    console.log('========================');
    users.forEach(user => {
      console.log(`📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.firstName} ${user.lastName} | 🏢 ${user.organization}`);
    });
    console.log('\n✅ Tüm kullanıcılar hazır!');
    db.close();
  }, 3000);
}

createUsers(); 