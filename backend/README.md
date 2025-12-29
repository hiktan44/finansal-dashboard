# Finansal Dashboard Backend

Node.js API servisi - Supabase Edge Functions alternatifi.

## 🚀 Başlatma

```bash
# Install
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## 📁 Yapı

```
src/
├── index.ts          # Ana uygulama
├── routes/           # API endpoint'leri
│   ├── market-data.ts
│   ├── tcmb.ts
│   ├── tefas.ts
│   ├── fred.ts
│   ├── tuik.ts
│   ├── bist.ts
│   ├── portfolio.ts
│   └── alerts.ts
├── utils/
│   ├── db.ts         # Supabase client
│   └── fetch.ts      # External API'ler
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Market Data
```
POST /api/market/fetch
Body: { assetType: "bist" | "crypto" | "currency" | "metal", symbols?: string[] }
```

### TCMB
```
POST /api/tcmb/fetch
GET  /api/tcmb/data?indicator=&start_date=&end_date=
```

### TEFAS
```
POST /api/tefas/fetch
GET  /api/tefas/funds
```

### FRED
```
POST /api/fred/fetch
Body: { series_id: string }
```

### BIST
```
POST /api/bist/fetch
Body: { symbols?: string[] }
```

### Portfolio
```
GET  /api/portfolio?user_id=
POST /api/portfolio/analyze
Body: { user_id: string }
```

### Alerts
```
POST /api/alerts
Body: { user_id, symbol, condition, ... }
GET  /api/alerts?user_id=
POST /api/alerts/check
```

## 🔑 Environment Variables

```bash
PORT=3001
SUPABASE_URL=http://localhost:5432
SUPABASE_SERVICE_ROLE_KEY=your-key
FRED_API_KEY=your-key  # Optional
```
