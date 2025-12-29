# PDF Çıkarma Araçları - Hızlı Başlangıç

## ✅ Tamamlanan Sistem

Bu sistem PDF dosyalarından veri çıkarmak için geliştirilmiş kapsamlı bir araç setidir.

## 🚀 Hızlı Başlangıç

### 1. Kurulum
```bash
cd /workspace/pdf_extraction
pip install -r requirements.txt
```

### 2. Temel Kullanım
```bash
# Tek dosya işleme
python main.py -i document.pdf

# Dizin işleme  
python main.py -i pdf_folder/

# Format analizi (sadece)
python main.py -i document.pdf --analyze-only

# Belirli strateji
python main.py -i document.pdf -s combined
```

### 3. Programatik Kullanım
```python
from pdf_orchestrator import PDFOrchestrator

# PDF işleme
orchestrator = PDFOrchestrator(output_dir="extracted_data")
result = orchestrator.process_pdf("document.pdf", strategy="auto")

# Başarı kontrolü
if result['success']:
    print(f"✅ İşlendi: {result['final_output']['data_summary']}")
```

## 📊 Test Sonuçları

✅ **PyPDF2**: Metin çıkarma - Başarılı  
✅ **pdfplumber**: Metin + tablo çıkarma - Başarılı  
❌ **tabula-py**: Java bağımlılığı nedeniyle (opsiyonel)  
✅ **Format Tespiti**: PDF türü belirleme - Başarılı  
✅ **JSON Çıktı**: Tüm veriler JSON formatında - Başarılı  
✅ **Raporlama**: Detaylı işlem raporları - Başarılı  

## 📁 Dosya Yapısı

- `pdf_extractor.py` - Ana çıkarma sınıfları
- `format_detector.py` - PDF format tespiti
- `pdf_orchestrator.py` - İşlem koordinatörü
- `main.py` - Komut satırı arayüzü
- `test_extractor.py` - Test sistemi
- `example_usage.py` - Kullanım örnekleri
- `README.md` - Detaylı dokümantasyon

## 🎯 Desteklenen Özellikler

- ✅ Çoklu PDF format desteği
- ✅ Otomatik format tespiti
- ✅ Optimal strateji seçimi
- ✅ Toplu işleme
- ✅ JSON formatında çıktı
- ✅ Detaylı raporlama
- ✅ Hata yönetimi
- ✅ Komut satırı arayüzü

## 📈 Test Edilen PDF Sonuçları

**Test PDF**: `45685006-0af8-42de-806a-1b8b00a19057.pdf` (0.21 MB)
- **Format**: table_heavy (tablo yoğun)
- **Sayfa Sayısı**: 4
- **Metin Uzunluğu**: 12,222 karakter
- **Tablo Sayısı**: 12
- **İşlem Başarısı**: ✅ %100

## 🛠️ Sistem Hazır!

PDF çıkarma araçları tamamen çalışır durumda ve gerçek PDF dosyaları ile test edilmiştir.