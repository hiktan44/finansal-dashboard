#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EVDS API Alternatif Yöntem: Proxy kullanarak veri indirme

Bu script, EVDS portal'ına farklı user agent ve header'larla istek göndererek
veri indirmeyi dener.
"""

import requests
import json
from datetime import datetime
import time

def download_evds_with_headers():
    """Farklı header'lar ile EVDS veri indirme denemesi"""
    
    # Farklı user agent'lar
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ]
    
    # EVDS API endpoint'leri
    endpoints = {
        'TP.KTF17.USD': 'https://evds2.tcmb.gov.tr/service/evds/series=TP.KTF17.USD&startDate=2020-01-01&endDate=2025-12-31&type=json',
        'TP.KTF17.EUR': 'https://evds2.tcmb.gov.tr/service/evds/series=TP.KTF17.EUR&startDate=2020-01-01&endDate=2025-12-31&type=json'
    }
    
    results = {}
    
    for series_name, url in endpoints.items():
        print(f"📊 {series_name} serisi deneniyor...")
        
        for i, user_agent in enumerate(user_agents):
            try:
                headers = {
                    'User-Agent': user_agent,
                    'Accept': 'application/json,text/html,application/xhtml+xml',
                    'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
                    'Referer': 'https://evds2.tcmb.gov.tr/',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
                
                print(f"   Deneme {i+1}: User-Agent {user_agent[:30]}...")
                
                response = requests.get(url, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    print(f"   ✅ Başarılı! HTTP {response.status_code}")
                    
                    # JSON veriyi parse et
                    try:
                        data = response.json()
                        results[series_name] = data
                        
                        # Veriyi dosyaya kaydet
                        filename = f"/workspace/data/evds_{series_name.replace('.', '_')}.json"
                        with open(filename, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        print(f"   💾 Dosya kaydedildi: {filename}")
                        break
                        
                    except json.JSONDecodeError:
                        print(f"   ⚠️  JSON parse hatası")
                        continue
                        
                elif response.status_code == 403:
                    print(f"   ❌ Forbidden (403) - API anahtarı gerekli")
                    # Short delay before next attempt
                    time.sleep(2)
                    
                else:
                    print(f"   ❌ HTTP {response.status_code}")
                    time.sleep(1)
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Bağlantı hatası: {e}")
                time.sleep(1)
                continue
        else:
            print(f"   ❌ {series_name} için tüm denemeler başarısız")
            results[series_name] = None
    
    return results

def main():
    print("🚀 EVDS Veri İndirme Denemesi (Proxy/Header Yöntemi)")
    print("=" * 60)
    
    results = download_evds_with_headers()
    
    # Sonuçları raporla
    print("\n📋 Sonuç Özeti:")
    for series, data in results.items():
        if data:
            print(f"   ✅ {series}: Başarıyla indirildi")
        else:
            print(f"   ❌ {series}: Başarısız")
    
    # Toplam sonuç
    success_count = sum(1 for data in results.values() if data is not None)
    print(f"\n🎯 Genel Sonuç: {success_count}/{len(results)} seri başarıyla indirildi")
    
    return results

if __name__ == "__main__":
    main()