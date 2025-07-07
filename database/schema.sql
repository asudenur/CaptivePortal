-- TULPARSADA Captive Portal Veritabanı Şeması

-- Kullanıcılar tablosu (Giriş yapma için gerekli)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    organization TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Malzeme kayıtları tablosu (Flask tarafından kullanılır)
CREATE TABLE IF NOT EXISTS material_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    company TEXT,
    material TEXT,
    amount INTEGER,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_material_requests_created_at ON material_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); 