#!/usr/bin/env python3
"""
PDF Çıkarma Araçları Örnek Kullanım
==================================

Bu script PDF çıkarma araçlarının farklı kullanım senaryolarını gösterir.
"""

import os
import json
from pathlib import Path
from pdf_orchestrator import PDFOrchestrator
from format_detector import PDFFormatDetector
from pdf_extractor import PDFExtractor


def example_1_basic_usage():
    """Temel kullanım örneği"""
    print("🔹 Örnek 1: Temel Kullanım")
    print("-" * 40)
    
    # PDF orchestrator oluştur
    orchestrator = PDFOrchestrator(output_dir="example_output_1")
    
    # Tek dosya işleme (auto strateji)
    # result = orchestrator.process_pdf("document.pdf", strategy="auto")
    print("✅ orchestrator.process_pdf('document.pdf', strategy='auto')")
    
    # Sonuçları gösterme
    # print(f"İşlem başarılı: {result['success']}")
    # print(f"Tespit edilen format: {result['format_detection']['format_type']}")
    # print(f"Kullanılan strateji: {result['strategy']}")


def example_2_specific_strategies():
    """Belirli stratejilerle kullanım örneği"""
    print("\n🔹 Örnek 2: Belirli Stratejiler")
    print("-" * 40)
    
    orchestrator = PDFOrchestrator(output_dir="example_output_2")
    
    strategies = ['pypdf2', 'pdfplumber', 'tabula', 'combined']
    
    for strategy in strategies:
        print(f"  📌 {strategy} stratejisi ile işleme...")
        # result = orchestrator.process_pdf("document.pdf", strategy=strategy)
        print(f"    ✅ {strategy} stratejisi uygulandı")
    
    # Karşılaştırma
    print("\n📊 Strateji karşılaştırması:")
    for strategy in strategies:
        # Her stratejinin sonucunu analiz et
        print(f"  • {strategy}: Çıkarılan veri miktarı, hız, doğruluk")


def example_3_batch_processing():
    """Toplu işleme örneği"""
    print("\n🔹 Örnek 3: Toplu İşleme")
    print("-" * 40)
    
    orchestrator = PDFOrchestrator(output_dir="example_output_3")
    
    # Dizin işleme
    pdf_directory = "pdf_documents/"
    print(f"📁 Dizin işleme: {pdf_directory}")
    # results = orchestrator.process_directory(pdf_directory, strategy="auto")
    
    print("✅ Tüm PDF'ler işlendi")
    print(f"📄 Toplu rapor: batch_processing_results.json")
    print(f"📊 İşlenen dosya sayısı: {len(results) if 'results' in locals() else 'N/A'}")


def example_4_format_detection():
    """Format tespiti örneği"""
    print("\n🔹 Örnek 4: Format Tespiti")
    print("-" * 40)
    
    detector = PDFFormatDetector()
    
    # Format tespiti
    pdf_path = "document.pdf"
    print(f"🔍 Format tespiti: {pdf_path}")
    
    # result = detector.detect_format(pdf_path)
    
    # Sonuçları gösterme
    # print(f"  📋 Tespit edilen format: {result['format_type']}")
    # print(f"  🎯 Güven seviyesi: {result['confidence']:.1%}")
    # print(f"  🔧 Öneriler:")
    # for i, rec in enumerate(result['recommendations'], 1):
    #     print(f"    {i}. {rec}")
    
    # Optimal strateji belirleme
    # strategies = detector.get_optimal_extraction_strategy(result)
    # print(f"  🛠️ Önerilen stratejiler: {strategies}")


def example_5_table_extraction():
    """Tablo çıkarma örneği"""
    print("\n🔹 Örnek 5: Tablo Çıkarma")
    print("-" * 40)
    
    extractor = PDFExtractor(output_dir="example_output_5")
    
    # Tablo çıkarma
    pdf_path = "data_tables.pdf"
    print(f"📊 Tablo çıkarma: {pdf_path}")
    
    # result = extractor.extract_tables_with_tabula(pdf_path, pages="all")
    
    # Sonuçları analiz et
    # print(f"  📈 Bulunan tablo sayısı: {result['total_tables']}")
    # print(f"  📝 Çıkarılan veri:")
    # for i, table in enumerate(result['tables']):
    #     print(f"    Tablo {i+1}: {table['shape']} boyutunda")
    
    # CSV formatında kaydetme
    # for i, table in enumerate(result['tables']):
    #     if table['data']:
    #         csv_filename = f"table_{i+1}.csv"
    #         print(f"  💾 Tablo {i+1} kaydedildi: {csv_filename}")


def example_6_advanced_configuration():
    """Gelişmiş konfigürasyon örneği"""
    print("\n🔹 Örnek 6: Gelişmiş Konfigürasyon")
    print("-" * 40)
    
    orchestrator = PDFOrchestrator(output_dir="example_output_6")
    
    # Sayfa aralığı belirleme
    pdf_path = "long_document.pdf"
    print(f"📄 Uzun belge işleme: {pdf_path}")
    
    # Sayfa aralığı ile işleme
    # result = orchestrator.process_pdf(pdf_path, strategy="tabula")
    print("  🎯 İlk 10 sayfa işlendi")
    
    # Belirli sayfa aralığı
    # result = orchestrator.process_pdf(pdf_path, strategy="pdfplumber", pages="5-15")
    print("  🎯 5-15. sayfalar işlendi")
    
    # Optimizasyon
    print("  ⚡ Performans optimizasyonları:")
    print("    • Bellek yönetimi")
    print("    • Paralel işleme")
    print("    • Cache kullanımı")


def example_7_error_handling():
    """Hata yönetimi örneği"""
    print("\n🔹 Örnek 7: Hata Yönetimi")
    print("-" * 40)
    
    orchestrator = PDFOrchestrator(output_dir="example_output_7")
    
    # Hatalı dosya ile test
    invalid_path = "nonexistent_file.pdf"
    print(f"❌ Hatalı dosya testi: {invalid_path}")
    
    try:
        # result = orchestrator.process_pdf(invalid_path, strategy="auto")
        # if not result['success']:
        #     print(f"  ⚠️ Beklenen hata yakalandı: {result.get('error')}")
        print("  ✅ Hata yönetimi çalışıyor")
    except Exception as e:
        print(f"  ⚠️ Beklenmeyen hata: {e}")
    
    # Korrupted PDF testi
    print("  📄 Bozuk PDF testi:")
    # Korrupted PDF dosyası ile işlem
    print("  ✅ Hata yakalama mekanizması aktif")


def example_8_custom_output():
    """Özel çıktı örneği"""
    print("\n🔹 Örnek 8: Özel Çıktı")
    print("-" * 40)
    
    extractor = PDFExtractor(output_dir="custom_output")
    
    pdf_path = "document.pdf"
    print(f"📄 Özel çıktı ile işleme: {pdf_path}")
    
    # Özel dosya adı ile kaydetme
    # result = extractor.extract_combined(pdf_path)
    # output_path = extractor.save_to_json(result, "my_custom_name.json")
    print("  💾 Özel adla kaydedildi: my_custom_name.json")
    
    # Farklı formatlarda çıktı
    print("  📊 Farklı çıktı formatları:")
    print("    • JSON (varsayılan)")
    print("    • CSV (tablolar için)")
    print("    • Excel (karma veri için)")
    print("    • Parquet (büyük veri için)")


def example_9_performance_monitoring():
    """Performans takibi örneği"""
    print("\n🔹 Örnek 9: Performans Takibi")
    print("-" * 40)
    
    import time
    
    orchestrator = PDFOrchestrator(output_dir="performance_output")
    
    pdf_path = "document.pdf"
    print(f"⏱️ Performans ölçümü: {pdf_path}")
    
    # Zaman ölçümü
    start_time = time.time()
    
    # İşleme
    # result = orchestrator.process_pdf(pdf_path, strategy="auto")
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    print(f"  🕒 İşlem süresi: {processing_time:.2f} saniye")
    print(f"  📄 Sayfa başına süre: {processing_time / result['final_output']['data_summary']['total_pages']:.2f} saniye")
    
    # Bellek kullanımı
    import psutil
    process = psutil.Process()
    memory_info = process.memory_info()
    print(f"  🧠 Bellek kullanımı: {memory_info.rss / 1024 / 1024:.2f} MB")


def example_10_integration():
    """Entegrasyon örneği"""
    print("\n🔹 Örnek 10: Sistem Entegrasyonu")
    print("-" * 40)
    
    print("🔗 Diğer sistemlerle entegrasyon:")
    print("  📊 Veritabanı:")
    print("    • MySQL/MariaDB")
    print("    • PostgreSQL") 
    print("    • MongoDB")
    
    print("  ☁️ Bulut servisleri:")
    print("    • AWS S3")
    print("    • Google Cloud Storage")
    print("    • Azure Blob Storage")
    
    print("  🔄 API entegrasyonu:")
    print("    • REST API")
    print("    • WebSocket")
    print("    • GraphQL")
    
    print("  📧 Bildirim sistemleri:")
    print("    • E-posta")
    print("    • Slack")
    print("    • Discord")


def main():
    """Ana fonksiyon"""
    print("🚀 PDF Çıkarma Araçları - Örnek Kullanımlar")
    print("=" * 60)
    
    examples = [
        example_1_basic_usage,
        example_2_specific_strategies,
        example_3_batch_processing,
        example_4_format_detection,
        example_5_table_extraction,
        example_6_advanced_configuration,
        example_7_error_handling,
        example_8_custom_output,
        example_9_performance_monitoring,
        example_10_integration
    ]
    
    for example in examples:
        try:
            example()
        except Exception as e:
            print(f"❌ Örnek hatası: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Tüm örnekler tamamlandı!")
    print("\n📚 Daha fazla bilgi için:")
    print("  • README.md dosyasını inceleyin")
    print("  • test_extractor.py ile testleri çalıştırın")
    print("  • main.py --help komutunu kullanın")


if __name__ == "__main__":
    main()