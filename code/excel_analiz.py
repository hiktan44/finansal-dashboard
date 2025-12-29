#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import os
import sys

def analyze_excel_file(file_path, file_name):
    """Excel dosyasını analiz eder"""
    print(f"\n=== {file_name} Analizi ===")
    print(f"Dosya yolu: {file_path}")
    
    try:
        # Excel dosyasını oku
        excel_file = pd.ExcelFile(file_path)
        print(f"Çalışma sayfaları: {excel_file.sheet_names}")
        
        # Her çalışma sayfasını incele
        for sheet_name in excel_file.sheet_names:
            print(f"\n--- Çalışma Sayfası: {sheet_name} ---")
            df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=20)
            print(f"İlk 20 satır - Şekil: {df.shape}")
            print(f"Sütunlar: {list(df.columns)}")
            print("İlk birkaç satır:")
            print(df.head())
            
            # TÜFE ile ilgili bilgileri ara
            df_str = df.astype(str).apply(lambda x: x.str.contains('TÜFE|tüfe|Tüketici|CPI|Endeksi', case=False, na=False))
            if df_str.any().any():
                print("\n*** TÜFE ile ilgili veriler bulundu! ***")
                tufe_rows = df[df_str.any(axis=1)]
                print(tufe_rows)
            
            # 2020-2025 dönemi verilerini ara
            year_columns = [col for col in df.columns if any(year in str(col) for year in ['2020', '2021', '2022', '2023', '2024', '2025'])]
            if year_columns:
                print(f"\n*** 2020-2025 dönemine ait sütunlar bulundu: {year_columns} ***")
            
            print("-" * 50)
            
    except Exception as e:
        print(f"Hata: {e}")

def main():
    # Dosya yolları
    files = [
        "/workspace/data/tufe_verileri/tufe_tablo2_indirilen.xlsx",
        "/workspace/data/tufe_verileri/tufe_tablo2_oncesinden.xlsx"
    ]
    
    for file_path in files:
        if os.path.exists(file_path):
            file_name = os.path.basename(file_path)
            analyze_excel_file(file_path, file_name)
        else:
            print(f"Dosya bulunamadı: {file_path}")

if __name__ == "__main__":
    main()