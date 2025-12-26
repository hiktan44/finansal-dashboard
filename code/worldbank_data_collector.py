#!/usr/bin/env python3
"""
World Bank API v2'dan kalkınma göstergelerini toplama scripti
Türkiye ve G20 ülkeleri için 2020-2025 dönem verileri
"""

import requests
import json
import time
from typing import Dict, List, Any
import os

class WorldBankAPIClient:
    """World Bank API v2 istemcisi"""
    
    def __init__(self, base_url: str = "https://api.worldbank.org/v2"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'WorldBank Data Collector/1.0'
        })
    
    def get_indicator_data(self, country_code: str, indicator_code: str, 
                          start_year: int = 2020, end_year: int = 2025) -> Dict[str, Any]:
        """
        Belirli bir ülke ve gösterge için veri toplar
        
        Args:
            country_code: Ülke kodu (örn: TUR, USA)
            indicator_code: Gösterge kodu (örn: NY.GDP.PCAP.CD)
            start_year: Başlangıç yılı
            end_year: Bitiş yılı
        
        Returns:
            API yanıt verisi
        """
        url = f"{self.base_url}/country/{country_code}/indicator/{indicator_code}"
        params = {
            'date': f'{start_year}:{end_year}',
            'format': 'json',
            'per_page': '20000'  # Yüksek sayfa boyutu
        }
        
        try:
            print(f"Fetching data: {country_code} - {indicator_code}")
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if not data or len(data) < 2:
                return {"error": f"No data returned for {country_code}-{indicator_code}"}
            
            return data[1] if len(data) > 1 else data[0]
            
        except requests.exceptions.RequestException as e:
            return {"error": f"API request failed: {str(e)}"}
        except json.JSONDecodeError as e:
            return {"error": f"JSON decode error: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}

class WorldBankDataCollector:
    """World Bank veri toplayıcı ana sınıf"""
    
    def __init__(self):
        self.api_client = WorldBankAPIClient()
        self.g20_countries = {
            "ARG": "Argentina",
            "AUS": "Australia", 
            "BRA": "Brazil",
            "CAN": "Canada",
            "CHN": "China",
            "FRA": "France",
            "DEU": "Germany",
            "IND": "India",
            "IDN": "Indonesia", 
            "ITA": "Italy",
            "JPN": "Japan",
            "KOR": "South Korea",
            "MEX": "Mexico",
            "RUS": "Russia",
            "SAU": "Saudi Arabia",
            "ZAF": "South Africa",
            "TUR": "Turkey",
            "GBR": "United Kingdom",
            "USA": "United States"
        }
        
        # AB ve Afrika Birliği için özel işlem gerekiyor
        self.special_entities = {
            "EUU": "European Union",
            "AFR": "African Union"
        }
        
        self.indicators = {
            "NY.GDP.PCAP.CD": "GDP per capita (current US$)",
            "NE.EXP.GNFS.ZS": "Exports of goods and services (% of GDP)",
            "NE.IMP.GNFS.ZS": "Imports of goods and services (% of GDP)", 
            "FP.CPI.TOTL.ZG": "Inflation, consumer prices (annual %)"
        }
        
        self.collected_data = {
            "metadata": {
                "collection_date": time.strftime("%Y-%m-%d %H:%M:%S"),
                "api_version": "v2",
                "data_period": "2020-2025",
                "countries_covered": len(self.g20_countries),
                "indicators_collected": len(self.indicators)
            },
            "turkey_data": {},
            "g20_data": {}
        }
    
    def collect_turkey_data(self) -> Dict[str, Any]:
        """Türkiye verilerini toplar"""
        print("\n=== Türkiye Verilerini Toplama ===")
        
        turkey_data = {}
        
        for indicator_code, indicator_name in self.indicators.items():
            print(f"\nToplanıyor: {indicator_name}")
            data = self.api_client.get_indicator_data("TUR", indicator_code)
            
            if "error" in data:
                print(f"Hata: {data['error']}")
                turkey_data[indicator_code] = {"error": data["error"]}
            else:
                print(f"✓ Başarıyla toplandı: {len(data)} kayıt")
                turkey_data[indicator_code] = {
                    "indicator_name": indicator_name,
                    "data": data
                }
        
        return turkey_data
    
    def collect_g20_data(self) -> Dict[str, Any]:
        """G20 ülkelerinin verilerini toplar"""
        print("\n=== G20 Ülkeleri Verilerini Toplama ===")
        
        g20_data = {}
        total_requests = len(self.g20_countries) * len(self.indicators)
        current_request = 0
        
        for country_code, country_name in self.g20_countries.items():
            print(f"\n--- {country_name} ({country_code}) ---")
            g20_data[country_code] = {
                "country_name": country_name,
                "indicators": {}
            }
            
            for indicator_code, indicator_name in self.indicators.items():
                current_request += 1
                print(f"[{current_request}/{total_requests}] Toplanıyor: {indicator_name}")
                
                data = self.api_client.get_indicator_data(country_code, indicator_code)
                
                if "error" in data:
                    print(f"  Hata: {data['error']}")
                    g20_data[country_code]["indicators"][indicator_code] = {"error": data["error"]}
                else:
                    print(f"  ✓ Başarıyla toplandı: {len(data)} kayıt")
                    g20_data[country_code]["indicators"][indicator_code] = {
                        "indicator_name": indicator_name,
                        "data": data
                    }
                
                # API rate limiting için kısa bekleme
                time.sleep(0.5)
        
        return g20_data
    
    def collect_all_data(self) -> Dict[str, Any]:
        """Tüm verileri toplar"""
        print("World Bank API v2'den veri toplama başlıyor...")
        print(f"Toplanacak ülke sayısı: {len(self.g20_countries)}")
        print(f"Toplanacak gösterge sayısı: {len(self.indicators)}")
        print(f"Toplam API çağrısı: {len(self.g20_countries) * len(self.indicators) + len(self.indicators)}")
        
        # Türkiye verilerini topla
        turkey_data = self.collect_turkey_data()
        self.collected_data["turkey_data"] = turkey_data
        
        # G20 ülkeleri verilerini topla
        g20_data = self.collect_g20_data()
        self.collected_data["g20_data"] = g20_data
        
        return self.collected_data
    
    def save_data(self, output_file: str = "data/worldbank_indicators.json"):
        """Verileri JSON dosyasına kaydeder"""
        try:
            # Data dizinini oluştur
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.collected_data, f, ensure_ascii=False, indent=2)
            
            print(f"\n✓ Veriler başarıyla kaydedildi: {output_file}")
            return True
            
        except Exception as e:
            print(f"\n✗ Dosya kaydetme hatası: {str(e)}")
            return False
    
    def generate_summary(self) -> Dict[str, Any]:
        """Toplanan verilerin özetini oluşturur"""
        summary = {
            "total_countries": len(self.g20_countries),
            "countries_with_data": 0,
            "total_indicators": len(self.indicators),
            "data_period": "2020-2025",
            "turkey_data_status": "completed" if self.collected_data.get("turkey_data") else "pending",
            "g20_data_status": "completed" if self.collected_data.get("g20_data") else "pending"
        }
        
        # G20 ülkeler için veri durumu
        g20_status = {}
        for country_code, country_data in self.collected_data.get("g20_data", {}).items():
            successful_indicators = 0
            for indicator_code in self.indicators.keys():
                if (indicator_code in country_data.get("indicators", {}) and 
                    "error" not in country_data["indicators"][indicator_code]):
                    successful_indicators += 1
            
            g20_status[country_code] = {
                "country_name": country_data.get("country_name", country_code),
                "successful_indicators": successful_indicators,
                "total_indicators": len(self.indicators),
                "completion_rate": f"{(successful_indicators / len(self.indicators)) * 100:.1f}%"
            }
            
            if successful_indicators == len(self.indicators):
                summary["countries_with_data"] += 1
        
        summary["g20_status"] = g20_status
        summary["overall_completion"] = f"{(summary['countries_with_data'] / summary['total_countries']) * 100:.1f}%"
        
        return summary

def main():
    """Ana fonksiyon"""
    print("=" * 60)
    print("WORLD BANK API v2 VERİ TOPLAMA")
    print("Türkiye ve G20 Ülkeleri - Kalkınma Göstergeleri")
    print("=" * 60)
    
    collector = WorldBankDataCollector()
    
    try:
        # Verileri topla
        all_data = collector.collect_all_data()
        
        # Verileri kaydet
        success = collector.save_data()
        
        # Özet oluştur ve kaydet
        if success:
            summary = collector.generate_summary()
            print("\n" + "=" * 40)
            print("TOPLAMA ÖZETİ")
            print("=" * 40)
            print(f"Toplam ülke: {summary['total_countries']}")
            print(f"Başarılı ülke: {summary['countries_with_data']}")
            print(f"Genel tamamlanma: {summary['overall_completion']}")
            print(f"Türkiye verisi: {summary['turkey_data_status']}")
            
            # G20 ülke detayları
            print(f"\nG20 Ülke Detayları:")
            for country_code, status in summary['g20_status'].items():
                print(f"  {status['country_name']}: {status['completion_rate']} tamamlandı")
            
            # Özet dosyasını da kaydet
            with open("data/worldbank_collection_summary.json", 'w', encoding='utf-8') as f:
                json.dump(summary, f, ensure_ascii=False, indent=2)
            
            print(f"\n✓ Özet kaydedildi: data/worldbank_collection_summary.json")
        else:
            print("✗ Veri kaydetme başarısız oldu")
            return 1
            
    except KeyboardInterrupt:
        print("\n\nKullanıcı tarafından iptal edildi")
        return 1
    except Exception as e:
        print(f"\n\nBeklenmeyen hata: {str(e)}")
        return 1
    
    print("\n✓ Veri toplama tamamlandı!")
    return 0

if __name__ == "__main__":
    exit(main())
