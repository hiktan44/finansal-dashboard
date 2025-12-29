#!/usr/bin/env python3
"""
OECD Industrial Production Veri Çekme
Küçük parçalar halinde
"""

import requests
import json
import time
import os
from datetime import datetime

def test_oecd_industrial():
    """OECD Industrial Production'yi test et"""
    print("🏢 OECD Industrial Production test...")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'EconomicDataCollector/2.0'
    })
    
    # Çalışan endpoint'i dene
    url = "https://stats.oecd.org/SDMX-JSON/data/KEI/USA.PRMO.INDICATOR/USA?startTime=2020&endTime=2024"
    
    try:
        print(f"📡 API çağrısı yapılıyor...")
        response = session.get(url, timeout=20)
        
        print(f"📊 Durum kodu: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Basit veri çıkarma
            obs_count = 0
            if 'data' in data:
                obs_data = data['data']
                if 'observations' in obs_data:
                    obs_count = len(obs_data['observations'])
            
            print(f"✅ Başarı! {obs_count} gözlem bulundu")
            
            return {
                "status": "success",
                "observations": obs_count,
                "data_sample": str(data)[:200] + "..." if len(str(data)) > 200 else str(data)
            }
        else:
            print(f"❌ Hata kodu: {response.status_code}")
            return {"status": "error", "code": response.status_code}
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return {"error": str(e)}

def test_fred_web_access():
    """FRED web erişimini test et"""
    print("🇺🇸 FRED web erişimi test...")
    
    session = requests.Session()
    
    urls = [
        "https://fred.stlouisfed.org/series/FEDFUNDS",
        "https://fred.stlouisfed.org/series/UNRATE"
    ]
    
    results = {}
    
    for url in urls:
        try:
            print(f"  📄 {url}")
            response = session.get(url, timeout=15)
            
            results[url.split("/")[-1]] = {
                "status": response.status_code,
                "accessible": response.status_code == 200,
                "title_found": "Federal Funds" in response.text or "Unemployment" in response.text
            }
            
            if response.status_code == 200:
                print(f"    ✅ Erişilebilir")
            else:
                print(f"    ❌ Hata: {response.status_code}")
                
        except Exception as e:
            results[url.split("/")[-1]] = {"error": str(e)}
            print(f"    ❌ Exception: {str(e)[:50]}...")
    
    return results

def test_oecd_alternative():
    """OECD alternatif endpoint'leri test et"""
    print("🔍 OECD alternatif endpoint'ler...")
    
    session = requests.Session()
    
    endpoints = [
        "https://stats.oecd.org/SDMX-JSON/data/MEI/USA.PRV.FS&lang=en&startTime=2020&endTime=2024"
    ]
    
    results = {}
    
    for endpoint in endpoints:
        try:
            print(f"  📡 {endpoint[:60]}...")
            response = session.get(endpoint, timeout=15)
            
            results[endpoint] = {
                "status": response.status_code,
                "success": response.status_code == 200
            }
            
            if response.status_code == 200:
                print(f"    ✅ Başarılı!")
            else:
                print(f"    ❌ Hata: {response.status_code}")
                
        except Exception as e:
            results[endpoint] = {"error": str(e)}
            print(f"    ❌ Exception: {str(e)[:50]}...")
    
    return results

def main():
    """Ana test fonksiyonu"""
    print("🚀 API Test Başlatılıyor...")
    print("=" * 50)
    
    # OECD test
    oecd_result = test_oecd_industrial()
    print(f"OECD sonuç: {oecd_result}")
    print()
    
    # OECD alternatif test
    oecd_alt = test_oecd_alternative()
    print(f"OECD alternatif sonuç: {oecd_alt}")
    print()
    
    # FRED test
    fred_result = test_fred_web_access()
    print(f"FRED sonuç: {fred_result}")
    print()
    
    # Sonuçları birleştir
    combined_results = {
        "test_timestamp": datetime.now().isoformat(),
        "oecd_industrial": oecd_result,
        "oecd_alternative": oecd_alt,
        "fred_web_access": fred_result
    }
    
    # Sonuçları kaydet
    os.makedirs("data/api_test_results", exist_ok=True)
    
    with open("data/api_test_results/simple_api_test.json", 'w', encoding='utf-8') as f:
        json.dump(combined_results, f, ensure_ascii=False, indent=2)
    
    print("=" * 50)
    print("✅ Test tamamlandı!")
    print("📄 Sonuçlar: data/api_test_results/simple_api_test.json")
    
    return combined_results

if __name__ == "__main__":
    results = main()
