import os
import json
import pandas as pd
from fredapi import Fred
import time
from datetime import datetime, timedelta

def get_fred_client():
    """FRED API client'ını oluştur"""
    api_key = os.getenv('FRED_API_KEY')
    if not api_key:
        raise ValueError("FRED_API_KEY environment variable bulunamadı")
    return Fred(api_key=api_key)

def collect_series_data(series_id, fred, start_date='2020-01-01', end_date='2025-11-10'):
    """Belirli bir seri için veri topla"""
    try:
        print(f"{series_id} serisi için veri toplanıyor...")
        data = fred.get_series(series_id, start=start_date, end=end_date)
        if not data.empty:
            # Veriyi ayrıntılı format'a çevir
            data_list = []
            for date, value in data.items():
                data_list.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "value": value,
                    "series_id": series_id
                })
            print(f"{series_id}: {len(data_list)} kayıt toplandı")
            return data_list
        else:
            print(f"{series_id}: Veri bulunamadı")
            return []
    except Exception as e:
        print(f"{series_id}: Hata - {str(e)}")
        return []

def main():
    """Ana fonksiyon - Tüm gerekli verileri topla"""
    
    # FRED istemcisini oluştur
    fred = get_fred_client()
    
    # Toplanacak seriler ve açıklamaları
    series_map = {
        # Federal Reserve faiz oranları
        'FEDFUNDS': 'Federal Reserve Faiz Oranı (Federal Funds Rate)',
        
        # ABD Hazine faizleri
        'DGS10': 'ABD 10 Yıl Hazine Faizi (10-Year Treasury)',
        'DGS2': 'ABD 2 Yıl Hazine Faizi (2-Year Treasury)', 
        'DGS1': 'ABD 1 Yıl Hazine Faizi (1-Year Treasury)',
        
        # ABD makroekonomik göstergeler
        'CPIAUCSL': 'ABD TÜFE (Consumer Price Index)',
        'UNRATE': 'ABD İşsizlik Oranı (Unemployment Rate)',
        'GDP': 'ABD Gayri Safi Yurt İçi Hasıla (GDP)',
        
        # USD Döviz kurları (seçilmiş önemli kurlar)
        'DEXUSAL': 'ABD Doları / Avustralya Doları',
        'DEXCHUS': 'ABD Doları / Çin Yuanı', 
        'DEXDEUS': 'ABD Doları / Euro',
        'DEXJPUS': 'ABD Doları / Japon Yeni',
        'DEXUKUS': 'ABD Doları / İngiliz Sterlini'
    }
    
    print("FRED verilerini toplama işlemi başlıyor...")
    print(f"Toplam {len(series_map)} seri için veri toplanacak\n")
    
    # Tüm serileri topla
    all_data = {}
    total_records = 0
    
    for series_id, description in series_map.items():
        print(f"\n=== {series_id}: {description} ===")
        data = collect_series_data(series_id, fred)
        if data:
            all_data[series_id] = {
                'description': description,
                'data': data,
                'record_count': len(data)
            }
            total_records += len(data)
        time.sleep(0.1)  # API oran sınırlaması için kısa bekleme
    
    print(f"\n\nVeri toplama tamamlandı!")
    print(f"Toplam {len(all_data)} seri başarıyla toplandı")
    print(f"Toplam {total_records} veri kaydı")
    
    # Sonuçları JSON formatında kaydet
    result = {
        'collection_info': {
            'collection_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data_period': '2020-01-01 to 2025-11-10',
            'total_series': len(all_data),
            'total_records': total_records
        },
        'series': all_data
    }
    
    # JSON dosyasını kaydet
    output_file = '/workspace/data/fred_global_indicators.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\nVeriler başarıyla {output_file} dosyasına kaydedildi!")
    
    # Özet rapor yazdır
    print("\n=== TOPLANAN VERİ ÖZETİ ===")
    for series_id, series_info in all_data.items():
        print(f"{series_id}: {series_info['record_count']} kayıt - {series_info['description']}")
    
    return result

if __name__ == "__main__":
    main()