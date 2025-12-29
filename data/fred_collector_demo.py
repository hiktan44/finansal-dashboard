import os
import json
import pandas as pd
import random
from datetime import datetime, timedelta
import time

def generate_mock_fred_data():
    """FRED API anahtarı olmadan demo veri oluştur"""
    
    print("Demo veri oluşturuluyor (FRED API anahtarı gerekli)...")
    
    # Seri açıklamaları
    series_map = {
        'FEDFUNDS': 'Federal Reserve Faiz Oranı (Federal Funds Rate)',
        'DGS10': 'ABD 10 Yıl Hazine Faizi (10-Year Treasury)',
        'DGS2': 'ABD 2 Yıl Hazine Faizi (2-Year Treasury)', 
        'DGS1': 'ABD 1 Yıl Hazine Faizi (1-Year Treasury)',
        'CPIAUCSL': 'ABD TÜFE (Consumer Price Index)',
        'UNRATE': 'ABD İşsizlik Oranı (Unemployment Rate)',
        'GDP': 'ABD Gayri Safi Yurt İçi Hasıla (GDP)',
        'DEXUSAL': 'ABD Doları / Avustralya Doları',
        'DEXCHUS': 'ABD Doları / Çin Yuanı', 
        'DEXDEUS': 'ABD Doları / Euro',
        'DEXJPUS': 'ABD Doları / Japon Yeni',
        'DEXUKUS': 'ABD Doları / İngiliz Sterlini'
    }
    
    # Tarih aralığı oluştur (2020-01-01'den 2025-11-10'a kadar)
    start_date = datetime(2020, 1, 1)
    end_date = datetime(2025, 11, 10)
    current_date = start_date
    
    all_data = {}
    total_records = 0
    
    # Aylık veri oluştur
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        
        for series_id, description in series_map.items():
            if series_id not in all_data:
                all_data[series_id] = {
                    'description': description,
                    'data': []
                }
            
            # Her seri için gerçekçi demo değerler oluştur
            value = generate_realistic_value(series_id, current_date)
            
            all_data[series_id]['data'].append({
                'date': date_str,
                'value': round(value, 2)
            })
            total_records += 1
        
        # Aylık artır
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    # Her seri için kayıt sayısını güncelle
    for series_id in all_data:
        all_data[series_id]['record_count'] = len(all_data[series_id]['data'])
    
    # Sonuçları JSON formatında kaydet
    result = {
        'collection_info': {
            'collection_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data_period': '2020-01-01 to 2025-11-10',
            'frequency': 'Monthly',
            'total_series': len(all_data),
            'total_records': total_records,
            'note': 'This is demo data. Use FRED API key for real data.'
        },
        'series': all_data
    }
    
    output_file = '/workspace/data/fred_global_indicators.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"Demo veriler başarıyla {output_file} dosyasına kaydedildi!")
    print(f"Toplam {len(all_data)} seri, {total_records} veri kaydı")
    
    # Özet rapor
    print("\n=== TOPLANAN DEMO VERİ ÖZETİ ===")
    for series_id, series_info in all_data.items():
        print(f"{series_id}: {series_info['record_count']} kayıt - {series_info['description']}")
    
    return result

def generate_realistic_value(series_id, date):
    """Gerçekçi demo değerler oluştur"""
    year = date.year
    
    if series_id == 'FEDFUNDS':  # Federal Reserve Faiz Oranı
        if year <= 2020: return random.uniform(0.5, 2.5)
        elif year <= 2022: return random.uniform(0.1, 4.5)
        else: return random.uniform(3.0, 6.0)
        
    elif series_id == 'DGS10':  # 10Y Treasury
        if year <= 2020: return random.uniform(1.0, 3.0)
        elif year <= 2022: return random.uniform(1.5, 4.5)
        else: return random.uniform(2.5, 5.5)
        
    elif series_id == 'DGS2':  # 2Y Treasury
        if year <= 2020: return random.uniform(0.5, 2.0)
        elif year <= 2022: return random.uniform(0.1, 4.0)
        else: return random.uniform(2.0, 5.0)
        
    elif series_id == 'DGS1':  # 1Y Treasury
        if year <= 2020: return random.uniform(0.3, 1.8)
        elif year <= 2022: return random.uniform(0.1, 3.5)
        else: return random.uniform(1.5, 4.8)
        
    elif series_id == 'CPIAUCSL':  # TÜFE
        return random.uniform(250, 320) + (year - 2020) * 5
        
    elif series_id == 'UNRATE':  # İşsizlik Oranı
        if year <= 2020: return random.uniform(3.5, 5.0)
        elif year <= 2022: return random.uniform(3.0, 8.0)
        else: return random.uniform(3.0, 4.5)
        
    elif series_id == 'GDP':  # GDP (trilyon USD)
        return random.uniform(19, 28) + (year - 2020) * 0.8
        
    elif series_id == 'DEXUSAL':  # USD/AUD
        return random.uniform(0.6, 0.85)
        
    elif series_id == 'DEXCHUS':  # USD/CNY
        return random.uniform(6.2, 7.5)
        
    elif series_id == 'DEXDEUS':  # USD/EUR
        return random.uniform(0.8, 1.2)
        
    elif series_id == 'DEXJPUS':  # USD/JPY
        return random.uniform(100, 150)
        
    elif series_id == 'DEXUKUS':  # USD/GBP
        return random.uniform(0.7, 0.85)
    
    return random.uniform(0, 100)  # Default

def get_fred_client():
    """FRED API client'ını oluştur (gerçek API key ile)"""
    api_key = os.getenv('FRED_API_KEY')
    if not api_key:
        raise ValueError("FRED_API_KEY environment variable bulunamadı")
    
    from fredapi import Fred
    return Fred(api_key=api_key)

def collect_real_series_data(series_id, fred, start_date='2020-01-01', end_date='2025-11-10'):
    """Gerçek FRED verisi topla (API key gerektirir)"""
    try:
        print(f"{series_id} serisi için gerçek veri toplanıyor...")
        data = fred.get_series(series_id, start=start_date, end=end_date)
        if not data.empty:
            data_list = []
            for date, value in data.items():
                data_list.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "value": value
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
    """Ana fonksiyon"""
    try:
        # Gerçek FRED verisi almaya çalış
        fred = get_fred_client()
        print("FRED API ile gerçek veri toplama başlıyor...")
        
        # Seri listesi
        series_map = {
            'FEDFUNDS': 'Federal Reserve Faiz Oranı',
            'DGS10': 'ABD 10 Yıl Hazine Faizi',
            'DGS2': 'ABD 2 Yıl Hazine Faizi',
            'DGS1': 'ABD 1 Yıl Hazine Faizi',
            'CPIAUCSL': 'ABD TÜFE',
            'UNRATE': 'ABD İşsizlik Oranı',
            'GDP': 'ABD GDP',
            'DEXUSAL': 'USD/AUD',
            'DEXCHUS': 'USD/CNY',
            'DEXDEUS': 'USD/EUR',
            'DEXJPUS': 'USD/JPY',
            'DEXUKUS': 'USD/GBP'
        }
        
        all_data = {}
        total_records = 0
        
        for series_id, description in series_map.items():
            data = collect_real_series_data(series_id, fred)
            if data:
                all_data[series_id] = {
                    'description': description,
                    'data': data,
                    'record_count': len(data)
                }
                total_records += len(data)
            time.sleep(0.1)
        
        if not all_data:
            print("API anahtarı bulunamadı veya hata oluştu. Demo veri oluşturuluyor...")
            return generate_mock_fred_data()
            
    except Exception as e:
        print(f"API bağlantı hatası: {e}")
        print("Demo veri oluşturuluyor...")
        return generate_mock_fred_data()

if __name__ == "__main__":
    main()