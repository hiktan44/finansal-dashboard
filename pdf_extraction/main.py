#!/usr/bin/env python3
"""
PDF Çıkarma Ana Scripti
=======================

Bu script tüm PDF çıkarma araçlarını bir araya getirir ve kullanıcı dostu bir arayüz sağlar.

Kullanım:
    python main.py [seçenekler]

Seçenekler:
    --input, -i     : PDF dosyası veya dizin yolu
    --output, -o    : Çıktı dizini (varsayılan: extracted_pdfs)
    --strategy, -s  : Çıkarma stratejisi (auto, pypdf2, pdfplumber, tabula, combined)
    --analyze-only  : Sadece format analizi yap
    --report        : İşlem sonrası rapor oluştur
    --help, -h      : Yardım bilgisi
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any

# PDF araçlarını import et
try:
    from pdf_orchestrator import PDFOrchestrator
    from format_detector import PDFFormatDetector
except ImportError as e:
    print(f"Modül import hatası: {e}")
    print("Lütfen requirements.txt'teki paketleri yükleyin:")
    print("pip install -r requirements.txt")
    sys.exit(1)


def setup_logging():
    """Loglama ayarlarını yapılandırır"""
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('pdf_extraction.log')
        ]
    )


def validate_input_path(input_path: str) -> bool:
    """Giriş yolunun geçerli olup olmadığını kontrol eder"""
    path = Path(input_path)
    
    if not path.exists():
        print(f"Hata: Yol bulunamadı: {input_path}")
        return False
    
    if path.is_file() and path.suffix.lower() != '.pdf':
        print(f"Hata: Desteklenmeyen dosya formatı: {path.suffix}")
        print("Sadece PDF dosyaları desteklenmektedir.")
        return False
    
    if path.is_dir():
        pdf_files = list(path.glob("*.pdf"))
        if not pdf_files:
            print(f"Uyarı: Dizinde PDF dosyası bulunamadı: {input_path}")
            return False
    
    return True


def display_file_info(input_path: str):
    """Dosya bilgilerini gösterir"""
    path = Path(input_path)
    
    print(f"\n{'='*60}")
    print(f"PDF Dosya Bilgileri")
    print(f"{'='*60}")
    
    if path.is_file():
        size_mb = path.stat().st_size / (1024 * 1024)
        print(f"Dosya: {path.name}")
        print(f"Boyut: {size_mb:.2f} MB")
        
    elif path.is_dir():
        pdf_files = list(path.glob("*.pdf"))
        total_size = sum(f.stat().st_size for f in pdf_files)
        total_size_mb = total_size / (1024 * 1024)
        
        print(f"Dizin: {path.name}")
        print(f"PDF Sayısı: {len(pdf_files)}")
        print(f"Toplam Boyut: {total_size_mb:.2f} MB")
        
        # İlk 5 dosyayı listele
        for i, pdf_file in enumerate(pdf_files[:5]):
            size_mb = pdf_file.stat().st_size / (1024 * 1024)
            print(f"  {i+1}. {pdf_file.name} ({size_mb:.2f} MB)")
        
        if len(pdf_files) > 5:
            print(f"  ... ve {len(pdf_files) - 5} dosya daha")
    
    print(f"{'='*60}\n")


def analyze_pdf(input_path: str, output_dir: str) -> str:
    """
    PDF format analizi yapar
    
    Args:
        input_path (str): PDF dosyasının yolu
        output_dir (str): Çıktı dizini
        
    Returns:
        str: Analiz sonuçlarının kaydedildiği dosya yolu
    """
    print("PDF Format Analizi Başlatılıyor...")
    
    detector = PDFFormatDetector()
    result = detector.detect_format(input_path)
    
    # Sonuçları kaydet
    output_path = Path(output_dir) / f"{Path(input_path).stem}_analysis.json"
    output_path.parent.mkdir(exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    # Sonuçları göster
    print(f"\nFormat Tespit Sonuçları:")
    print(f"  Format: {result.get('format_type', 'Bilinmiyor')}")
    print(f"  Güven: {result.get('confidence', 0):.1%}")
    print(f"  Dosya Boyutu: {result.get('file_size', 0) / (1024*1024):.2f} MB")
    
    recommendations = result.get('recommendations', [])
    if recommendations:
        print(f"\nÖneriler:")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
    
    print(f"\nAnaliz sonuçları kaydedildi: {output_path}")
    return str(output_path)


def process_pdf(input_path: str, output_dir: str, strategy: str = "auto", 
                create_report: bool = True) -> List[str]:
    """
    PDF çıkarma işlemini gerçekleştirir
    
    Args:
        input_path (str): PDF dosyası veya dizin yolu
        output_dir (str): Çıktı dizini
        strategy (str): Çıkarma stratejisi
        create_report (bool): Rapor oluşturulup oluşturulmayacağı
        
    Returns:
        List[str]: Oluşturulan dosya yolları listesi
    """
    print("PDF Çıkarma İşlemi Başlatılıyor...")
    
    orchestrator = PDFOrchestrator(output_dir=output_dir)
    path = Path(input_path)
    
    output_files = []
    
    try:
        if path.is_file():
            # Tek dosya işleme
            result = orchestrator.process_pdf(input_path, strategy)
            
            # Sonuç kaydet
            output_name = f"{path.stem}_extracted.json"
            saved_file = orchestrator._save_result(result, output_name)
            output_files.append(saved_file)
            
            # Başarı durumu
            if result.get('success'):
                print(f"✅ PDF başarıyla işlendi: {path.name}")
                
                # Özet bilgileri göster
                summary = result.get('final_output', {}).get('data_summary', {})
                print(f"  - Sayfa sayısı: {summary.get('total_pages', 0)}")
                print(f"  - Toplam metin uzunluğu: {summary.get('total_text_length', 0)}")
                print(f"  - Tablo sayısı: {summary.get('total_tables', 0)}")
            else:
                print(f"❌ PDF işleme başarısız: {path.name}")
                if 'error' in result:
                    print(f"  Hata: {result['error']}")
            
        elif path.is_dir():
            # Dizin işleme
            results = orchestrator.process_directory(input_path, strategy)
            
            successful = sum(1 for r in results if r.get('success', False))
            failed = len(results) - successful
            
            print(f"\n📊 Dizin İşleme Sonuçları:")
            print(f"  - Toplam: {len(results)} dosya")
            print(f"  - Başarılı: {successful}")
            print(f"  - Başarısız: {failed}")
            print(f"  - Başarı oranı: {(successful/len(results)*100):.1f}%")
            
            # Tüm sonuç dosyalarını listele
            for result in results:
                if result.get('success'):
                    file_name = result.get('file_name', 'unknown')
                    output_files.append(f"{output_dir}/{Path(file_name).stem}_processed.json")
            
            # Batch sonuçları
            batch_file = f"{output_dir}/batch_processing_results.json"
            output_files.append(batch_file)
        
        # Rapor oluştur
        if create_report:
            print("\nRapor oluşturuluyor...")
            try:
                if path.is_file():
                    # Tek dosya için sonucu rapor oluşturma fonksiyonuna gönder
                    report_path = orchestrator.generate_report(results=[result], output_dir=output_dir)
                else:
                    # Dizin için batch sonuçlarını yükle
                    batch_file = Path(output_dir) / "batch_processing_results.json"
                    if batch_file.exists():
                        with open(batch_file, 'r', encoding='utf-8') as f:
                            batch_data = json.load(f)
                            batch_results = batch_data.get('results', [])
                        report_path = orchestrator.generate_report(results=batch_results, output_dir=output_dir)
                    else:
                        # Fallback: Boş rapor
                        report_path = orchestrator.generate_report(results=[], output_dir=output_dir)
                
                output_files.append(report_path)
                print(f"📄 Rapor oluşturuldu: {report_path}")
            except Exception as e:
                print(f"❌ Rapor oluşturma hatası: {e}")
                import traceback
                traceback.print_exc()
        
    except Exception as e:
        print(f"❌ İşlem hatası: {e}")
        raise
    
    return output_files


def main():
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(
        description="PDF Çıkarma Araçları - Gelişmiş PDF veri çıkarma sistemi",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Örnekler:
  python main.py -i document.pdf                    # Tek dosya işleme
  python main.py -i pdf_folder/                     # Dizin işleme
  python main.py -i document.pdf -s combined        # Kombine strateji
  python main.py -i document.pdf --analyze-only     # Sadece analiz
  python main.py -i pdf_folder/ -o output/          # Özel çıktı dizini
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        required=True,
        help='PDF dosyası veya dizin yolu'
    )
    
    parser.add_argument(
        '--output', '-o',
        default='extracted_pdfs',
        help='Çıktı dizini (varsayılan: extracted_pdfs)'
    )
    
    parser.add_argument(
        '--strategy', '-s',
        choices=['auto', 'pypdf2', 'pdfplumber', 'tabula', 'combined'],
        default='auto',
        help='Çıkarma stratejisi (varsayılan: auto)'
    )
    
    parser.add_argument(
        '--analyze-only',
        action='store_true',
        help='Sadece format analizi yap (çıkarma yapma)'
    )
    
    parser.add_argument(
        '--report',
        action='store_true',
        default=True,
        help='İşlem sonrası rapor oluştur'
    )
    
    parser.add_argument(
        '--no-report',
        action='store_true',
        help='Rapor oluşturma'
    )
    
    args = parser.parse_args()
    
    # Loglama ayarla
    setup_logging()
    
    # Giriş yolu doğrula
    if not validate_input_path(args.input):
        sys.exit(1)
    
    # Dosya bilgilerini göster
    display_file_info(args.input)
    
    # İşlemi gerçekleştir
    try:
        if args.analyze_only:
            # Sadece analiz
            if Path(args.input).is_file():
                output_file = analyze_pdf(args.input, args.output)
                print(f"\n✅ Analiz tamamlandı. Sonuç: {output_file}")
            else:
                print("❌ Analiz seçeneği sadece tek dosya için geçerlidir.")
                sys.exit(1)
        else:
            # Çıkarma işlemi
            output_files = process_pdf(
                args.input, 
                args.output, 
                args.strategy, 
                not args.no_report
            )
            
            print(f"\n✅ İşlem tamamlandı!")
            print(f"📁 Oluşturulan dosyalar:")
            for output_file in output_files:
                print(f"  - {output_file}")
    
    except KeyboardInterrupt:
        print("\n\n⚠️ İşlem kullanıcı tarafından durduruldu.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Kritik hata: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()