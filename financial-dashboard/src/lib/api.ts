// Backend API Client
// Edge Functions yerine Node.js backend'i kullanır

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...fetchOptions,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ===============================
// MARKET DATA API
// ===============================

export async function fetchMarketData(assetType: string, symbols?: string[]) {
  const response = await apiFetch('/api/market/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetType, symbols })
  });
  return response.json();
}

export async function getAssets(symbol?: string) {
  const url = symbol ? `/api/market/assets?symbol=${symbol}` : '/api/market/assets';
  const response = await apiFetch(url);
  return response.json();
}

// ===============================
// TCMB API
// ===============================

export async function fetchTCMBData() {
  const response = await apiFetch('/api/tcmb/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function getTCMBData(indicator?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (indicator) params.set('indicator', indicator);
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  
  const response = await apiFetch(`/api/tcmb/data?${params}`);
  return response.json();
}

// ===============================
// TEFAS API
// ===============================

export async function fetchTEFASData() {
  const response = await apiFetch('/api/tefas/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function getTEFASFunds() {
  const response = await apiFetch('/api/tefas/funds');
  return response.json();
}

// ===============================
// FRED API
// ===============================

export async function fetchFREDData(seriesId: string) {
  const response = await apiFetch('/api/fred/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ series_id: seriesId })
  });
  return response.json();
}

// ===============================
// TÜİK API
// ===============================

export async function fetchTUIKData(tableCode: string) {
  const response = await apiFetch('/api/tuik/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_code: tableCode })
  });
  return response.json();
}

export async function getInflationData() {
  const response = await apiFetch('/api/tuik/inflation');
  return response.json();
}

export async function getUnemploymentData() {
  const response = await apiFetch('/api/tuik/unemployment');
  return response.json();
}

// ===============================
// BIST API
// ===============================

export async function fetchBISTData(symbols?: string[]) {
  const response = await apiFetch('/api/bist/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols })
  });
  return response.json();
}

export async function getBISTIndices() {
  const response = await apiFetch('/api/bist/indices');
  return response.json();
}

// ===============================
// PORTFOLIO API
// ===============================

export async function getPortfolio(userId: string) {
  const response = await apiFetch(`/api/portfolio?user_id=${userId}`);
  return response.json();
}

export async function analyzePortfolio(userId: string) {
  const response = await apiFetch('/api/portfolio/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return response.json();
}

// ===============================
// ALERTS API
// ===============================

export async function createAlert(alertData: any) {
  const response = await apiFetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData)
  });
  return response.json();
}

export async function getAlerts(userId: string) {
  const response = await apiFetch(`/api/alerts?user_id=${userId}`);
  return response.json();
}

export async function triggerAlertCheck() {
  const response = await apiFetch('/api/alerts/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
