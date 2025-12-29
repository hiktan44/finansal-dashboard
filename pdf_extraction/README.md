# PDF Çıkarma Araçları

Bu proje PDF dosyalarından veri çıkarmak için geliştirilmiş kapsamlı bir Python araç setidir. PyPDF2, pdfplumber ve tabula-py kütüphanelerini kullanarak farklı PDF formatlarını destekler.

## Özellikler

- **Çoklu Çıkarma Yöntemleri**: PyPDF2, pdfplumber, tabula-py
- **Format Tespiti**: PDF türünü otomatik tespit eder
- **Optimal Strateji**: Format tespitine göre en uygun çıkarma yöntemini seçer
- **Kombine Yaklaşım**: Birden fazla yöntemi birleştirir
- **JSON Çıktı**: Tüm sonuçları JSON formatında kaydeder
- **Detaylı Raporlama**: İşlem sonuçları ve istatistikler
- **Toplu İşleme**: Dizin bazında toplu PDF işleme
- **Hata Yönetimi**: Güçlü hata yakalama ve raporlama

## Kurulum

1. **Gerekli paketleri yükleyin**:
```bash
pip install -r requirements.txt
```

2. **Bağımlılıklar**:
- Python 3.8+
- PyPDF2==3.0.1
- pdfplumber==0.11.4
- tabula-py==2.9.0
- pandas==2.2.2
- jsonlines==4.0.0
- openpyxl==3.1.2

## Kullanım

### Temel Kullanım

```bash
# Tek dosya işleme
python main.py -i document.pdf

# Dizin işleme
python main.py -i pdf_folder/

# Özel çıktı dizini
python main.py -i document.pdf -o custom_output/

# Farklı strateji kullanma
python main.py -i document.pdf -s combined
```

### Komut Satırı Seçenekleri

```bash
# Yardım
python main.py -h

# Sadece format analizi (çıkarma yapmadan)
python main.py -i document.pdf --analyze-only

# Rapor oluşturmama
python main.py -i document.pdf --no-report

# Tüm seçeneklerle
python main.py -i document.pdf -o results/ -s auto --report
```

### Programatik Kullanım

```python
from pdf_orchestrator import PDFOrchestrator
from format_detector import PDFFormatDetector

# PDF orchestrator kullanımı
orchestrator = PDFOrchestrator(output_dir="extracted_data")

# Tek dosya işleme
result = orchestrator.process_pdf("document.pdf", strategy="auto")
print(f"Başarı: {result['success']}")

# Dizin işleme
results = orchestrator.process_directory("pdf_folder/", strategy="auto")

# Rapor oluşturma
report_path = orchestrator.generate_report(results)

# Format detector kullanımı
detector = PDFFormatDetector()
format_info = detector.detect_format("document.pdf")
print(f"Format: {format_info['format_type']}")
print(f"Güven: {format_info['confidence']:.1%}")
```

## Çıkarma Stratejileri

### 1. PyPDF2
- **Kullanım**: Temel metin çıkarma
- **Avantajlar**: Hızlı, basit metin çıkarma
- **En uygun**: Metin tabanlı PDF'ler

### 2. pdfplumber
- **Kullanım**: Gelişmiş metin ve tablo çıkarma
- **Avantajlar**: Sayfa yapısı analizi, tablo çıkarma
- **En uygun**: Karışık içerikli PDF'ler

### 3. tabula-py
- **Kullanım**: Tablo çıkarma
- **Avantajlar**: Yapılandırılmış tablo verisi
- **En uygun**: Veri yoğun PDF'ler

### 4. Combined (Kombine)
- **Kullanım**: Tüm yöntemleri birleştirir
- **Avantajlar**: Maksimum veri çıkarımı
- **En uygun**: Karmaşık formatlar

## Desteklenen PDF Formatları

### 1. Metin Tabanlı PDF'ler
- Normal metin içeriği
- Yüksek metin yoğunluğu
- **Strateji**: PyPDF2, pdfplumber

### 2. Taranmış Görüntü PDF'leri
- OCR gerektirir
- Düşük metin çıkarma oranı
- **Strateji**: pdfplumber, tabula-py

### 3. Tablo Yoğun PDF'ler
- Çok sayıda tablo içeriği
- Yapılandırılmış veri
- **Strateji**: tabula-py, pdfplumber

### 4. Karışık İçerik PDF'ler
- Metin + tablolar + görseller
- Karmaşık sayfa düzeni
- **Strateji**: Combined

### 5. Form Tabanlı PDF'ler
- Doldurulabilir formlar
- Etkileşimli elemanlar
- **Strateji**: pdfplumber

## Çıktı Formatı

### JSON Yapısı

```json
{
  "file_name": "document.pdf",
  "file_path": "/path/to/document.pdf",
  "processing_timestamp": "2025-11-08T19:14:00",
  "strategy": "combined",
  "format_detection": {
    "format_type": "text_based",
    "confidence": 0.85,
    "characteristics": {
      "high_text_ratio": true,
      "structured_data": false
    },
    "recommendations": [
      "PyPDF2 veya pdfplumber kullanarak doğrudan metin çıkarın"
    ]
  },
  "extraction_results": {
    "pypdf2_result": { /* PyPDF2 sonuçları */ },
    "pdfplumber_result": { /* pdfplumber sonuçları */ },
    "tabula_result": { /* tabula-py sonuçları */ }
  },
  "final_output": {
    "extraction_method": "combined",
    "format_detected": "text_based",
    "confidence": 0.85,
    "data_summary": {
      "total_pages": 10,
      "total_text_length": 15420,
      "total_tables": 3
    },
    "recommendations": [ /* Öneriler */ ],
    "output_files": [ /* Çıktı dosyaları */ ]
  },
  "success": true
}
```

## Hata Durumları

### Yaygın Hatalar ve Çözümler

1. **"PDF dosyası bulunamadı"**
   - Dosya yolunu kontrol edin
   - Dosya uzantısının .pdf olduğundan emin olun

2. **"Tabula-py çıkarma hatası"**
   - Java kurulumu gerekebilir
   - `tabula-py` ve `tabula-JARPATH` ayarlarını kontrol edin

3. **"OCR gerektirir"**
   - Taranmış PDF'ler için Tesseract OCR kullanın
   - Format tespit sonucuna göre strateji değiştirin

4. **"Bellek yetersiz"**
   - Büyük PDF'ler için `pages` parametresi kullanın
   - Sayfa sayısını sınırlandırın

## Performans Optimizasyonu

### Büyük PDF Dosyaları İçin
```python
# Sayfa aralığı belirleme
result = orchestrator.process_pdf("large_document.pdf", strategy="tabula-py")

# Dizin işleme için paralel işlem
import concurrent.futures
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(orchestrator.process_pdf, pdf_files))
```

### Bellek Optimizasyonu
- Büyük dosyalar için chunk-based processing
- Gereksiz verileri temizleme
- Streaming çıktı

## Test Örnekleri

### Test Dosyası Oluşturma
```python
# Test PDF'i oluştur
from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font('Arial', 'B', 16)
pdf.cell(40, 10, 'Test PDF!')
pdf.output('test_document.pdf', 'F')
```

### Çıkarma Testi
```python
# Test çalıştırma
from pdf_orchestrator import PDFOrchestrator

orchestrator = PDFOrchestrator()
result = orchestrator.process_pdf('test_document.pdf')

# Sonuç kontrolü
assert result['success'] == True
assert result['format_detection']['format_type'] in ['text_based', 'mixed_content']
```

## Lisans

Bu proje açık kaynak kodludur. Detaylar için LICENSE dosyasını inceleyiniz.

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni_ozellik`)
3. Commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Push edin (`git push origin feature/yeni_ozellik`)
5. Pull Request oluşturun

## İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

## Changelog

### v1.0.0 (2025-11-08)
- İlk sürüm yayınlandı
- PyPDF2, pdfplumber, tabula-py entegrasyonu
- Format tespiti ve optimal strateji belirleme
- JSON çıktı ve raporlama sistemi
- Komut satırı arayüzü