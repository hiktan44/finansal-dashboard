# 📊 Finansal Dashboard - Mono-Repo

Türkiye ekonomi verileri ve portföy yönetimi için modern web uygulaması.

## 🏗️ Mimari

```
finansal-dashboard/
├── backend/                 # Node.js API (Fastify + TypeScript)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # İş mantığı
│   │   └── utils/          # Helper fonksiyonlar
│   ├── Dockerfile
│   └── package.json
├── financial-dashboard/     # React Frontend (Vite)
├── docker-compose.yml       # Tüm sistemi orchestrator eder
└── supabase/               # Self-hosted DB
```

## 🚀 Hızlı Başlangıç

### 1. Environment Variables

```bash
cp .env.example .env
```

`.env` dosyasını düzenle:
```bash
SUPABASE_URL=http://localhost:5432
SUPABASE_SERVICE_ROLE_KEY=your-key
FRED_API_KEY=your-key  # İsteğe bağlı
```

### 2. Docker Compose ile Başlat

```bash
docker-compose up -d
```

Servisler:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Supabase DB**: localhost:5432

### 3. Backend'i Yerel Çalıştır

```bash
cd backend
pnpm install
pnpm dev
```

### 4. Frontend'i Yerel Çalıştır

```bash
cd financial-dashboard
pnpm install
pnpm dev
```

## 📡 API Endpoints

### Market Data
```
POST /api/market/fetch      - BIST, Kripto, Döviz, Metal veri çek
GET  /api/market/assets      - Tüm varlıkları getir
GET  /api/market/assets/:id  - Belirli varlık
```

### TCMB
```
POST /api/tcmb/fetch         - TCMB döviz kurları
GET  /api/tcmb/data          - Makro veri
```

### TEFAS
```
POST /api/tefas/fetch        - TEFAS fonlar
GET  /api/tefas/funds        - Fon listesi
```

### BIST
```
POST /api/bist/fetch         - BIST endeksleri
GET  /api/bist/indices       - Endeks listesi
```

### Portfolio
```
GET  /api/portfolio          - Portföy getir
POST /api/portfolio/analyze  - Portföy analizi
```

### Alerts
```
POST /api/alerts             - Alarm oluştur
GET  /api/alerts             - Alarmları getir
POST /api/alerts/check       - Alarm kontrolü
```

## 🔄 Migration: Edge Functions → Backend

| Eski (Edge Function) | Yeni (Backend API) |
|---------------------|-------------------|
| `supabase.functions.invoke('fetch-tcmb-data')` | `fetch('/api/tcmb/fetch')` |
| `supabase.functions.invoke('fetch-market-data')` | `fetch('/api/market/fetch')` |
| `supabase.functions.invoke('fetch-tefas-funds')` | `fetch('/api/tefas/fetch')` |

## 🛠️ Geliştirme

### Backend'e Yeni Route Ekle

```typescript
// backend/src/routes/new-feature.ts
import { FastifyInstance } from 'fastify';

export default async function newRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Hello' };
  });
}
```

`backend/src/index.ts`'e ekle:
```typescript
import newRoutes from './routes/new-feature.js';
await fastify.register(newRoutes, { prefix: '/api/new-feature' });
```

### Frontend'de API Kullan

```typescript
import { fetchMarketData } from '@/lib/api';

const data = await fetchMarketData('bist', ['THYAO.IS', 'GARAN.IS']);
```

## 📦 Deployment

### Production Build

```bash
# Backend
cd backend
pnpm build
docker build -t finansal-backend .

# Frontend
cd financial-dashboard
pnpm build
docker build -t finansal-frontend .
```

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Backend başlamıyor
```bash
# Port 3001 boş mu?
lsof -i :3001

# Environment variables doğru mu?
cat backend/.env
```

### Frontend API'ye erişemiyor
```bash
# VITE_API_URL doğru mu?
echo $VITE_API_URL
# Should be: http://backend:3001 (Docker) or http://localhost:3001 (local)
```

### Supabase connection error
```bash
# Supabase çalışıyor mu?
docker ps | grep supabase

# Logları kontrol et
docker logs finansal-supabase-db
```

## 📝 TODO

- [ ] Cron jobs (node-cron) ile otomatik veri çekme
- [ ] WebSocket ile real-time updates
- [ ] Redis cache ekle
- [ ] Rate limiting
- [ ] Monitoring & logging (Sentry, Datadog)

## 📄 Lisans

MIT
