#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TCMB Kredi Faiz Oranları ve Swap Verilerini Tamamlama Scripti

Bu script şu işlemleri gerçekleştirir:
1. Kullanıcıdan EVDS API anahtarı ister
2. Kredi faiz oranları verilerini otomatik indirir
3. Verileri parse eder
4. Swap verileri ile birleştirir
5. Final JSON dosyasını oluşturur
"""

import requests
import json
import os
from datetime import datetime
import pandas as pd

def request_evds_api_key():
    """Kullanıcıdan EVDS API anahtarı ister"""
    print("🔑 TCMB EVDS API Anahtarı Gerekli")
    print("=" * 50)
    print("Kredi faiz oranları verilerini otomatik olarak indirmek için")
    print("EVDS API anahtarınız gereklidir.")
    print()
    print("📋 API Anahtarı Nasıl Alınır:")
    print("1. https://evds2.tcmb.gov.tr/ adresine gidin")
    print("2. 'Giriş Yap' butonuna tıklayın") 
    print("3. Ücretsiz hesap oluşturun")
    print("4. Hesap panelinden API anahtarınızı alın")
    print()
    
    api_key = input("EVDS API Anahtarınızı giriniz (API anahtarı yoksa Enter'a basın): ").strip()
    
    if not api_key:
        print("❌ API anahtarı girilmedi. Web scraping yöntemi denenecek...")
        return None
    else:
        print(f"✅ API anahtarı alındı: {api_key[:10]}...")
        return api_key

def download_evds_data_with_api(api_key, series_code, series_name, start_date="2008-01-01", end_date="2025-12-31"):
    """EVDS API ile veri indirir"""
    base_url = "https://evds2.tcmb.gov.tr/service/evds/series="
    
    params = {
        'series': series_code,
        'startDate': start_date,
        'endDate': end_date,
        'type': 'json',
        'key': api_key
    }
    
    try:
        print(f"📊 {series_name} verisi indiriliyor...")
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ {series_name} verisi başarıyla indirildi")
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ API hatası: {e}")
        return None
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")
        return None

def download_evds_data_scraping():
    """EVDS portal'ından web scraping ile veri indirir"""
    print("🌐 Web scraping yöntemiyle veri indiriliyor...")
    
    # Bu fonksiyon interact_with_website tool'u ile çağrılacak
    # Şimdilik False döndürüp manuel yönteme geçeceğiz
    return False

def parse_evds_json_data(data, series_name):
    """EVDS JSON verilerini parse eder"""
    if not data or 'items' not in data:
        print(f"❌ {series_name} verisi parse edilemedi")
        return {}
    
    parsed_data = {}
    for item in data['items']:
        if 'Tarih' in item and 'TP_KTF17' in item:
            # Tarih formatını normalize et
            date_str = item['Tarih']
            try:
                if len(date_str) == 10:  # YYYY-MM-DD formatında
                    formatted_date = date_str
                else:
                    # DD.MM.YYYY formatını YYYY-MM-DD'ye çevir
                    date_obj = datetime.strptime(date_str, '%d.%m.%Y')
                    formatted_date = date_obj.strftime('%Y-%m-%d')
                
                # Değeri float'a çevir
                value = float(item['TP_KTF17'])
                parsed_data[formatted_date] = value
                
            except (ValueError, KeyError) as e:
                print(f"⚠️  Veri parse hatası: {e} - {item}")
                continue
    
    print(f"✅ {series_name} verisi parse edildi: {len(parsed_data)} kayıt")
    return parsed_data

def main():
    """Ana fonksiyon"""
    print("🚀 TCMB Kredi Faiz Oranları ve Swap Verilerini Tamamlama")
    print("=" * 70)
    
    # API anahtarı al
    api_key = request_evds_api_key()
    
    credit_rates = {}
    
    if api_key:
        # API ile veri indir
        series_codes = {
            'TP.KTF17.USD': 'USD Ticari Kredi Faiz Oranı',
            'TP.KTF17.EUR': 'EUR Ticari Kredi Faiz Oranı'
        }
        
        for series_code, series_name in series_codes.items():
            data = download_evds_data_with_api(api_key, series_code, series_name)
            if data:
                series_data = parse_evds_json_data(data, series_name)
                credit_rates[series_code] = series_data
    else:
        # Web scraping denemesi
        if not download_evds_data_scraping():
            print("❌ Web scraping başarısız. Manuel indirme gerekli.")
            return False
    
    # Mevcut swap verilerini oku
    try:
        with open('/workspace/data/tcmb_verileri/swap_data_parsed.json', 'r', encoding='utf-8') as f:
            swap_data = json.load(f)
        print(f"✅ Swap verileri yüklendi: {len(swap_data['swap_amounts'])} kayıt")
    except Exception as e:
        print(f"❌ Swap verileri okunamadı: {e}")
        return False
    
    # Final veri yapısını oluştur
    final_data = {
        "credit_rates": credit_rates,
        "swap_amounts": swap_data['swap_amounts'],
        "metadata": {
            "collection_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "sources": {
                "credit_rates": "EVDS Portal - TCMB API" if api_key else "EVDS Portal - Manuel indirme gerekli",
                "swap_amounts": "TCMB Swap İşlemleri PDF"
            },
            "data_quality": {
                "credit_rates_count": sum(len(series) for series in credit_rates.values()) if credit_rates else 0,
                "swap_amounts_count": len(swap_data['swap_amounts'])
            }
        }
    }
    
    # Final dosyayı kaydet
    output_path = '/workspace/data/tcmb_verileri/tcmb_faiz_swap_2025.json'
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
        
        print(f"🎉 İşlem tamamlandı!")
        print(f"📁 Final dosya: {output_path}")
        print(f"📊 Toplam veri:")
        if credit_rates:
            for series, data in credit_rates.items():
                print(f"   • {series}: {len(data)} kayıt")
        print(f"   • Swap verileri: {len(swap_data['swap_amounts'])} kayıt")
        
        return True
        
    except Exception as e:
        print(f"❌ Dosya kaydedilemedi: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Tüm veriler başarıyla toplandı ve birleştirildi!")
    else:
        print("\n❌ İşlem tamamlanamadı. Lütfen hataları kontrol ediniz.")