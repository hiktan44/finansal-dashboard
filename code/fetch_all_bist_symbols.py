#!/usr/bin/env python3
"""
Tüm BIST Hisse Senedi Sembollerini Çekme ve Veritabanına Yazma
"""

import requests
import json
from bs4 import BeautifulSoup
import time

# Supabase credentials
SUPABASE_URL = "https://twbromyqdzzjdddqaivs.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5MzcyMywiZXhwIjoyMDc3ODY5NzIzfQ.kkQ3n56Ag3DQv7R3ExWtdUhfvzwp3a9xxZUzYOG8wjI"

def get_bist_symbols_from_multiple_sources():
    """Birden fazla kaynaktan BIST sembollerini topla"""
    all_symbols = set()
    
    # Kaynak 1: stockanalysis.com
    print("=== stockanalysis.com'dan semboller çekiliyor ===")
    try:
        url = "https://stockanalysis.com/list/borsa-istanbul/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Tablo içindeki sembol linklerini bul
        links = soup.find_all('a', href=lambda x: x and '/stocks/' in str(x))
        for link in links:
            symbol = link.get('href', '').split('/')[-2]
            if symbol and len(symbol) <= 6 and symbol.isupper():
                all_symbols.add(symbol)
        
        print(f"✓ {len(all_symbols)} sembol bulundu (stockanalysis.com)")
    except Exception as e:
        print(f"✗ stockanalysis.com hatası: {e}")
    
    # Kaynak 2: Investing.com BIST All Shares endpoint
    print("\n=== investing.com'dan semboller çekiliyor ===")
    try:
        # Investing.com'un API'sini kullan
        url = "https://api.investing.com/api/financialdata/assets/equities/1?fields-list=id%2Cname%2Csymbol%2Clast%2Cchange%2CchangePercent%2ClastUpdate"
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'domain-id': '1',
            'Accept': 'application/json'
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                for item in data['data']:
                    symbol = item.get('symbol', '')
                    if symbol and len(symbol) <= 6:
                        all_symbols.add(symbol)
            print(f"✓ Toplam {len(all_symbols)} sembol (investing.com eklendi)")
    except Exception as e:
        print(f"⚠ investing.com hatası: {e}")
    
    # Kaynak 3: Manuel liste (yaygın BIST 100 + BIST 30 hisseleri)
    print("\n=== Manuel liste ekleniyor ===")
    manual_symbols = [
        # BIST 30
        "AKBNK", "ASELS", "BIMAS", "EKGYO", "EREGL", "FROTO", "GARAN", "GUBRF", "HALKB", "ISCTR",
        "KCHOL", "KOZAL", "KOZAA", "KRDMD", "PETKM", "SAHOL", "SASA", "SISE", "TAVHL", "TCELL",
        "THYAO", "TKFEN", "TOASO", "TUPRS", "VAKBN", "VESTL", "YKBNK", "AKSEN", "ENKAI", "PGSUS",
        # BIST 100 ek hisseler
        "AEFES", "AFYON", "AGESA", "AGHOL", "AKFGY", "AKFYE", "AKGRT", "AKMGY", "AKSA", "AKSEN",
        "AKSGY", "ALARK", "ALBRK", "ALCAR", "ALCTL", "ALFAS", "ALGYO", "ALKA", "ALMAD", "ALTNY",
        "ANELE", "ANGEN", "ANHYT", "ANSGR", "ARASE", "ARCLK", "ARDYZ", "ARENA", "ARMDA", "ARSAN",
        "ARTMS", "ARZUM", "ASTOR", "ASUZU", "ATAGY", "ATAKP", "ATATP", "ATEKS", "ATLAS", "ATSYH",
        "AVGYO", "AVHOL", "AVOD", "AVTUR", "AYCES", "AYEN", "AYES", "AYGA", "AYGAZ", "AZTEK",
        "BAGFS", "BAHCM", "BAKAB", "BALAT", "BANVT", "BARMA", "BASCM", "BASGZ", "BAYRK", "BEGYO",
        "BERA", "BEYAZ", "BIENY", "BIGCH", "BINHO", "BIOEN", "BISAN", "BIZIM", "BJKAS", "BLCYT",
        "BMSCH", "BMSTL", "BNTAS", "BOBET", "BOSSA", "BRISA", "BRKO", "BRKSN", "BRKVY", "BRLSM",
        "BRMEN", "BROVA", "BRSAN", "BRYAT", "BSOKE", "BTCIM", "BUCIM", "BURCE", "BURVA", "BVSAN",
        # Daha fazla ekle
        "CASA", "CATES", "CCOLA", "CELHA", "CEMAS", "CEMTS", "CEMZY", "CEOEM", "CIMSA", "CLEBI",
        "CMBTN", "CMENT", "CONSE", "COSMO", "CRDFA", "CRFSA", "CUSAN", "CVKMD", "CWENE", "DAGHL",
        "DAGI", "DAPGM", "DARDL", "DCTTR", "DENGE", "DERHL", "DERIM", "DESA", "DESPC", "DEVA",
        "DGATE", "DGGYO", "DGNMO", "DIRIT", "DITAS", "DJIST", "DMSAS", "DNISI", "DOAS", "DOBUR",
        "DOCO", "DOFER", "DOGUB", "DOHOL", "DOKTA", "DURDO", "DYOBY", "DZGYO", "EBEBK", "ECILC",
        "ECZYT", "EDATA", "EDIP", "EGEPO", "EGEEN", "EGGUB", "EGPRO", "EGSER", "EKIZ", "EKSUN",
        "ELITE", "EMKEL", "EMNIS", "ENERY", "ENJSA", "ENKAI", "ENSRI", "ENTRA", "EPLAS", "ERBOS",
        "ERCB", "ERSU", "ESCAR", "ESCOM", "ESEMS", "ETILR", "ETYAT", "EUHOL", "EUKYO", "EUPWR",
        "EUREN", "EUYO", "EYGYO", "FADE", "FENER", "FESTE", "FMIZP", "FONET", "FORMT", "FORTE"
    ]
    all_symbols.update(manual_symbols)
    print(f"✓ Manuel liste eklendi, toplam: {len(all_symbols)} sembol")
    
    return sorted(list(all_symbols))

def fetch_yahoo_price(symbol):
    """Yahoo Finance'den hisse fiyatını çek"""
    try:
        # .IS suffix ekle (Istanbul Stock Exchange)
        yahoo_symbol = f"{symbol}.IS"
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
            result = data['chart']['result'][0]
            meta = result.get('meta', {})
            
            price = meta.get('regularMarketPrice')
            name = meta.get('longName') or meta.get('shortName') or symbol
            currency = meta.get('currency', 'TRY')
            
            if price:
                return {
                    'symbol': symbol,
                    'name': name,
                    'price': float(price),
                    'currency': currency,
                    'success': True
                }
        
        return {'symbol': symbol, 'success': False, 'error': 'No price data'}
        
    except Exception as e:
        return {'symbol': symbol, 'success': False, 'error': str(e)}

def upsert_to_supabase(assets):
    """Hisseleri Supabase'e batch upsert et"""
    if not assets:
        return 0, 0
    
    print(f"\n=== {len(assets)} Hisse Veritabanına Yazılıyor ===")
    
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
                print(f"✓ Batch {i//batch_size + 1}: {len(batch)} hisse yazıldı (Toplam: {success_count})")
            else:
                failed_count += len(batch)
                print(f"✗ Batch {i//batch_size + 1} hatası: {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                
        except Exception as e:
            failed_count += len(batch)
            print(f"✗ Batch {i//batch_size + 1} hatası: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    return success_count, failed_count

def main():
    print("=== BIST Tüm Hisse Senetleri Entegrasyonu ===\n")
    
    # 1. Tüm BIST sembollerini topla
    symbols = get_bist_symbols_from_multiple_sources()
    print(f"\n✓ Toplam {len(symbols)} benzersiz sembol bulundu")
    
    if not symbols:
        print("\n⚠ Hiç sembol bulunamadı. Script sonlandırılıyor.")
        return
    
    # 2. Her sembol için Yahoo Finance'den fiyat çek
    print(f"\n=== {len(symbols)} Sembol İçin Yahoo Finance Fiyatları Çekiliyor ===")
    
    assets = []
    failed_symbols = []
    
    for i, symbol in enumerate(symbols, 1):
        result = fetch_yahoo_price(symbol)
        
        if result['success']:
            asset = {
                'symbol': result['symbol'],
                'name': result['name'],
                'asset_type': 'BIST',
                'price': result['price'],
                'exchange': 'BIST',
                'currency': result['currency'],
                'is_active': True,
                'last_updated': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            assets.append(asset)
            
            if i % 50 == 0:
                print(f"  İşlenen: {i}/{len(symbols)} ({len(assets)} başarılı)")
        else:
            failed_symbols.append(f"{symbol}: {result.get('error', 'unknown')}")
        
        # Rate limiting
        if i % 10 == 0:
            time.sleep(1)
    
    print(f"\n✓ {len(assets)} hisse başarıyla fiyatlandırıldı")
    print(f"✗ {len(failed_symbols)} hisse başarısız")
    
    # 3. Veritabanına yaz
    if assets:
        success, failed = upsert_to_supabase(assets)
        
        print(f"\n=== İŞLEM TAMAMLANDI ===")
        print(f"Toplam sembol: {len(symbols)}")
        print(f"Fiyat bulunan: {len(assets)}")
        print(f"Başarıyla yazılan: {success}")
        print(f"Başarısız: {failed}")
        
        # Veritabanında toplam BIST sayısını kontrol et
        check_url = f"{SUPABASE_URL}/rest/v1/assets?asset_type=eq.BIST&select=count"
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
                print(f"\nVeritabanında toplam BIST hissesi: {total_count}")
        except:
            pass
        
        # Başarısız semboller
        if failed_symbols:
            print(f"\n=== Başarısız Semboller (ilk 20) ===")
            for fail in failed_symbols[:20]:
                print(f"  ✗ {fail}")
    else:
        print("\n⚠ İşlenebilir hisse bulunamadı. Script sonlandırılıyor.")

if __name__ == "__main__":
    main()
