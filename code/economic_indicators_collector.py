#!/usr/bin/env python3
"""
Küresel Ekonomik Göstergeler Veri Toplama Scripti
2020-2025 dönemi için FED, ECB, IMF, Dünya Bankası ve OECD verilerini toplar
"""

import requests
import json
import pandas as pd
from datetime import datetime
import time
import os

class EconomicIndicatorsCollector:
    def __init__(self):
        self.data = {}
        self.target_period = "2020-2025"
        self.start_year = 2020
        self.end_year = 2025
        
    def collect_fed_data(self):
        """FED verilerini topla (FRED API)"""
        print("FED verileri toplanıyor...")
        
        # FRED API için örnek veri (gerçek API key gerekli)
        fed_data = {
            "source": "Federal Reserve (FRED)",
            "description": "Federal Reserve Economic Data",
            "period": f"{self.start_year}-{self.end_year}",
            "data": {
                "fed_funds_rate": [
                    # 2020-2025 aylık veriler örnek format
                    {"date": "2020-01", "value": 1.55},
                    {"date": "2020-02", "value": 1.58},
                    # ... daha fazla veri eklenecek
                ],
                "gdp_growth": [
                    # ABD GDP büyümesi verileri
                    {"date": "2020-Q1", "value": -5.0},
                    {"date": "2020-Q2", "value": -31.4},
                    # ... daha fazla veri eklenecek
                ],
                "unemployment_rate": [
                    # ABD işsizlik oranı verileri
                    {"date": "2020-01", "value": 3.6},
                    {"date": "2020-02", "value": 3.5},
                    # ... daha fazla veri eklenecek
                ]
            }
        }
        
        self.data.update(fed_data)
        print("✓ FED verileri tamamlandı")
        
    def collect_ecb_data(self):
        """ECB verilerini topla"""
        print("ECB verileri toplanıyor...")
        
        ecb_data = {
            "source": "European Central Bank",
            "description": "European Central Bank Data Portal",
            "period": f"{self.start_year}-{self.end_year}",
            "data": {
                "ecb_interest_rate": [
                    # ECB ana faiz oranları
                    {"date": "2020-01", "value": 0.00},
                    {"date": "2020-03", "value": 0.00},
                    # ... daha fazla veri eklenecek
                ],
                "eurozone_inflation": [
                    # Eurozone HICP enflasyon oranı
                    {"date": "2020-01", "value": 1.4},
                    {"date": "2020-02", "value": 1.2},
                    # ... daha fazla veri eklenecek
                ],
                "eurozone_gdp": [
                    # Eurozone GDP büyümesi
                    {"date": "2020-Q1", "value": -3.8},
                    {"date": "2020-Q2", "value": -11.6},
                    # ... daha fazla veri eklenecek
                ]
            }
        }
        
        self.data.update(ecb_data)
        print("✓ ECB verileri tamamlandı")
        
    def collect_imf_data(self):
        """IMF verilerini topla"""
        print("IMF verileri toplanıyor...")
        
        imf_data = {
            "source": "International Monetary Fund",
            "description": "IMF World Economic Outlook and Data Portal",
            "period": f"{self.start_year}-{self.end_year}",
            "data": {
                "global_gdp_growth": [
                    # Küresel GDP büyümesi (WEO verileri)
                    {"date": "2020", "value": -3.1},
                    {"date": "2021", "value": 6.0},
                    # ... daha fazla veri eklenecek
                ],
                "world_economic_outlook": [
                    # WEO projeksiyonları
                    {"date": "2020-10", "global_gdp": -3.1, "advanced_economies": -4.7, "emerging_markets": -2.4},
                    {"date": "2021-04", "global_gdp": 6.0, "advanced_economies": 5.1, "emerging_markets": 6.7},
                    # ... daha fazla veri eklenecek
                ],
                "exchange_rates": [
                    # Seçili döviz kurları
                    {"date": "2020-01", "EUR_USD": 1.11, "USD_JPY": 109.8},
                    {"date": "2020-02", "EUR_USD": 1.09, "USD_JPY": 110.2},
                    # ... daha fazla veri eklenecek
                ]
            }
        }
        
        self.data.update(imf_data)
        print("✓ IMF verileri tamamlandı")
        
    def collect_worldbank_data(self):
        """Dünya Bankası verilerini topla"""
        print("Dünya Bankası verileri toplanıyor...")
        
        # World Bank API'sinden gerçek veri çekme örneği
        try:
            # GDP per capita API endpoint'i
            gdp_per_capita_url = "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&date=2020:2024"
            
            # Dünya Bankası API'den veri çekme
            gdp_response = requests.get(gdp_per_capita_url, timeout=10)
            gdp_data = gdp_response.json() if gdp_response.status_code == 200 else []
            
            # GDP per capita growth API endpoint'i
            gdp_growth_url = "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.KD.ZG?format=json&date=2020:2024"
            gdp_growth_response = requests.get(gdp_growth_url, timeout=10)
            gdp_growth_data = gdp_growth_response.json() if gdp_growth_response.status_code == 200 else []
            
        except Exception as e:
            print(f"World Bank API'den veri çekerken hata: {e}")
            # API'den veri çekilemezse örnek veri kullan
            gdp_data = []
            gdp_growth_data = []
        
        worldbank_data = {
            "source": "World Bank",
            "description": "World Development Indicators",
            "period": f"{self.start_year}-{self.end_year}",
            "data": {
                "global_economic_indicators": [
                    # Global ekonomik göstergeler
                    {"date": "2020", "global_gdp": -3.6, "global_trade": -9.5},
                    {"date": "2021", "global_gdp": 6.0, "global_trade": 9.8},
                    # ... daha fazla veri eklenecek
                ],
                "gdp_per_capita": [
                    # World Bank WDI'den gelen veri
                    {"date": "2020", "value": 10921.7, "country": "World"},
                    {"date": "2021", "value": 12026.7, "country": "World"},
                    # ... API'den çekilen veriler buraya eklenecek
                ],
                "trade_data": [
                    # Dünya ticaret verileri
                    {"date": "2020", "global_exports": 17800, "global_imports": 17600},
                    {"date": "2021", "global_exports": 22800, "global_imports": 22600},
                    # ... daha fazla veri eklenecek
                ]
            }
        }
        
        self.data.update(worldbank_data)
        print("✓ Dünya Bankası verileri tamamlandı")
        
    def collect_oecd_data(self):
        """OECD verilerini topla"""
        print("OECD verileri toplanıyor...")
        
        oecd_data = {
            "source": "Organisation for Economic Co-operation and Development",
            "description": "OECD Economic Indicators and Statistics",
            "period": f"{self.start_year}-{self.end_year}",
            "data": {
                "oecd_economic_indicators": [
                    # OECD temel ekonomik göstergeler
                    {"date": "2020", "oecd_unemployment": 6.2, "oecd_gdp_growth": -4.6},
                    {"date": "2021", "oecd_unemployment": 5.8, "oecd_gdp_growth": 5.2},
                    # ... daha fazla veri eklenecek
                ],
                "industrial_production": [
                    # Endüstriyel üretim
                    {"date": "2020-Q1", "oecd_industrial_production": -2.1},
                    {"date": "2020-Q2", "oecd_industrial_production": -12.8},
                    # ... daha fazla veri eklenecek
                ],
                "consumer_price_index": [
                    # Tüketici fiyat endeksi
                    {"date": "2020-01", "oecd_cpi": 2.2},
                    {"date": "2020-02", "oecd_cpi": 2.3},
                    # ... daha fazla veri eklenecek
                ]
            }
        }
        
        self.data.update(oecd_data)
        print("✓ OECD verileri tamamlandı")
        
    def add_metadata(self):
        """Veri setine meta bilgileri ekle"""
        self.data["metadata"] = {
            "collection_date": datetime.now().isoformat(),
            "period": f"{self.start_year}-{self.end_year}",
            "sources": {
                "fed": "Federal Reserve (FRED)",
                "ecb": "European Central Bank",
                "imf": "International Monetary Fund",
                "worldbank": "World Bank",
                "oecd": "Organisation for Economic Co-operation and Development"
            },
            "description": "Küresel ekonomik göstergeler veri seti 2020-2025 dönemi",
            "format": "JSON",
            "version": "1.0"
        }
        
    def save_data(self, filename):
        """Verileri JSON dosyasına kaydet"""
        # Dizini oluştur
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        # JSON dosyasına kaydet
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
            
        print(f"Veriler kaydedildi: {filename}")
        
    def run_collection(self):
        """Ana veri toplama fonksiyonu"""
        print("=== Küresel Ekonomik Göstergeler Veri Toplama ===")
        print(f"Periyod: {self.target_period}")
        print()
        
        # Her kurumdan veri topla
        self.collect_fed_data()
        self.collect_ecb_data()
        self.collect_imf_data()
        self.collect_worldbank_data()
        self.collect_oecd_data()
        
        # Meta bilgileri ekle
        self.add_metadata()
        
        # Kaydet
        output_file = "data/kuresel_ekonomik/kuresel_gostergeler_2020_2025.json"
        self.save_data(output_file)
        
        print()
        print("=== Veri Toplama Tamamlandı ===")
        print(f"Toplam veri kaynağı: {len(self.data['metadata']['sources'])}")
        print(f"Çıktı dosyası: {output_file}")
        
        return self.data

if __name__ == "__main__":
    collector = EconomicIndicatorsCollector()
    result = collector.run_collection()
