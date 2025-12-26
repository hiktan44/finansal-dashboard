#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import os

def detailed_tufe_analysis():
    """TÜFE dosyasını detaylı analiz eder"""
    file_path = "/workspace/data/tufe_verileri/tufe_tablo2_oncesinden.xlsx"
    
    print("=== TÜFE Tablo-2 Detaylı Analizi ===")
    print(f"Dosya: {file_path}")
    
    try:
        # Excel dosyasını oku
        df = pd.read_excel(file_path, sheet_name='17_t1')
        print(f"Toplam satır sayısı: {df.shape[0]}")
        print(f"Toplam sütun sayısı: {df.shape[1]}")
        print(f"İlk 10 satır:")
        print(df.head(10))
        
        print(f"\nSütun başlıkları:")
        print(df.columns.tolist())
        
        # Veri yapısını daha iyi anlamak için
        print(f"\nVeri tipleri:")
        print(df.dtypes)
        
        # 2020-2025 dönemine ait verileri bul
        print(f"\n=== 2020-2025 Dönemi Verileri ===")
        for idx, row in df.iterrows():
            year_col = row.iloc[0]  # İlk sütunda yıl bilgisi
            if pd.notna(year_col) and str(year_col).strip() in ['2020', '2021', '2022', '2023', '2024', '2025']:
                print(f"2020-2025 döneminden veri bulundu - Satır {idx}: {year_col}")
                print(row.to_dict())
                print("-" * 50)
        
        # 2020-2025 arası tüm yılları ara
        print(f"\n=== 2020-2025 Arası Tüm Yıllar ===")
        for year in range(2020, 2026):
            year_data = df[df.iloc[:, 0].astype(str).str.contains(str(year), na=False)]
            if not year_data.empty:
                print(f"{year} yılı verileri bulundu:")
                print(year_data)
                print("-" * 30)
        
        # Aylık TÜFE verilerini analiz et
        print(f"\n=== Aylık TÜFE Verileri Yapısı ===")
        # İlk birkaç satırı header olarak kullan
        df_clean = pd.read_excel(file_path, sheet_name='17_t1', skiprows=2)
        print("Temizlenmiş veri (ilk 5 satır):")
        print(df_clean.head())
        
        # 2020-2025 yıllarını filtrele
        tufe_2020_2025 = df_clean[df_clean.iloc[:, 0].astype(str).str.contains('2020|2021|2022|2023|2024|2025', na=False)]
        print(f"\n=== 2020-2025 TÜFE Verileri ===")
        print(tufe_2020_2025)
        
        # CSV olarak kaydet
        output_path = "/workspace/data/tufe_verileri/tufe_tablo2_2020_2025.csv"
        tufe_2020_2025.to_csv(output_path, index=False, encoding='utf-8')
        print(f"\n2020-2025 TÜFE verileri CSV olarak kaydedildi: {output_path}")
        
    except Exception as e:
        print(f"Hata: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    detailed_tufe_analysis()