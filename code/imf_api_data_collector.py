#!/usr/bin/env python3
"""
IMF API Data Collector
Global ekonomik tahminler ve veriler toplama
"""

import requests
import json
import time
from typing import Dict, List, Any
import logging

# Logging kurulumu
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IMFDataCollector:
    def __init__(self):
        # IMF DataMapper API v1 base URL
        self.base_url = "https://www.imf.org/external/datamapper/api"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IMF-Data-Collector/1.0',
            'Accept': 'application/json'
        })
        
    def get_indicators(self) -> Dict[str, Any]:
        """Mevcut göstergeleri listele"""
        logger.info("IMF göstergeleri alınıyor...")
        try:
            response = self.session.get(f"{self.base_url}/indicators")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Göstergeler alınamadı: {e}")
            return {}
    
    def get_countries(self) -> Dict[str, Any]:
        """Ülke listesini al"""
        logger.info("IMF ülke listesi alınıyor...")
        try:
            response = self.session.get(f"{self.base_url}/countries")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ülke listesi alınamadı: {e}")
            return {}
    
    def get_regions(self) -> Dict[str, Any]:
        """Bölge listesini al"""
        logger.info("IMF bölge listesi alınıyor...")
        try:
            response = self.session.get(f"{self.base_url}/regions")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Bölge listesi alınamadı: {e}")
            return {}
    
    def get_time_series(self, indicator_id: str, country_ids: List[str] = None, periods: List[str] = None) -> Dict[str, Any]:
        """Belirli göstergeler için zaman serisi verileri al"""
        logger.info(f"Zaman serisi alınıyor: {indicator_id}")
        
        # URL parametrelerini oluştur
        params = []
        if country_ids:
            params.append("countries=" + ",".join(country_ids))
        if periods:
            params.append("periods=" + ",".join(periods))
        
        # URL'yi oluştur
        url = f"{self.base_url}/{indicator_id}"
        if params:
            url += "?" + "&".join(params)
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Zaman serisi alınamadı ({indicator_id}): {e}")
            return {}
    
    def collect_turkey_data(self) -> Dict[str, Any]:
        """Türkiye için ekonomik verileri topla"""
        logger.info("Türkiye verileri toplanıyor...")
        turkey_data = {}
        
        # Temel göstergeleri tanımla
        indicators = {
            "NGDPD": "GDP current prices (billions USD)",  # Nominal GSYH
            "NGDPDPC": "GDP per capita current prices",  # Kişi başına GSYH
            "LUR": "Unemployment rate",  # İşsizlik oranı
            "BCA_NGDP": "Current account balance (% of GDP)",  # Cari denge
            "PCPI": "Consumer prices, average consumer prices (inflation)",  # Enflasyon
            "PCPI_Index": "Consumer prices index",  # Tüketici fiyat endeksi
        }
        
        # 2024-2026 dönemini hedefle
        target_periods = ["2024", "2025", "2026"]
        
        for indicator_code, description in indicators.items():
            logger.info(f"  - {indicator_code}: {description}")
            time_series = self.get_time_series(indicator_code, ["TUR"], target_periods)
            if time_series:
                turkey_data[indicator_code] = {
                    "description": description,
                    "data": time_series
                }
            time.sleep(0.5)  # Rate limiting
        
        return turkey_data
    
    def collect_global_data(self) -> Dict[str, Any]:
        """Global ve bölgesel ekonomik verileri topla"""
        logger.info("Global veriler toplanıyor...")
        global_data = {}
        
        # Global göstergeler
        global_indicators = {
            "NGDPD": "World GDP current prices",
            "NGDPDWEO": "WEO World GDP",  # WEO özel global GDP
            "PCPI": "Global consumer prices (inflation)",
            "LUR": "Global unemployment rate",
        }
        
        # Global bölge ID'leri
        region_ids = {
            "WEO": "World",
            "EMDC": "Emerging market and developing economies", 
            "OEDC": "Advanced economies",
            "EUR": "Europe",
            "Asia": "Asia and Pacific",
            "LAC": "Latin America and Caribbean",
            "MENA": "Middle East and North Africa"
        }
        
        target_periods = ["2024", "2025", "2026"]
        
        for indicator_code, description in global_indicators.items():
            logger.info(f"  - Global: {indicator_code}")
            
            # Global toplam için
            global_series = self.get_time_series(indicator_code, ["WEO"], target_periods)
            if global_series:
                global_data[indicator_code] = {
                    "description": description,
                    "world": global_series
                }
            
            # Bölgesel veriler için
            for region_id, region_name in region_ids.items():
                if region_id == "WEO":  # Dünya için zaten aldık
                    continue
                    
                region_series = self.get_time_series(indicator_code, [region_id], target_periods)
                if region_series:
                    if indicator_code not in global_data:
                        global_data[indicator_code] = {"description": description}
                    
                    global_data[indicator_code][region_name] = region_series
            
            time.sleep(0.5)  # Rate limiting
        
        return global_data
    
    def collect_weo_data(self) -> Dict[str, Any]:
        """WEO (World Economic Outlook) özel verilerini topla"""
        logger.info("WEO verileri toplanıyor...")
        weo_data = {}
        
        # WEO spesifik göstergeler
        weo_indicators = {
            "WEO-GDP": "WEO Real GDP growth",
            "WEO-PCPI": "WEO Consumer prices", 
            "WEO-LUR": "WEO Unemployment rate",
            "WEO-BCA": "WEO Current account balance",
        }
        
        # Global ve Türkiye için WEO verileri
        target_entities = ["TUR", "WEO"]
        target_periods = ["2024", "2025", "2026"]
        
        for indicator_code, description in weo_indicators.items():
            logger.info(f"  - WEO: {indicator_code}")
            weo_series = self.get_time_series(indicator_code, target_entities, target_periods)
            if weo_series:
                weo_data[indicator_code] = {
                    "description": description,
                    "data": weo_series
                }
            time.sleep(0.5)
        
        return weo_data
    
    def collect_all_data(self) -> Dict[str, Any]:
        """Tüm verileri topla ve birleştir"""
        logger.info("=== IMF VERİ TOPLAMA BAŞLATIYOR ===")
        
        # Metadata
        collection_time = time.strftime("%Y-%m-%d %H:%M:%S")
        
        all_data = {
            "metadata": {
                "collection_timestamp": collection_time,
                "data_sources": [
                    "IMF DataMapper API v1",
                    "IMF Data API",
                    "World Economic Outlook (WEO)"
                ],
                "target_period": "2024-2026",
                "description": "Global ekonomik tahminler ve veriler"
            },
            "turkey": {},
            "global": {},
            "weo": {},
            "reference": {
                "available_indicators": {},
                "available_countries": {},
                "available_regions": {}
            }
        }
        
        # Referans verileri
        try:
            all_data["reference"]["available_indicators"] = self.get_indicators()
            all_data["reference"]["available_countries"] = self.get_countries()
            all_data["reference"]["available_regions"] = self.get_regions()
        except Exception as e:
            logger.error(f"Referans veriler alınamadı: {e}")
        
        # Türkiye verileri
        try:
            all_data["turkey"] = self.collect_turkey_data()
        except Exception as e:
            logger.error(f"Türkiye verileri toplanamadı: {e}")
        
        # Global veriler
        try:
            all_data["global"] = self.collect_global_data()
        except Exception as e:
            logger.error(f"Global veriler toplanamadı: {e}")
        
        # WEO verileri
        try:
            all_data["weo"] = self.collect_weo_data()
        except Exception as e:
            logger.error(f"WEO verileri toplanamadı: {e}")
        
        logger.info("=== VERİ TOPLAMA TAMAMLANDI ===")
        return all_data

def main():
    """Ana fonksiyon"""
    logger.info("IMF Data Collector başlatılıyor...")
    
    collector = IMFDataCollector()
    
    # Veri toplama
    data = collector.collect_all_data()
    
    # Data klasörünü oluştur
    import os
    os.makedirs("/workspace/data", exist_ok=True)
    
    # Verileri kaydet
    output_file = "/workspace/data/imf_global_forecasts.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Veriler kaydedildi: {output_file}")
    
    # Özet bilgileri yazdır
    print("\n" + "="*50)
    print("IMF GLOBAL EKONOMİK VERİLER - TOPLAMA ÖZETİ")
    print("="*50)
    print(f"Toplama zamanı: {data['metadata']['collection_timestamp']}")
    print(f"Veri kaynakları: {', '.join(data['metadata']['data_sources'])}")
    print(f"Hedef dönem: {data['metadata']['target_period']}")
    
    if data.get('turkey'):
        print(f"\nTürkiye göstergeleri: {len(data['turkey'])}")
        for key, value in data['turkey'].items():
            print(f"  - {key}: {value.get('description', 'Açıklama yok')}")
    
    if data.get('global'):
        print(f"\nGlobal göstergeler: {len(data['global'])}")
        for key, value in data['global'].items():
            print(f"  - {key}: {value.get('description', 'Açıklama yok')}")
    
    if data.get('weo'):
        print(f"\nWEO göstergeleri: {len(data['weo'])}")
        for key, value in data['weo'].items():
            print(f"  - {key}: {value.get('description', 'Açıklama yok')}")
    
    print(f"\nTam veri dosyası: {output_file}")
    print("="*50)

if __name__ == "__main__":
    main()
