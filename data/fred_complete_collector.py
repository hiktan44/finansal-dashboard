import os
import json
import pandas as pd
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class FREDDataCollector:
    """FRED API kullanarak ekonomik veri toplayıcı"""
    
    def __init__(self, api_key: str):
        """FRED Data Collector'ı başlat"""
        self.api_key = api_key
        self.base_url = "https://api.stlouisfed.org/fred"
        self.session = requests.Session()
        self.rate_limit_delay = 0.1  # API rate limiting için gecikme
        
    def make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict]:
        """FRED API'ye HTTP isteği gönder"""
        params['api_key'] = self.api_key
        params['file_type'] = 'json'
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            time.sleep(self.rate_limit_delay)  # Rate limiting
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"API istek hatası: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"JSON decode hatası: {e}")
            return None
    
    def get_series_info(self, series_id: str) -> Optional[Dict]:
        """Seri bilgilerini al"""
        endpoint = f"series"
        params = {"series_id": series_id}
        
        data = self.make_request(endpoint, params)
        if data and 'seriess' in data and data['seriess']:
            return data['seriess'][0]
        return None
    
    def get_series_observations(self, series_id: str, start_date: str, end_date: str, 
                              frequency: str = 'm') -> Optional[Dict]:
        """Seri gözlemlerini al"""
        endpoint = f"series/observations"
        params = {
            "series_id": series_id,
            "observation_start": start_date,
            "observation_end": end_date,
            "frequency": frequency  # m=günlük, q=çeyreklik, a=yıllık
        }
        
        data = self.make_request(endpoint, params)
        if data and 'observations' in data:
            return data['observations']
        return None
    
    def search_series(self, search_text: str, limit: int = 100) -> Optional[List[Dict]]:
        """Seri arama"""
        endpoint = "series/search"
        params = {
            "search_text": search_text,
            "limit": limit
        }
        
        data = self.make_request(endpoint, params)
        if data and 'seriess' in data:
            return data['seriess']
        return None

class MainDataCollector:
    """Ana veri toplama sınıfı"""
    
    def __init__(self, api_key: str):
        self.fred = FREDDataCollector(api_key)
        self.series_config = self._get_series_config()
        
    def _get_series_config(self) -> Dict[str, Dict]:
        """FRED serileri yapılandırması"""
        return {
            # Faiz Oranları
            'FEDFUNDS': {
                'name': 'Federal Reserve Faiz Oranı',
                'description': 'Federal Funds Rate - Federal Reserve Banka Arası Geçici Fon Faiz Oranı',
                'search_terms': ['federal funds rate', 'fed funds'],
                'category': 'interest_rates'
            },
            'DGS10': {
                'name': 'ABD 10 Yıl Hazine Faizi',
                'description': 'Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity',
                'search_terms': ['10 year treasury', 'DGS10'],
                'category': 'treasury_rates'
            },
            'DGS2': {
                'name': 'ABD 2 Yıl Hazine Faizi',
                'description': 'Market Yield on U.S. Treasury Securities at 2-Year Constant Maturity',
                'search_terms': ['2 year treasury', 'DGS2'],
                'category': 'treasury_rates'
            },
            'DGS1': {
                'name': 'ABD 1 Yıl Hazine Faizi',
                'description': 'Market Yield on U.S. Treasury Securities at 1-Year Constant Maturity',
                'search_terms': ['1 year treasury', 'DGS1'],
                'category': 'treasury_rates'
            },
            # Makroekonomik Göstergeler
            'CPIAUCSL': {
                'name': 'ABD TÜFE',
                'description': 'Consumer Price Index for All Urban Consumers',
                'search_terms': ['CPI', 'inflation', 'consumer price index'],
                'category': 'inflation'
            },
            'UNRATE': {
                'name': 'ABD İşsizlik Oranı',
                'description': 'Unemployment Rate',
                'search_terms': ['unemployment', 'unemployment rate'],
                'category': 'employment'
            },
            'GDP': {
                'name': 'ABD GDP',
                'description': 'Gross Domestic Product',
                'search_terms': ['GDP', 'gross domestic product'],
                'category': 'growth'
            },
            # Döviz Kurları
            'DEXUSAL': {
                'name': 'USD/AUD',
                'description': 'U.S. / Australia Foreign Exchange Rate',
                'search_terms': ['USD AUD', 'australia dollar'],
                'category': 'exchange_rates'
            },
            'DEXCHUS': {
                'name': 'USD/CNY',
                'description': 'China U.S. Foreign Exchange Rate',
                'search_terms': ['USD CNY', 'china yuan', 'RMB'],
                'category': 'exchange_rates'
            },
            'DEXDEUS': {
                'name': 'USD/EUR',
                'description': 'U.S. / Euro Foreign Exchange Rate',
                'search_terms': ['USD EUR', 'euro exchange rate'],
                'category': 'exchange_rates'
            },
            'DEXJPUS': {
                'name': 'USD/JPY',
                'description': 'U.S. / Japan Foreign Exchange Rate',
                'search_terms': ['USD JPY', 'japanese yen'],
                'category': 'exchange_rates'
            },
            'DEXUKUS': {
                'name': 'USD/GBP',
                'description': 'U.S. / U.K. Foreign Exchange Rate',
                'search_terms': ['USD GBP', 'british pound'],
                'category': 'exchange_rates'
            }
        }
    
    def collect_single_series(self, series_id: str, start_date: str, end_date: str) -> Dict[str, Any]:
        """Tek bir seri için veri topla"""
        print(f"\\n--- {series_id} serisi toplanıyor ---")
        
        # Seri bilgilerini al
        series_info = self.fred.get_series_info(series_id)
        if not series_info:
            print(f"❌ {series_id}: Seri bilgisi alınamadı")
            return {}
        
        print(f"✅ {series_id}: {series_info.get('title', 'N/A')}")
        
        # Gözlemleri al
        observations = self.fred.get_series_observations(series_id, start_date, end_date, 'm')
        if not observations:
            print(f"❌ {series_id}: Gözlem verileri alınamadı")
            return {}
        
        print(f"✅ {series_id}: {len(observations)} gözlem alındı")
        
        # Yapılandırılmış veri oluştur
        data_points = []
        for obs in observations:
            if obs.get('value') and obs['value'] != '.' and obs['value'] != 'NaN':
                try:
                    data_points.append({
                        'date': obs['date'],
                        'value': float(obs['value']) if obs['value'] != '.' else None
                    })
                except (ValueError, TypeError):
                    continue
        
        series_data = {
            'series_id': series_id,
            'title': series_info.get('title', ''),
            'description': series_info.get('notes', ''),
            'frequency': series_info.get('frequency', ''),
            'units': series_info.get('units', ''),
            'data_start': series_info.get('observation_start', ''),
            'data_end': series_info.get('observation_end', ''),
            'record_count': len(data_points),
            'data': data_points
        }
        
        return series_data
    
    def collect_all_data(self, start_date: str = '2020-01-01', end_date: str = '2025-11-10') -> Dict[str, Any]:
        """Tüm serileri topla"""
        print(f"FRED API ile veri toplama başlıyor...")
        print(f"Tarih aralığı: {start_date} - {end_date}")
        print(f"Toplam seri sayısı: {len(self.series_config)}")
        
        results = {
            'collection_info': {
                'collection_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'api_key_present': bool(self.fred.api_key),
                'data_period': f"{start_date} to {end_date}",
                'frequency': 'Monthly',
                'start_date': start_date,
                'end_date': end_date
            },
            'series': {},
            'errors': []
        }
        
        total_successful = 0
        total_records = 0
        
        for series_id, config in self.series_config.items():
            try:
                series_data = self.collect_single_series(series_id, start_date, end_date)
                
                if series_data and series_data.get('data'):
                    results['series'][series_id] = series_data
                    total_successful += 1
                    total_records += series_data['record_count']
                    print(f"✅ Başarılı: {series_id} ({series_data['record_count']} kayıt)")
                else:
                    error_msg = f"{series_id}: Veri toplanamadı"
                    results['errors'].append(error_msg)
                    print(f"❌ Hata: {error_msg}")
                    
            except Exception as e:
                error_msg = f"{series_id}: Hata - {str(e)}"
                results['errors'].append(error_msg)
                print(f"❌ Hata: {error_msg}")
        
        # Özet bilgileri güncelle
        results['collection_info'].update({
            'total_series': len(self.series_config),
            'successful_series': total_successful,
            'failed_series': len(self.series_config) - total_successful,
            'total_records': total_records,
            'error_count': len(results['errors'])
        })
        
        print(f"\\n=== TOPLAMA ÖZETİ ===")
        print(f"Toplam seri: {results['collection_info']['total_series']}")
        print(f"Başarılı: {results['collection_info']['successful_series']}")
        print(f"Hatalı: {results['collection_info']['failed_series']}")
        print(f"Toplam kayıt: {total_records}")
        
        return results
    
    def save_data(self, data: Dict[str, Any], output_file: str) -> None:
        """Veriyi JSON dosyasına kaydet"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            print(f"\\n📁 Veri başarıyla {output_file} dosyasına kaydedildi!")
        except Exception as e:
            print(f"\\n❌ Dosya kaydetme hatası: {e}")
    
    def print_summary(self, data: Dict[str, Any]) -> None:
        """Veri özetini yazdır"""
        print("\\n" + "="*60)
        print("🔍 VERİ TOPLAMA ÖZET RAPORU")
        print("="*60)
        
        info = data.get('collection_info', {})
        print(f"📅 Toplama Tarihi: {info.get('collection_date', 'N/A')}")
        print(f"📊 Veri Periyodu: {info.get('data_period', 'N/A')}")
        print(f"🔑 API Key: {'Mevcut' if info.get('api_key_present') else 'Yok'}")
        print()
        print("📈 SERİ DURUMU:")
        print(f"  Toplam: {info.get('total_series', 0)}")
        print(f"  Başarılı: {info.get('successful_series', 0)}")
        print(f"  Hatalı: {info.get('failed_series', 0)}")
        print(f"  Toplam Kayıt: {info.get('total_records', 0)}")
        
        if data.get('errors'):
            print("\\n❌ HATALAR:")
            for error in data['errors'][:5]:  # İlk 5 hatayı göster
                print(f"  • {error}")
            if len(data['errors']) > 5:
                print(f"  ... ve {len(data['errors']) - 5} hata daha")
        
        print("\\n📊 BAŞARILI SERİLER:")
        for series_id, series_info in data.get('series', {}).items():
            name = series_info.get('title', series_id)
            records = series_info.get('record_count', 0)
            print(f"  {series_id}: {name[:30]}{'...' if len(name) > 30 else ''} ({records} kayıt)")
        print("="*60)

def main():
    """Ana fonksiyon"""
    # API anahtarını al
    api_key = os.getenv('FRED_API_KEY')
    if not api_key:
        print("❌ FRED_API_KEY environment variable bulunamadı!")
        print("Lütfen FRED API anahtarınızı ayarlayın:")
        print("export FRED_API_KEY='your_32_character_api_key_here'")
        print("\\n📖 Detaylı bilgi için: /workspace/data/FRED_API_SETUP.md dosyasını inceleyin")
        return
    
    try:
        # Veri toplayıcıyı başlat
        collector = MainDataCollector(api_key)
        
        # Verileri topla
        start_date = '2020-01-01'
        end_date = '2025-11-10'
        
        data = collector.collect_all_data(start_date, end_date)
        
        # Dosyaya kaydet
        output_file = '/workspace/data/fred_global_indicators.json'
        collector.save_data(data, output_file)
        
        # Özet rapor
        collector.print_summary(data)
        
        return data
        
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")
        return None

if __name__ == "__main__":
    main()