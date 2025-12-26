#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TCMB EVDS Döviz Ticari Kredi Faiz Oranları Veri Çekme Scripti

Bu script, TCMB EVDS API'sini kullanarak döviz ticari kredi faiz oranları
verilerini CSV formatında indirmek için kullanılabilir.

Gerekli: EVDS API anahtarı (ücretsiz kayıt ile alınabilir)
Gerekli Kütüphaneler: requests, pandas, datetime
"""

import requests
import pandas as pd
import json
from datetime import datetime
import os

class EVDSDataDownloader:
    def __init__(self, api_key):
        """
        EVDS veri indirici başlatıcı
        
        Args:
            api_key (str): EVDS API anahtarı
        """
        self.api_key = api_key
        self.base_url = "https://evds2.tcmb.gov.tr/service/evds/series="
        
        # Veri serisi kodları
        self.series_codes = {
            'USD': 'TP.KTF17.USD',  # USD Ticari Kredi Faiz Oranı
            'EUR': 'TP.KTF17.EUR'   # EURO Ticari Kredi Faiz Oranı
        }
        
        # Dosya kaydetme dizini
        self.output_dir = "/workspace/downloads/evds_data"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def download_series(self, series_code, series_name, start_date="2008-01-01", end_date="2025-12-31", data_type="json"):
        """
        Belirtilen seriyi indir
        
        Args:
            series_code (str): EVDS seri kodu
            series_name (str): Seri adı (dosya ismi için)
            start_date (str): Başlangıç tarihi (YYYY-MM-DD)
            end_date (str): Bitiş tarihi (YYYY-MM-DD)
            data_type (str): Veri tipi (json, csv, xml)
        
        Returns:
            dict: İndirilen veri
        """
        print(f"📊 {series_name} verisi indiriliyor...")
        print(f"   Seri Kodu: {series_code}")
        print(f"   Tarih Aralığı: {start_date} - {end_date}")
        
        # API parametreleri
        params = {
            'series': series_code,
            'startDate': start_date,
            'endDate': end_date,
            'type': data_type,
            'key': self.api_key
        }
        
        try:
            # API çağrısı
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            print(f"✅ Başarılı! HTTP {response.status_code}")
            
            # Veriyi kaydet
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{series_name}_{timestamp}.{data_type}"
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"💾 Dosya kaydedildi: {filepath}")
            
            # JSON veriyi parse et
            if data_type.lower() == 'json':
                data = response.json()
                return data
            else:
                return {"file_saved": filepath}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Hata: {e}")
            return None
        except Exception as e:
            print(f"❌ Beklenmeyen hata: {e}")
            return None
    
    def download_all_series(self, start_date="2008-01-01", end_date="2025-12-31"):
        """
        Tüm döviz ticari kredi faiz oranı serilerini indir
        """
        print("🚀 TCMB EVDS Döviz Ticari Kredi Faiz Oranları İndirme Başlatılıyor...")
        print("=" * 70)
        
        results = {}
        
        for currency, series_code in self.series_codes.items():
            print(f"\n💱 {currency} Serisi:")
            data = self.download_series(series_code, f"doviz_ticari_kredi_{currency}", start_date, end_date)
            results[currency] = data
            
            if data:
                print(f"   ✓ {currency} verisi başarıyla indirildi")
            else:
                print(f"   ✗ {currency} verisi indirilemedi")
        
        return results
    
    def process_data_to_excel(self, results):
        """
        İndirilen JSON verilerini Excel dosyasına dönüştür
        """
        print("\n📈 Veriler Excel formatına dönüştürülüyor...")
        
        # Excel writer oluştur
        excel_path = os.path.join(self.output_dir, "TCMB_Doviz_Ticari_Kredi_Faiz_Oranlari.xlsx")
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            
            for currency, data in results.items():
                if data and 'items' in data:
                    # JSON veriden DataFrame oluştur
                    df = pd.DataFrame(data['items'])
                    
                    # Tarih sütununu düzenle
                    if 'Tarih' in df.columns:
                        df['Tarih'] = pd.to_datetime(df['Tarih'])
                    
                    # Excel'e yaz
                    sheet_name = f"{currency} Faiz Oranı"
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
                    print(f"   ✓ {sheet_name} sayfası eklendi")
        
        print(f"💾 Excel dosyası oluşturuldu: {excel_path}")
        return excel_path

def main():
    """
    Ana fonksiyon - API anahtarı gerekli
    """
    print("TCMB EVDS Döviz Ticari Kredi Faiz Oranları Veri İndirme")
    print("=" * 60)
    
    # Kullanıcıdan API anahtarı al
    api_key = input("EVDS API Anahtarınızı giriniz: ").strip()
    
    if not api_key:
        print("❌ API anahtarı gerekli!")
        print("\n📋 API Anahtarı Nasıl Alınır:")
        print("1. https://evds2.tcmb.gov.tr/ adresine gidin")
        print("2. 'Giriş Yap' butonuna tıklayın")
        print("3. Ücretsiz hesap oluşturun")
        print("4. Hesap panelinden API anahtarınızı alın")
        return
    
    # İndirici oluştur
    downloader = EVDSDataDownloader(api_key)
    
    # Verileri indir
    results = downloader.download_all_series()
    
    # Excel'e dönüştür
    if any(results.values()):
        excel_path = downloader.process_data_to_excel(results)
        print(f"\n🎉 İşlem tamamlandı!")
        print(f"📁 Dosya konumu: {excel_path}")
    else:
        print("\n❌ Hiç veri indirilemedi. API anahtarınızı kontrol ediniz.")

if __name__ == "__main__":
    main()