#!/usr/bin/env python3
"""
TEFAS Fonlarını Alternatif Yöntemle Çekme
fundturkey.com.tr alternatif sitesini kullanarak
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Supabase credentials
SUPABASE_URL = "https://twbromyqdzzjdddqaivs.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5MzcyMywiZXhwIjoyMDc3ODY5NzIzfQ.kkQ3n56Ag3DQv7R3ExWtdUhfvzwp3a9xxZUzYOG8wjI"

def fetch_tefas_from_fundturkey():
    """fundturkey.com.tr'den TEFAS fonlarını çek"""
    print("=== fundturkey.com.tr'den TEFAS Fonları Çekiliyor ===")
    
    # Son 3 gün için veri çek
    end_date = datetime.now()
    start_date = end_date - timedelta(days=3)
    
    start_str = start_date.strftime("%d.%m.%Y")
    end_str = end_date.strftime("%d.%m.%Y")
    
    print(f"Tarih aralığı: {start_str} - {end_str}")
    
    url = "https://fundturkey.com.tr/api/DB/BindHistoryInfo"
    
    headers = {
        'Connection': 'keep-alive',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://fundturkey.com.tr',
        'Referer': 'https://fundturkey.com.tr/TarihselVeriler.aspx',
        'Accept-Language': 'tr-TR,tr;q=0.9',
    }
    
    data = {
        'fontip': 'YAT',  # Yatırım fonları
        'bastarih': start_str,
        'bittarih': end_str,
        'fonkod': '',  # Tüm fonlar
    }
    
    try:
        print("API çağrısı yapılıyor...")
        response = requests.post(url, headers=headers, data=data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response ilk 300 karakter: {response.text[:300]}")
        
        if response.status_code != 200:
            print(f"✗ API hatası: {response.status_code}")
            return []
        
        result = response.json()
        
        if 'data' in result and len(result['data']) > 0:
            funds = result['data']
            print(f"✓ {len(funds)} fon kaydı alındı")
            print(f"  Total records: {result.get('recordsTotal', 'unknown')}")
            
            # En son fiyatlı fonları grupla
            latest_funds = {}
            for fund in funds:
                code = fund.get('FONKODU', '')
                if code:
                    # Eğer aynı fon birden fazla gündeyse, en son olanı al
                    if code not in latest_funds:
                        latest_funds[code] = fund
                    else:
                        # Timestamp karşılaştır
                        current_ts = latest_funds[code].get('TARIH', '0')
                        new_ts = fund.get('TARIH', '0')
                        if new_ts > current_ts:
                            latest_funds[code] = fund
            
            print(f"✓ {len(latest_funds)} benzersiz fon bulundu")
            return list(latest_funds.values())
        else:
            print("⚠ Veri bulunamadı")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Request hatası: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"✗ JSON parse hatası: {e}")
        return []

def process_fund(fund_data):
    """Fon verisini işle"""
    try:
        fund_code = fund_data.get('FONKODU', '').strip()
        fund_name = fund_data.get('FONUNVAN', '').strip()
        price_str = fund_data.get('FIYAT', '0')
        
        # Fiyatı float'a çevir
        try:
            price = float(price_str.replace(',', '.') if isinstance(price_str, str) else price_str)
        except:
            price = 0.0
        
        if not fund_code or price <= 0:
            return None
        
        # Timestamp'i parse et
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
    if not assets:
        return 0, 0
    
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
        
        time.sleep(0.3)
    
    return success_count, failed_count

def main():
    print("=== TEFAS Fon Entegrasyonu (Alternatif Yöntem) ===\n")
    
    # 1. fundturkey.com.tr'den fonları çek
    raw_funds = fetch_tefas_from_fundturkey()
    
    if not raw_funds:
        print("\n⚠ Hiç fon verisi alınamadı.")
        print("Not: TEFAS API'lerine erişim sandbox ortamından kısıtlı olabilir.")
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
        print("\n⚠ İşlenebilir fon bulunamadı.")
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
            print(f"\n✅ Veritabanında toplam TEFAS fonu: {total_count}")
    except Exception as e:
        print(f"⚠ Veritabanı kontrol hatası: {e}")

if __name__ == "__main__":
    main()
