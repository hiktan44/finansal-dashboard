"""
PDF Çıkarma Araçları Test Scripti
=================================

Bu script PDF çıkarma araçlarının fonksiyonalitesini test eder.
"""

import os
import sys
import json
from pathlib import Path
import tempfile
import traceback

# Test modülleri
try:
    from pdf_extractor import PDFExtractor
    from format_detector import PDFFormatDetector
    from pdf_orchestrator import PDFOrchestrator
except ImportError as e:
    print(f"Modül import hatası: {e}")
    print("Gerekli paketleri yüklediğinizden emin olun.")
    sys.exit(1)


def create_test_pdf(file_path: str):
    """Test için örnek PDF oluşturur"""
    try:
        from fpdf import FPDF
        
        # Basit test PDF'i oluştur
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        
        # Başlık
        pdf.cell(0, 10, 'Test PDF Document', ln=True, align='C')
        pdf.ln(10)
        
        # Metin içeriği
        pdf.set_font('Arial', '', 12)
        text_content = [
            "Bu bir test PDF dosyasidir.",
            "Metin icerigi ve tablo verileri icerir.",
            "",
            "Tablo Ornegi:",
            "Isim\tYas\tSehir",
            "Ahmet\t25\tIstanbul",
            "Ayse\t30\tAnkara",
            "Mehmet\t35\tIzmir"
        ]
        
        for line in text_content:
            pdf.cell(0, 8, line.encode('latin-1', 'replace').decode('latin-1'), ln=True)
        
        pdf.output(file_path)
        print(f"✅ Test PDF oluşturuldu: {file_path}")
        return True
        
    except ImportError:
        print("❌ fpdf2 paketi bulunamadı. Test PDF oluşturulamadı.")
        return False
    except Exception as e:
        print(f"❌ Test PDF oluşturma hatası: {e}")
        return False


def test_pdf_extractor():
    """PDF Extractor testleri"""
    print("\n" + "="*50)
    print("PDF Extractor Testleri")
    print("="*50)
    
    # Test dizini oluştur
    test_dir = Path("test_pdfs")
    test_dir.mkdir(exist_ok=True)
    
    # Test PDF'i oluştur
    test_pdf = test_dir / "test_document.pdf"
    if not create_test_pdf(str(test_pdf)):
        return False
    
    extractor = PDFExtractor(output_dir="test_extracted")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: PyPDF2 çıkarma
    tests_total += 1
    try:
        result = extractor.extract_with_pypdf2(str(test_pdf))
        if 'pages' in result and not result.get('error'):
            print("✅ PyPDF2 testi başarılı")
            tests_passed += 1
        else:
            print(f"❌ PyPDF2 testi başarısız: {result.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"❌ PyPDF2 testi hatası: {e}")
    
    # Test 2: pdfplumber çıkarma
    tests_total += 1
    try:
        result = extractor.extract_with_pdfplumber(str(test_pdf))
        if 'pages' in result and not result.get('error'):
            print("✅ pdfplumber testi başarılı")
            tests_passed += 1
        else:
            print(f"❌ pdfplumber testi başarısız: {result.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"❌ pdfplumber testi hatası: {e}")
    
    # Test 3: tabula-py çıkarma
    tests_total += 1
    try:
        result = extractor.extract_tables_with_tabula(str(test_pdf))
        if 'tables' in result and not result.get('error'):
            print("✅ tabula-py testi başarılı")
            tests_passed += 1
        else:
            print(f"❌ tabula-py testi başarısız: {result.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"❌ tabula-py testi hatası: {e}")
    
    # Test 4: Kombine çıkarma
    tests_total += 1
    try:
        result = extractor.extract_combined(str(test_pdf))
        if result.get('summary') and not result.get('error'):
            print("✅ Kombine çıkarma testi başarılı")
            tests_passed += 1
        else:
            print(f"❌ Kombine çıkarma testi başarısız: {result.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"❌ Kombine çıkarma testi hatası: {e}")
    
    print(f"\n📊 PDF Extractor Test Sonuçları: {tests_passed}/{tests_total} başarılı")
    return tests_passed == tests_total


def test_format_detector():
    """Format Detector testleri"""
    print("\n" + "="*50)
    print("Format Detector Testleri")
    print("="*50)
    
    # Test dizini oluştur
    test_dir = Path("test_pdfs")
    test_dir.mkdir(exist_ok=True)
    
    # Test PDF'i oluştur
    test_pdf = test_dir / "test_document.pdf"
    if not create_test_pdf(str(test_pdf)):
        return False
    
    detector = PDFFormatDetector()
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Format tespiti
    tests_total += 1
    try:
        result = detector.detect_format(str(test_pdf))
        if result.get('format_type') and result.get('confidence'):
            print(f"✅ Format tespiti başarılı: {result['format_type']} ({result['confidence']:.1%})")
            tests_passed += 1
        else:
            print(f"❌ Format tespiti başarısız: {result.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"❌ Format tespiti testi hatası: {e}")
    
    # Test 2: Optimal strateji belirleme
    tests_total += 1
    try:
        strategies = detector.get_optimal_extraction_strategy(result)
        if strategies and len(strategies) > 0:
            print(f"✅ Optimal strateji belirleme başarılı: {strategies}")
            tests_passed += 1
        else:
            print(f"❌ Optimal strateji belirleme başarısız")
    except Exception as e:
        print(f"❌ Optimal strateji testi hatası: {e}")
    
    print(f"\n📊 Format Detector Test Sonuçları: {tests_passed}/{tests_total} başarılı")
    return tests_passed == tests_total


def test_pdf_orchestrator():
    """PDF Orchestrator testleri"""
    print("\n" + "="*50)
    print("PDF Orchestrator Testleri")
    print("="*50)
    
    # Test dizinlerini oluştur
    test_dir = Path("test_pdfs")
    test_dir.mkdir(exist_ok=True)
    
    # Test PDF'i oluştur
    test_pdf = test_dir / "test_document.pdf"
    if not create_test_pdf(str(test_pdf)):
        return False
    
    orchestrator = PDFOrchestrator(output_dir="test_orchestrator_output")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Tek dosya işleme
    tests_total += 1
    try:
        result = orchestrator.process_pdf(str(test_pdf), strategy="auto")
        if result.get('success') and result.get('final_output'):
            print("✅ Tek dosya işleme testi başarılı")
            tests_passed += 1
        else:
            print(f"❌ Tek dosya işleme testi başarısız: {result.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"❌ Tek dosya işleme testi hatası: {e}")
    
    # Test 2: Dizin işleme
    tests_total += 1
    try:
        results = orchestrator.process_directory(str(test_dir), strategy="auto")
        if results and len(results) > 0:
            print(f"✅ Dizin işleme testi başarılı: {len(results)} dosya işlendi")
            tests_passed += 1
        else:
            print("❌ Dizin işleme testi başarısız")
    except Exception as e:
        print(f"❌ Dizin işleme testi hatası: {e}")
    
    # Test 3: Rapor oluşturma
    tests_total += 1
    try:
        report_path = orchestrator.generate_report()
        if os.path.exists(report_path):
            print(f"✅ Rapor oluşturma testi başarılı: {report_path}")
            tests_passed += 1
        else:
            print("❌ Rapor oluşturma testi başarısız")
    except Exception as e:
        print(f"❌ Rapor oluşturma testi hatası: {e}")
    
    print(f"\n📊 PDF Orchestrator Test Sonuçları: {tests_passed}/{tests_total} başarılı")
    return tests_passed == tests_total


def test_json_serialization():
    """JSON serialization testleri"""
    print("\n" + "="*50)
    print("JSON Serialization Testleri")
    print("="*50)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Basit JSON testi
    tests_total += 1
    try:
        test_data = {
            "string": "test string",
            "number": 123,
            "boolean": True,
            "array": [1, 2, 3],
            "object": {"nested": "value"}
        }
        
        json_str = json.dumps(test_data, ensure_ascii=False, indent=2)
        parsed_data = json.loads(json_str)
        
        if parsed_data == test_data:
            print("✅ Basit JSON serialization testi başarılı")
            tests_passed += 1
        else:
            print("❌ Basit JSON serialization testi başarısız")
    except Exception as e:
        print(f"❌ Basit JSON serialization testi hatası: {e}")
    
    # Test 2: Complex data testi
    tests_total += 1
    try:
        from datetime import datetime
        import numpy as np
        
        complex_data = {
            "timestamp": datetime.now().isoformat(),
            "numpy_data": [1, 2, 3],
            "unicode_text": "Türkçe karakterler: çĞüşıİöŞ",
            "mixed_types": {
                "str": "text",
                "int": 42,
                "float": 3.14,
                "bool": True,
                "null": None
            }
        }
        
        json_str = json.dumps(complex_data, ensure_ascii=False, indent=2, default=str)
        parsed_data = json.loads(json_str)
        
        if "unicode_text" in parsed_data:
            print("✅ Complex JSON serialization testi başarılı")
            tests_passed += 1
        else:
            print("❌ Complex JSON serialization testi başarısız")
    except Exception as e:
        print(f"❌ Complex JSON serialization testi hatası: {e}")
    
    print(f"\n📊 JSON Serialization Test Sonuçları: {tests_passed}/{tests_total} başarılı")
    return tests_passed == tests_total


def run_all_tests():
    """Tüm testleri çalıştırır"""
    print("🚀 PDF Çıkarma Araçları Test Suite")
    print("="*60)
    
    test_results = []
    
    # Her test grubunu çalıştır
    tests = [
        ("JSON Serialization", test_json_serialization),
        ("PDF Extractor", test_pdf_extractor),
        ("Format Detector", test_format_detector),
        ("PDF Orchestrator", test_pdf_orchestrator)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} testi kritik hata: {e}")
            traceback.print_exc()
            test_results.append((test_name, False))
    
    # Sonuçları özetle
    print("\n" + "="*60)
    print("📋 GENEL TEST SONUÇLARI")
    print("="*60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        print(f"{test_name:25} : {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Toplam: {passed}/{total} test grubu başarılı")
    print(f"🎯 Başarı Oranı: {(passed/total*100):.1f}%")
    
    if passed == total:
        print("\n🎉 Tüm testler başarıyla tamamlandı!")
        return True
    else:
        print(f"\n⚠️ {total-passed} test grubu başarısız oldu.")
        return False


def cleanup_test_files():
    """Test dosyalarını temizler"""
    print("\n🧹 Test dosyaları temizleniyor...")
    
    test_dirs = [
        "test_pdfs",
        "test_extracted", 
        "test_orchestrator_output"
    ]
    
    import shutil
    
    for test_dir in test_dirs:
        try:
            if os.path.exists(test_dir):
                shutil.rmtree(test_dir)
                print(f"  ✅ {test_dir} silindi")
        except Exception as e:
            print(f"  ❌ {test_dir} silinemedi: {e}")


def main():
    """Ana test fonksiyonu"""
    import argparse
    
    parser = argparse.ArgumentParser(description='PDF Çıkarma Araçları Test Suite')
    parser.add_argument('--cleanup', action='store_true', help='Test dosyalarını temizle')
    parser.add_argument('--no-cleanup', action='store_true', help='Test sonrası temizlik yapma')
    
    args = parser.parse_args()
    
    if args.cleanup:
        cleanup_test_files()
        return
    
    try:
        # Testleri çalıştır
        success = run_all_tests()
        
        # Temizlik
        if not args.no_cleanup:
            cleanup_test_files()
        
        # Çıkış kodu
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Testler kullanıcı tarafından durduruldu.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Kritik test hatası: {e}")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()