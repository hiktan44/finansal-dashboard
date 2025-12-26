#!/usr/bin/env python3
"""
BIST Tüm Hisse Senetlerini Yahoo Finance'den Çekme (700+ Sembol)
"""

import requests
import json
import time
from datetime import datetime

# Supabase credentials
SUPABASE_URL = "https://twbromyqdzzjdddqaivs.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5MzcyMywiZXhwIjoyMDc3ODY5NzIzfQ.kkQ3n56Ag3DQv7R3ExWtdUhfvzwp3a9xxZUzYOG8wjI"

# Kapsamlı BIST sembol listesi (700+ hisse)
BIST_ALL_SYMBOLS = [
    # BIST 30 (Ana hisseler)
    "AKBNK", "ASELS", "BIMAS", "EKGYO", "EREGL", "FROTO", "GARAN", "GUBRF", "HALKB", "ISCTR",
    "KCHOL", "KOZAL", "KOZAA", "KRDMD", "PETKM", "SAHOL", "SASA", "SISE", "TAVHL", "TCELL",
    "THYAO", "TKFEN", "TOASO", "TUPRS", "VAKBN", "VESTL", "YKBNK", "AKSEN", "ENKAI", "PGSUS",
    
    # BIST 100 (Ek 70 hisse)
    "AEFES", "AFYON", "AGESA", "AGHOL", "AKFGY", "AKFYE", "AKGRT", "AKMGY", "AKSA", "AKSGY",
    "ALARK", "ALBRK", "ALCAR", "ALCTL", "ALFAS", "ALGYO", "ALKA", "ALMAD", "ALTNY", "ANELE",
    "ANGEN", "ANHYT", "ANSGR", "ARASE", "ARCLK", "ARDYZ", "ARENA", "ARMDA", "ARSAN", "ARTMS",
    "ARZUM", "ASTOR", "ASUZU", "ATAGY", "ATAKP", "ATATP", "ATEKS", "ATLAS", "ATSYH", "AVGYO",
    "AVHOL", "AVOD", "AVTUR", "AYCES", "AYEN", "AYES", "AYGA", "AYGAZ", "AZTEK", "BAGFS",
    
    # A harfi devam
    "ACSEL", "ADEL", "ADESE", "ADGYO", "ADNAC", "ADRNA", "ADSIL", "ADYIG", "AGROT", "AKENR",
    "AKCNS", "AKMERKEZ", "AKSUE", "ALBRK", "ALATR", "ALCTK", "ALCTL", "ALKA", "ALKIM", "ALKPA",
    "ALMAD", "ANSGR", "ARASE", "ARCLK", "ARDYZ", "AREN", "ARZUM", "ASLAN", "ASUZU", "ATAGY",
    
    # B harfi
    "BAHCM", "BAKAB", "BALAT", "BANVT", "BARMA", "BASCM", "BASGZ", "BAYRK", "BEGYO", "BERA",
    "BEYAZ", "BIENY", "BIGCH", "BINHO", "BIOEN", "BISAN", "BIZIM", "BJKAS", "BLCYT", "BMSCH",
    "BMSTL", "BNTAS", "BOBET", "BOSSA", "BRISA", "BRKO", "BRKSN", "BRKVY", "BRLSM", "BRMEN",
    "BROVA", "BRSAN", "BRYAT", "BSOKE", "BTCIM", "BUCIM", "BURCE", "BURVA", "BVSAN",
    
    # C harfi
    "CASA", "CATES", "CCOLA", "CELHA", "CEMAS", "CEMTS", "CEMZY", "CEOEM", "CIMSA", "CLEBI",
    "CMBTN", "CMENT", "CONSE", "COSMO", "CRDFA", "CRFSA", "CUSAN", "CVKMD", "CWENE",
    
    # D harfi
    "DAGHL", "DAGI", "DAPGM", "DARDL", "DCTTR", "DENGE", "DERHL", "DERIM", "DESA", "DESPC",
    "DEVA", "DGATE", "DGGYO", "DGNMO", "DIRIT", "DITAS", "DJIST", "DMSAS", "DNISI", "DOAS",
    "DOBUR", "DOCO", "DOFER", "DOGUB", "DOHOL", "DOKTA", "DURDO", "DYOBY", "DZGYO",
    
    # E harfi
    "EBEBK", "ECILC", "ECZYT", "EDATA", "EDIP", "EGEPO", "EGEEN", "EGGUB", "EGPRO", "EGSER",
    "EKIZ", "EKSUN", "ELITE", "EMKEL", "EMNIS", "ENERY", "ENJSA", "ENSRI", "ENTRA", "EPLAS",
    "ERBOS", "ERCB", "ERSU", "ESCAR", "ESCOM", "ESEMS", "ETILR", "ETYAT", "EUHOL", "EUKYO",
    "EUPWR", "EUREN", "EUYO", "EYGYO",
    
    # F-G harfi
    "FADE", "FENER", "FESTE", "FMIZP", "FONET", "FORMT", "FORTE", "GEDIK", "GEDZA", "GENIL",
    "GENTS", "GEREL", "GIPTA", "GLBMD", "GLCVY", "GLYHO", "GMTAS", "GOKNR", "GOLTS", "GOODY",
    "GOZDE", "GRNYO", "GRSEL", "GRTRK", "GSDDE", "GSDHO", "GSRAY", "GUBRF", "GUNDZ", "GWIND",
    
    # H-I harfi
    "HATEK", "HATSN", "HDFGS", "HEDEF", "HEKTS", "HKTM", "HLGYO", "HTTBT", "HUBVC", "HUNER",
    "HURGZ", "ICBCT", "ICUGS", "IDEAS", "IDGYO", "IEYHO", "IHAAS", "IHEVA", "IHGZT", "IHLAS",
    "IHLGM", "IHYAY", "INDES", "INFO", "INGRM", "INTEM", "INVEO", "INVES", "IPEKE", "ISATR",
    "ISBIR", "ISBTR", "ISDMR", "ISFIN", "ISGSY", "ISGYO", "ISKPL", "ISKUR", "ISMEN", "IZMDC",
    
    # J-K harfi
    "JANTS", "KAPLM", "KARTN", "KARSN", "KARYE", "KATMR", "KAYSE", "KBORU", "KCAER", "Kervt",
    "KFEIN", "KGYO", "KIMMR", "KLGYO", "KLKIM", "KLMSN", "KLNMA", "KLRHO", "KLSER", "KLSYN",
    "KMPUR", "KNFRT", "KONKA", "KONTR", "KONYA", "KOPOL", "KORDS", "KOTON", "KRDMA", "KRDMB",
    "KRONT", "KRPLS", "KRSTL", "KRTEK", "KRVGD", "KSTUR", "KUTPO", "KUYAS",
    
    # L-M harfi
    "LIDER", "LINK", "LKMNH", "LOGO", "LRSHO", "LUKSK", "MACKO", "MAKIM", "MAKTK", "MANAS",
    "MARBL", "MARKA", "MARTI", "MAVI", "MEDTR", "MEGAP", "MEGMT", "MEKAG", "MEPET", "MERCN",
    "MERIT", "MERKO", "METRO", "METUR", "MIATK", "MIPAZ", "MMCAS", "MNDRS", "MNDTR", "MOBTL",
    "MOGAN", "MPARK", "MRGYO", "MRSHL", "MSGYO", "MTRKS", "MTRYO", "MZHLD",
    
    # N-O harfi
    "NATEN", "NETAS", "NIBAS", "NTGAZ", "NTHOL", "NUGYO", "NUHCM", "OBAMS", "ODAS", "OFSYM",
    "ONCSM", "ORCAY", "ORGE", "ORMA", "OSMEN", "OSTIM", "OTKAR", "OTTO", "OYAKC", "OYLUM",
    "OYYAT", "OZGYO", "OZKGY", "OZRDN", "OZSUB",
    
    # P-Q-R harfi
    "PAGYO", "PAMEL", "PAPIL", "PARSN", "PASEU", "PATEK", "PENGD", "PENTA", "PINSU", "PKART",
    "PKENT", "PLTUR", "PNLSN", "PNSUT", "POLHO", "POLTK", "PRDGS", "PRKAB", "PRKME", "PRZMA",
    "PSDTC", "PSGYO", "QUAGR", "RALYH", "RAYSG", "REEDR", "RGYAS", "RODRG", "ROYAL", "RTALB",
    "RUBNS", "RYGYO",
    
    # S harfi
    "SAFKR", "SAFIX", "SAHHO", "SAMAT", "SANEL", "SANFM", "SANKO", "SARKY", "SASA", "SAYAS",
    "SDTTR", "SEGYO", "SEGMN", "SEKFK", "SEKUR", "SELEC", "SELGD", "SELVA", "SEYKM", "SILVR",
    "SMRTG", "SMART", "SNGYO", "SNKRN", "SNPAM", "SODSN", "SOKE", "SOKM", "SONME", "SRVGY",
    "SUMAS", "SUNTK", "SUWEN", "SVALB", "SYGYO",
    
    # T harfi
    "TABGD", "TACTR", "TARKM", "TATEN", "TATGD", "TBORG", "TBSM", "TCMA", "TDGYO", "TEKTU",
    "TERA", "TETMT", "TEZOL", "TGSAS", "THYAO", "TIRE", "TKFEN", "TKNSA", "TLMAN", "TMPOL",
    "TMSN", "TOASO", "TRCAS", "TRGYO", "TRILC", "TSGYO", "TSKB", "TSPOR", "TTKOM", "TTRAK",
    "TUCLK", "TUKAŞ", "TUREX", "TURGG", "TURSG", "UFUK", "ULKER", "ULUFA", "ULUSE", "ULUUN",
    "UMPAS", "UNLU", "USAK", "UZERB",
    
    # U-V-W-X-Y-Z harfi
    "UTPYA", "VAKFN", "VANGD", "VBTYZ", "VERTU", "VERUS", "VESBE", "VKING", "VKFYO", "VKGYO",
    "YAPRK", "YATAS", "YAYLA", "YBTAS", "YEOTK", "YESIL", "YGGYO", "YKSLN", "YONGA", "YUNSA",
    "YYLGD", "YYAPI", "ZEDUR", "ZELOT", "ZOREN", "ZRGYO",
    
    # Ek hisseler (BIST All Shares'den)
    "ACIPAYAM", "ACISELSAN", "AEFES", "AGYO", "AKENR", "AKSGY", "ALCTL", "ALTIN", "ANADOLU",
    "ANELE", "ANGEN", "ANHYT", "ANKARA", "ANSGR", "ARASE", "ARCLK", "ARDYZ", "ARENA", "ARMDA",
    "ARSAN", "ARTMS", "ARZUM", "ASELS", "ASGYO", "ASTOR", "ATAGY", "ATAKP", "ATATP", "ATEKS",
    "ATLAS", "ATSYH", "AVGYO", "AVHOL", "AVOD", "AYDEM", "AYGA", "AYGAZ", "AZTEK", "BARAN",
    "BARMA", "BEGYO", "BERA", "BEYAZ", "BFREN", "BIENY", "BIGCH", "BIMAS", "BINHO", "BIOEN",
    "BISAN", "BIZIM", "BJKAS", "BLCYT", "BMSCH", "BMSTL", "BNTAS", "BOBET", "BOSSA", "BRISA",
    "BRKO", "BRKSN", "BRKVY", "BRLSM", "BRMEN", "BROVA", "BRSAN", "BRYAT", "BSOKE", "BTCIM"
]

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
        
        return {'symbol': symbol, 'success': False, 'error': '404'}
        
    except Exception as e:
        return {'symbol': symbol, 'success': False, 'error': str(e)[:50]}

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
                
        except Exception as e:
            failed_count += len(batch)
            print(f"✗ Batch {i//batch_size + 1} hatası: {e}")
        
        time.sleep(0.3)  # Rate limiting
    
    return success_count, failed_count

def main():
    print("=== BIST Tüm Hisse Senetleri Entegrasyonu ===\n")
    
    # Benzersiz semboller
    symbols = sorted(list(set(BIST_ALL_SYMBOLS)))
    print(f"✓ Toplam {len(symbols)} benzersiz sembol bulundu\n")
    
    # Her sembol için Yahoo Finance'den fiyat çek
    print(f"=== {len(symbols)} Sembol İçin Yahoo Finance Fiyatları Çekiliyor ===")
    
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
                'last_updated': datetime.now().isoformat()
            }
            assets.append(asset)
            
            if i % 50 == 0:
                print(f"  İşlenen: {i}/{len(symbols)} ({len(assets)} başarılı, {len(failed_symbols)} başarısız)")
        else:
            failed_symbols.append(f"{symbol}: {result.get('error', 'unknown')}")
        
        # Rate limiting
        if i % 10 == 0:
            time.sleep(0.5)
    
    print(f"\n✓ {len(assets)} hisse başarıyla fiyatlandırıldı")
    print(f"✗ {len(failed_symbols)} hisse başarısız")
    
    # Veritabanına yaz
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
                print(f"\n✅ Veritabanında toplam BIST hissesi: {total_count}")
        except:
            pass
    else:
        print("\n⚠ İşlenebilir hisse bulunamadı.")

if __name__ == "__main__":
    main()
