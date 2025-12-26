#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
from datetime import datetime
import os

def parse_swap_data():
    """Swap verilerini parse edip JSON formatına çevirir"""
    
    # Extract dosyalarını oku
    extract_files = [
        '/workspace/extract/tcmb_swap_islemleri_7c8c3e2f.json',
        '/workspace/extract/tcmb_swap_islemleri_eae77a37.json', 
        '/workspace/extract/tcmb_swap_islemleri_4f669e34.json'
    ]
    
    swap_amounts = {}
    
    for file_path in extract_files:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                text = data.get('text_in_pdf', '')
                
                # Günlük veri satırlarını parse et
                lines = text.split('\n')
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                        
                    # Tarih pattern'i bul
                    # Format: DD.MM.YYYY sayılar sayılar ...
                    date_pattern = r'(\d{1,2}\.\d{1,2}\.\d{4})\s+([\d\.]+)'
                    match = re.search(date_pattern, line)
                    
                    if match:
                        date_str = match.group(1)
                        try:
                            # Tarihi parse et
                            date_obj = datetime.strptime(date_str, '%d.%m.%Y')
                            formatted_date = date_obj.strftime('%Y-%m-%d')
                            
                            # Sayıları çıkar
                            numbers = re.findall(r'[\d\.]+', line)
                            if len(numbers) > 1:
                                # İlk sayı toplam swap tutarı (milyon USD)
                                try:
                                    total_amount = float(numbers[1])
                                    if total_amount > 0:  # Sadece pozitif değerleri al
                                        swap_amounts[formatted_date] = total_amount
                                except ValueError:
                                    continue
                        except ValueError:
                            continue
    
    return swap_amounts

def main():
    print("Swap verilerini parse ediyorum...")
    swap_data = parse_swap_data()
    
    print(f"Toplam {len(swap_data)} adet swap verisi bulundu")
    
    # En son verileri göster
    sorted_dates = sorted(swap_data.keys())
    if sorted_dates:
        print(f"En eski veri: {sorted_dates[0]} - {swap_data[sorted_dates[0]]:.2f} milyon USD")
        print(f"En yeni veri: {sorted_dates[-1]} - {swap_data[sorted_dates[-1]]:.2f} milyon USD")
    
    # JSON dosyasına kaydet
    output_data = {
        "swap_amounts": swap_data
    }
    
    output_path = '/workspace/data/tcmb_verileri/swap_data_parsed.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Parse edilen veriler {output_path} dosyasına kaydedildi")
    return swap_data

if __name__ == "__main__":
    main()
