#!/usr/bin/env python3
"""
TÜFE Veri İşleme Scripti
CSV dosyasındaki TÜFE verilerini parse edip JSON formatına dönüştürür
"""

import csv
import json
from datetime import datetime
import pandas as pd

def parse_tufe_data():
    """CSV dosyasından TÜFE verilerini parse eder"""
    
    # CSV dosyasını oku
    with open('/workspace/data/tufe_verileri/tufe_tablo2_2020_2025.csv', 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        data = list(reader)
    
    print("CSV dosyası başarıyla okundu.")
    print(f"Toplam satır sayısı: {len(data)}")
    print(f"İlk 5 satır:")
    for i, row in enumerate(data[:5]):
        print(f"Satır {i+1}: {row[:3]}...")
    
    # Ay isimleri (Türkçe kısaltmalar)
    months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    
    # TÜFE endeks değerleri (satır 1-6, index 0-5)
    # Aylık değişim oranları (satır 7-12, index 6-11)
    # Yıllık değişim oranları (satır 13-18, index 12-17)
    
    # Aylık değişim oranlarını al (satır 8-13, index 7-12)
    monthly_changes = data[7:13]  # 2020-2025 aylık değişim oranları
    
    dates = []
    values = []
    
    # Her yıl için aylık verileri işle
    for year_index, year_data in enumerate(monthly_changes):
        year = 2020 + year_index
        
        # İlk eleman yıl bilgisi, sonraki 12 eleman aylık veriler
        for month_index in range(1, 13):  # 1'den 12'ye kadar (0. indeks yıl)
            if month_index < len(year_data) and year_data[month_index].strip():
                try:
                    # Tarih formatı: YYYY-MM
                    date_str = f"{year}-{month_index:02d}"
                    value = float(year_data[month_index])
                    
                    dates.append(date_str)
                    values.append(value)
                    
                    print(f"Eklenen veri: {date_str} = {value}%")
                    
                except ValueError as e:
                    print(f"Değer dönüştürme hatası ({year}-{months[month_index-1]}): {e}")
                    print(f"Değer: '{year_data[month_index]}'")
            else:
                # Eksik veri (muhtemelen 2025 Kasım ve Aralık)
                if year == 2025 and month_index >= 11:
                    print(f"Eksik veri: {year}-{month_index:02d} (henüz yayınlanmamış)")
    
    print(f"\nToplam veri noktası: {len(dates)}")
    print(f"Tarih aralığı: {dates[0]} - {dates[-1]}")
    
    return dates, values

def create_json_output(dates, values):
    """JSON formatında çıktı oluşturur"""
    
    # JSON yapısı
    tufe_data = {
        "dates": dates,
        "values": values,
        "metadata": {
            "description": "TÜFE Aylık Değişim Oranları (%)",
            "source": "TÜİK - Tüketici Fiyat Endeksi",
            "period": f"{dates[0]} - {dates[-1]}",
            "data_points": len(dates),
            "unit": "percent",
            "base": "2003=100",
            "last_updated": "2025-11-09"
        }
    }
    
    # JSON dosyasını kaydet
    output_path = '/workspace/data/tufe_verileri_2020_2025.json'
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(tufe_data, file, ensure_ascii=False, indent=2)
    
    print(f"\nJSON dosyası başarıyla oluşturuldu: {output_path}")
    
    return tufe_data

def main():
    """Ana fonksiyon"""
    print("=== TÜFE Veri İşleme Başlatılıyor ===")
    
    # Verileri parse et
    dates, values = parse_tufe_data()
    
    # JSON çıktısını oluştur
    tufe_data = create_json_output(dates, values)
    
    # Özet bilgileri yazdır
    print("\n=== İşlem Özeti ===")
    print(f"İşlenen veri noktası sayısı: {len(dates)}")
    print(f"İlk veri: {dates[0]} - {values[0]}%")
    print(f"Son veri: {dates[-1]} - {values[-1]}%")
    print(f"Ortalama aylık enflasyon: {sum(values)/len(values):.2f}%")
    
    # İlk ve son birkaç veriyi göster
    print(f"\nİlk 5 veri:")
    for i in range(min(5, len(dates))):
        print(f"  {dates[i]}: {values[i]}%")
    
    print(f"\nSon 5 veri:")
    for i in range(max(0, len(dates)-5), len(dates)):
        print(f"  {dates[i]}: {values[i]}%")
    
    print("\n=== İşlem Tamamlandı ===")

if __name__ == "__main__":
    main()
