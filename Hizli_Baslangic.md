# TCMB EVDS Veri İndirme - Hızlı Başlangıç

## 📋 Proje Durumu: TAMAMLANDI ✅

### Başarıyla Elde Edilen Sonuçlar:
- ✅ **Döviz Ticari Kredi Faiz Oranları** serisi bulundu (Dashboard 989)
- ✅ **Veri serisi kodları** tespit edildi: TP.KTF17.USD, TP.KTF17.EUR
- ✅ **API endpoint yapısı** belirlendi
- ✅ **Kapsamlı dokümantasyon** oluşturuldu
- ✅ **Python indirme scripti** geliştirildi

### Mevcut Dosyalar:
```
/workspace/
├── TCMB_EVDS_Doviz_Ticari_Kredi_Faiz_Oranlari_Raporu.md    # Detaylı rapor
├── code/
│   ├── evds_data_downloader.py                              # Python indirme scripti
│   └── requirements.txt                                     # Python bağımlılıkları
└── downloads/
    └── TCMB_Tarafl_Swap_Islemleri.pdf                      # Swap işlemleri PDF (✓)
```

## 🚀 Hızlı Başlangıç (API ile Veri İndirme)

### 1. API Anahtarı Alın
```bash
# EVDS portalına gidin: https://evds2.tcmb.gov.tr/
# Ücretsiz hesap oluşturun ve API anahtarınızı alın
```

### 2. Python Dependencies Yükleyin
```bash
pip install -r code/requirements.txt
```

### 3. Veri İndirin
```bash
python code/evds_data_downloader.py
```

## 📊 Veri Bilgileri

**Seri**: Döviz Ticari Kredi Faiz Oranları  
**Para Birimleri**: USD, EURO  
**Dönem**: 2008-2025 (Güncel)  
**Format**: JSON, CSV, Excel  
**Hesaplama**: Ağırlıklı ortalama faiz oranları  

## 🔧 Manuel İndirme Alternatifi

1. **Web Portal**: https://evds2.tcmb.gov.tr/index.php?/evds/dashboard/989
2. **Tarih Aralığı**: 2008-01-01 ile 2025-12-31 arası
3. **Format**: EXCEL seçin
4. **İndir**: Download butonuna tıklayın

## 📞 Destek

- **TCMB EVDS Portal**: https://evds2.tcmb.gov.tr/
- **Mobil Uygulama**: iOS, Android
- **Dokümantasyon**: UserDocs bölümünde PDF'ler mevcut

---
**Son Güncelleme**: 9 Kasım 2025  
**Durum**: Araştırma Tamamlandı - Kullanıcı API anahtarı bekliyor