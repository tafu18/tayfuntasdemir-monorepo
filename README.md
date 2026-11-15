# Tayfun Taşdemir — Blog, Portfolyo & Geliştirici Araçları Monorepo

Kişisel blog, portfolyo, admin paneli ve geliştiricilere yönelik mikro araçları barındıran **NestJS + Next.js (App Router)** tabanlı tam yığın (full-stack) monorepo projesi.

---

## Mimari & Teknoloji Yığını

- **Monorepo:** `npm workspaces` (`backend`, `frontend`)
- **Backend (`backend/`):** NestJS 11, TypeORM, MySQL 8.0 (`mysql2`), JWT Auth (`passport-jwt`), `@nestjs/schedule` (Cron), `nodemailer`
- **Frontend (`frontend/`):** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, `qrcode`, `axios`
- **Altyapı:** Docker & Docker Compose (`docker-compose.yml` + `docker-compose.override.yml`)

---

## Öne Çıkan Modüller & Araçlar

### Mikro Servis Araçları (Veritabanı Destekli)
- **KısaLink (`/kisa-link` & `/r/:kod`):**
  - Özel kısa kod, başlık/etiket, geçerlilik süresi, tek tıkla duraklat/aktifleştir, QR kod (PNG indirme) ve CSV dışa aktarma.
  - Tarayıcıya özel `ownerId` izolasyonu, admin için tüm linkleri görüntüleme ve **e-posta doğrulama ile cihazlar arası senkronizasyon**.
- **Webhook Yakalayıcı (`/webhook` & `/api/hook/:token`):**
  - Anlık benzersiz HTTP endpoint oluşturma, gelen `GET/POST/PUT/PATCH/DELETE` isteklerinin **Body, Headers, Query ve IP** detaylarını canlı izleme, özel yanıt kodu/gövdesi ayarlama.
- **Uptime & SSL Monitörü (`/uptime`):**
  - 5 dakikada bir otomatik HTTP durum & yanıt süresi (`ms`) kontrolü, HTTPS için **SSL sertifikası kalan gün** takibi ve kesinti/düzelme anlarında otomatik e-posta uyarısı.

### Diğer Geliştirici Araçları & İçerik (`/applications`)
- Blog, Projeler, İletişim ve JWT korumalı **Admin Paneli** (`/admin`)
- **PusulaAPI**, **cURL Dönüştürücü**, **Cron Generator**, **JWT Decoder & Secret Üretici**, **Code Diff Slider**, **JSON Formatter**, **Regex Tester**, **Hash & Base64**, **Şifre & Test Verisi Üretici**, **Görsel Dönüştürücü**, **HTML Canlı Önizleme**, **Döviz**, **Namaz Vakitleri**, **Yazılımcı Sözlüğü**, **İnteraktif Terminal** ve mini oyunlar.

### Sağlık Kontrolü
- `GET /api/health` — MySQL bağlantısını (`SELECT 1`) kontrol eder; sağlıklıysa `200 OK`, aksi halde `503 Service Unavailable` döner.

---

## Kurulum ve Çalıştırma

### 1. Ortam Değişkenleri
Kök dizindeki `.env.example` dosyasını `.env` olarak kopyalayıp değerleri doldurun:

```bash
cp .env.example .env
```

### 2. Docker Compose ile Çalıştırma (Önerilen)

`docker-compose.override.yml` dosyası geliştirme modunda otomatik olarak birleştirilir (`db` port `3306`, `backend` port `4000`, `frontend` port `3000`):

```bash
docker compose up -d
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **Health Check:** http://localhost:4000/api/health

### 3. Yerel (Docker Olmadan) Çalıştırma

```bash
npm install
npm run dev
```

Tek tek çalıştırmak için:

```bash
npm run backend:dev
npm run frontend:dev
```

---

## Build ve Test

```bash
# Tüm workspace'leri derle (NestJS + Next.js)
npm run build

# Backend testlerini çalıştır
npm test --workspace=backend
```

---

## Proje Yapısı

```text
tayfuntasdemir-monorepo/
├── backend/                  # NestJS API (port 4000, global prefix: /api)
│   └── src/
│       ├── auth/             # JWT kimlik doğrulama
│       ├── posts/            # Blog yazıları & görüntülenme
│       ├── links/            # KısaLink modülü (/api/links, /api/r/:kod)
│       ├── webhooks/         # Webhook Yakalayıcı (/api/webhooks, /api/hook/:token)
│       ├── uptime/           # Uptime & SSL Monitörü (/api/uptime + Cron)
│       ├── mail/             # E-posta servisi (Nodemailer)
│       └── ...               # contact, prayer, words, games, report, test-sheets
├── frontend/                 # Next.js 16 App Router (port 3000)
│   └── src/app/
│       ├── kisa-link/        # KısaLink arayüzü + /r/[kod] yönlendirme
│       ├── webhook/          # Webhook Yakalayıcı arayüzü
│       ├── uptime/           # Uptime & SSL Monitörü arayüzü
│       ├── applications/     # Tüm araçlar ve oyunlar merkezi
│       └── admin/            # Yönetim paneli
├── docker-compose.yml        # Production Docker yapılandırması
├── docker-compose.override.yml # Local geliştirme override'ları
└── package.json              # npm workspaces kök tanımı
```
