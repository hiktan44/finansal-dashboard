#!/usr/bin/env python3
"""
Gerçek API Entegrasyonu - OECD, FRED, ECB, IMF
Tüm kurumlardan gerçek verileri çekme
"""

import requests
import json
import time
import os
from datetime import datetime
import pandas as pd

class RealAPIDataCollector:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'EconomicDataCollector/2.0 (Research Project)',
            'Accept': 'application/json'
        })
    
    def collect_oecd_data_real(self):
        """OECD API'den gerçek veri çekme - Ücretsiz"""
        print("🏢 OECD gerçek verileri çekiliyor...")
        
        try:
            # OECD SDMX-JSON API endpoints
            # Consumer Price Index
            cpi_url = "https://stats.oecd.org/SDMX-JSON/data/CPALTT01/USA/all?startTime=2020-01&endTime=2024-12"
            cpi_response = self.session.get(cpi_url, timeout=30)
            
            # Industrial Production  
            ip_url = "https://stats.oecd.org/SDMX-JSON/data/KEI/USA/PRMO/LO?startTime=2020-01&endTime=2024-12"
            ip_response = self.session.get(ip_url, timeout=30)
            
            # Unemployment Rate
            unemp_url = "https://stats.oecd.org/SDMX-JSON/data/LRHUTTTT/USA/all?startTime=2020-01&endTime=2024-12"
            unemp_response = self.session.get(unemp_url, timeout=30)
            
            cpi_data = cpi_response.json() if cpi_response.status_code == 200 else None
            ip_data = ip_response.json() if ip_response.status_code == 200 else None
            unemp_data = unemp_response.json() if unemp_response.status_code == 200 else None
            
            print(f"📊 OECD API durumu:")
            print(f"  - CPI: {'✅' if cpi_data else '❌'} ({cpi_response.status_code})")
            print(f"  - Industrial Production: {'✅' if ip_data else '❌'} ({ip_response.status_code})")
            print(f"  - Unemployment: {'✅' if unemp_data else '❌'} ({unemp_response.status_code})")
            
            # Alternative OECD endpoints
            alternative_urls = [
                "https://sdmx.oecd.org/public/rest/data/CPALTT01.USA.L.1CCIX",
                "https://sdmx.oecd.org/public/rest/data/KEI.PRMQ.LL.L"
            ]
            
            for url in alternative_urls:
                try:
                    resp = self.session.get(url, timeout=15)
                    if resp.status_code == 200:
                        print(f"✅ Alternatif OECD endpoint çalışıyor: {url[:50]}...")
                        break
                except:
                    continue
                    
            return {
                "cpi_api_status": cpi_response.status_code,
                "industrial_production_api_status": ip_response.status_code,
                "unemployment_api_status": unemp_response.status_code,
                "data_received": {
                    "cpi": bool(cpi_data),
                    "industrial_production": bool(ip_data),
                    "unemployment": bool(unemp_data)
                }
            }
            
        except Exception as e:
            print(f"❌ OECD API hatası: {e}")
            return {"error": str(e)}
    
    def collect_fred_data_real(self):
        """FRED API'den gerçek veri çekme - API key gerekiyor"""
        print("🇺🇸 FRED gerçek verileri çekiliyor...")
        
        try:
            # FRED API endpoints (API key olmadan deneyebilirim)
            # Federal Funds Rate
            fred_funds_url = "https://api.stlouisfed.org/fred/series/observations"
            fred_params = {
                'series_id': 'FEDFUNDS',
                'file_type': 'json',
                'observation_start': '2020-01-01',
                'observation_end': '2024-12-31'
            }
            
            # Unemployment Rate
            fred_unemp_url = "https://api.stlouisfed.org/fred/series/observations"
            fred_unemp_params = {
                'series_id': 'UNRATE',
                'file_type': 'json',
                'observation_start': '2020-01-01',
                'observation_end': '2024-12-31'
            }
            
            # API key olmadan deneme
            funds_response = self.session.get(fred_funds_url, params=fred_params, timeout=30)
            unemp_response = self.session.get(fred_unemp_url, params=fred_unemp_params, timeout=30)
            
            print(f"📊 FRED API durumu:")
            print(f"  - Federal Funds Rate: {funds_response.status_code}")
            print(f"  - Unemployment Rate: {unemp_response.status_code}")
            
            if funds_response.status_code == 200:
                funds_data = funds_response.json()
                print(f"✅ FRED verisi alındı: {len(funds_data.get('observations', []))} gözlem")
                return {
                    "status": "success",
                    "data_received": bool(funds_data.get('observations')),
                    "observation_count": len(funds_data.get('observations', []))
                }
            else:
                return {
                    "status": "api_key_required",
                    "funds_status": funds_response.status_code,
                    "unemployment_status": unemp_response.status_code
                }
                
        except Exception as e:
            print(f"❌ FRED API hatası: {e}")
            return {"error": str(e)}
    
    def collect_ecb_data_real(self):
        """ECB API'den gerçek veri çekme"""
        print("🇪🇺 ECB gerçek verileri çekiliyor...")
        
        try:
            # ECB SDMX API endpoints
            # Main refinancing operations rate
            ecb_mro_url = "https://sdw.ecb.europa.eu/SDMX_JSON/data/IRS/M.LL.L40.CI.AB.MN.R.EUR.4F.G_N.A.S.C.B.EUR._Z.L.BP"
            
            # Interest rate statistics
            ecb_interest_url = "https://sdw.ecb.europa.eu/SDMX_JSON/data/IRF/M.N.L40.CI.AB.MR.EUR._Z.LOP.C.P.CPT"
            
            mro_response = self.session.get(ecb_mro_url, timeout=30)
            interest_response = self.session.get(ecb_interest_url, timeout=30)
            
            print(f"📊 ECB API durumu:")
            print(f"  - MRO Rate: {mro_response.status_code}")
            print(f"  - Interest Stats: {interest_response.status_code}")
            
            if mro_response.status_code == 200:
                mro_data = mro_response.json()
                print(f"✅ ECB verisi alındı")
                return {
                    "status": "success",
                    "mro_data_received": bool(mro_data),
                    "interest_data_received": bool(interest_response.json() if interest_response.status_code == 200 else False)
                }
            else:
                return {
                    "status": "api_access_issue",
                    "mro_status": mro_response.status_code,
                    "interest_status": interest_response.status_code
                }
                
        except Exception as e:
            print(f"❌ ECB API hatası: {e}")
            return {"error": str(e)}
    
    def collect_imf_data_real(self):
        """IMF API'den gerçek veri çekme"""
        print("🌐 IMF gerçek verileri çekiliyor...")
        
        try:
            # IMF DataMapper API (public access)
            imf_gdp_url = "https://www.imf.org/external/datamapper/api/v1/series/NGDP_RPCH"
            
            # WEO API
            weo_url = "https://dataservices.imf.org/REST/SDMX_JSON.svc/CodeList/CL_INDICATOR_WEO_EA"
            
            gdp_response = self.session.get(imf_gdp_url, timeout=30)
            weo_response = self.session.get(weo_url, timeout=30)
            
            print(f"📊 IMF API durumu:")
            print(f"  - GDP Data: {gdp_response.status_code}")
            print(f"  - WEO Codes: {weo_response.status_code}")
            
            return {
                "status": "tested",
                "gdp_api_status": gdp_response.status_code,
                "weo_api_status": weo_response.status_code,
                "data_received": False  # Test only
            }
            
        except Exception as e:
            print(f"❌ IMF API hatası: {e}")
            return {"error": str(e)}
    
    def test_all_apis(self):
        """Tüm API'leri test et"""
        print("🚀 Tüm gerçek API'leri test ediliyor...")
        print("=" * 60)
        
        results = {
            "collection_timestamp": datetime.now().isoformat(),
            "api_tests": {
                "oecd": self.collect_oecd_data_real(),
                "fred": self.collect_fred_data_real(), 
                "ecb": self.collect_ecb_data_real(),
                "imf": self.collect_imf_data_real()
            }
        }
        
        print("=" * 60)
        print("📊 API Test Özeti:")
        for api, result in results["api_tests"].items():
            if "error" in result:
                print(f"  - {api.upper()}: ❌ Hata")
            else:
                print(f"  - {api.upper()}: ✅ Test tamamlandı")
        
        return results

def main():
    print("🔍 Gerçek API Entegrasyonu Başlatılıyor...")
    print("Kurumlar: OECD, FRED, ECB, IMF")
    print("=" * 60)
    
    collector = RealAPIDataCollector()
    results = collector.test_all_apis()
    
    # Sonuçları kaydet
    os.makedirs("data/api_test_results", exist_ok=True)
    
    with open("data/api_test_results/api_integration_test.json", 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("=" * 60)
    print("✅ API testi tamamlandı!")
    print("📄 Detaylı sonuçlar: data/api_test_results/api_integration_test.json")
    
    return results

if __name__ == "__main__":
    test_results = main()
