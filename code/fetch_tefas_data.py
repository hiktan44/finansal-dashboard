#!/usr/bin/env python3
"""
TEFAS Fonlarını Çekip Supabase'e Yükleyen Script
"""

import requests
import json
from datetime import datetime, timedelta
import os

# Supabase credentials
SUPABASE_URL = "https://twbromyqdzzjdddqaivs.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5MzcyMywiZXhwIjoyMDc3ODY5NzIzfQ.kkQ3n56Ag3DQv7R3ExWtdUhfvzwp3a9xxZUzYOG8wjI"

def fetch_tefas_funds():
    """TEFAS API'den fon verilerini çek"""
    print("=== TEFAS Fonları Çekiliyor ===")
    
    # Sabit tarih aralığı (2025 başı - daha güncel veriler için)
    start_date_str = "01.11.2025"
    end_date_str = "05.11.2025"
    
    print(f"Tarih aralığı: {start_date_str} - {end_date_str}")
    
    url = "https://www.tefas.gov.tr/api/DB/BindHistoryInfo"
    
    # Session kullan
    session = requests.Session()
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.tefas.gov.tr/TarihselVeriler.aspx',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://www.tefas.gov.tr',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
    }
    
    # Form data - TEFAS API'nin beklediği format
    data = {
        'fontip': 'YAT',
        'bastarih': start_date_str,
        'bittarih': end_date_str,
        'fonkod': '',
        'fontur': '',
        'sfontur': ''
    }
    
    try:
        print("API çağrısı yapılıyor...")
        response = session.post(url, headers=headers, data=data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'unknown')}")
        print(f"Response ilk 200 karakter: {response.text[:200]}")
        
        response.raise_for_status()
        
        # JSON parse
        result = response.json()
        
        if 'data' in result and len(result['data']) > 0:
            print(f"✓ {len(result['data'])} fon kaydı alındı")
            print(f"  Total records: {result.get('recordsTotal', 'unknown')}")
            return result['data']
        else:
            print("⚠ Veri bulunamadı")
            print(f"Response keys: {result.keys() if isinstance(result, dict) else 'not a dict'}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"✗ TEFAS API hatası: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"✗ JSON parse hatası: {e}")
        print(f"Response text (500 karakter): {response.text[:500]}")
        return []

def process_fund(fund_data):
    """Fon verisini işle ve Supabase formatına dönüştür"""
    try:
        fund_code = fund_data.get('FONKODU', '').strip()
        fund_name = fund_data.get('FONUNVAN', '').strip()
        price = float(fund_data.get('FIYAT', 0))
        
        if not fund_code or price <= 0:
            return None
        
        # Timestamp'i datetime'a çevir
        timestamp_str = fund_data.get('TARIH', '')
        if timestamp_str.startswith('/Date('):
            timestamp = int(timestamp_str.replace('/Date(', '').replace(')/', ''))
            last_updated = datetime.fromtimestamp(timestamp / 1000).isoformat()
        else:
            last_updated = datetime.now().isoformat()
        
        asset_data = {
            'symbol': fund_code,
            'name': fund_name,
            'asset_type': 'TEFAS',
            'price': price,
            'exchange': 'TEFAS',
            'currency': 'TRY',
            'last_updated': last_updated,
            'is_active': True,
            'metadata': {
                'share_count': float(fund_data.get('TEDPAYSAYISI', 0) or 0),
                'investor_count': float(fund_data.get('KISISAYISI', 0) or 0),
                'portfolio_size': float(fund_data.get('PORTFOYBUYUKLUK', 0) or 0)
            }
        }
        
        return asset_data
        
    except Exception as e:
        print(f"✗ Fon işleme hatası ({fund_data.get('FONKODU', 'unknown')}): {e}")
        return None

def upsert_to_supabase(assets):
    """Fonları Supabase'e upsert et"""
    print(f"\n=== {len(assets)} Fon Veritabanına Yazılıyor ===")
    
    url = f"{SUPABASE_URL}/rest/v1/assets"
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    success_count = 0
    failed_count = 0
    
    # Batch processing (50 kayıt/batch)
    batch_size = 50
    for i in range(0, len(assets), batch_size):
        batch = assets[i:i+batch_size]
        
        try:
            response = requests.post(url, headers=headers, json=batch, timeout=30)
            
            if response.status_code in [200, 201]:
                success_count += len(batch)
                print(f"✓ Batch {i//batch_size + 1}: {len(batch)} fon yazıldı (Toplam: {success_count})")
            else:
                failed_count += len(batch)
                print(f"✗ Batch {i//batch_size + 1} hatası: {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                
        except Exception as e:
            failed_count += len(batch)
            print(f"✗ Batch {i//batch_size + 1} hatası: {e}")
    
    return success_count, failed_count

def main():
    print("=== TEFAS Veri Toplama Başlatıldı ===\n")
    
    # 1. TEFAS'tan fon verilerini çek
    raw_funds = fetch_tefas_funds()
    
    if not raw_funds:
        print("\n⚠ Hiç fon verisi alınamadı. Script sonlandırılıyor.")
        return
    
    # 2. Fonları işle
    print(f"\n=== {len(raw_funds)} Fon İşleniyor ===")
    processed_funds = []
    
    for fund in raw_funds:
        processed = process_fund(fund)
        if processed:
            processed_funds.append(processed)
    
    print(f"✓ {len(processed_funds)} fon başarıyla işlendi")
    
    if not processed_funds:
        print("\n⚠ İşlenebilir fon bulunamadı. Script sonlandırılıyor.")
        return
    
    # 3. Veritabanına yaz
    success, failed = upsert_to_supabase(processed_funds)
    
    # 4. Sonuçları göster
    print(f"\n=== İŞLEM TAMAMLANDI ===")
    print(f"Toplam fon: {len(raw_funds)}")
    print(f"İşlenen: {len(processed_funds)}")
    print(f"Başarıyla yazılan: {success}")
    print(f"Başarısız: {failed}")
    
    # 5. Veritabanında toplam TEFAS fonu sayısını kontrol et
    check_url = f"{SUPABASE_URL}/rest/v1/assets?asset_type=eq.TEFAS&select=count"
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'count=exact'
    }
    
    try:
        response = requests.get(check_url, headers=headers, timeout=10)
        count_header = response.headers.get('Content-Range', '')
        if count_header:
            total_count = count_header.split('/')[-1]
            print(f"\nVeritabanında toplam TEFAS fonu: {total_count}")
    except:
        pass

if __name__ == "__main__":
    main()
