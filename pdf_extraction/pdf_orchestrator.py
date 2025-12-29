"""
PDF Orchestrator
================

Bu modül PDF çıkarma sürecini koordine eder:
1. Format tespiti
2. Optimal strateji belirleme
3. Çoklu yöntem uygulama
4. Sonuçları birleştirme ve kaydetme
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

from pdf_extractor import PDFExtractor
from format_detector import PDFFormatDetector

logger = logging.getLogger(__name__)


class PDFOrchestrator:
    """PDF çıkarma sürecini koordine eden ana sınıf"""
    
    def __init__(self, output_dir: str = "extracted_pdfs"):
        """
        Orchestrator başlatıcı
        
        Args:
            output_dir (str): Çıktı dizini
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.pdf_extractor = PDFExtractor(output_dir=str(self.output_dir))
        self.format_detector = PDFFormatDetector()
        
        self.processing_stats = {
            'total_files': 0,
            'successful': 0,
            'failed': 0,
            'formats_detected': {}
        }
    
    def process_pdf(self, pdf_path: str, strategy: str = "auto") -> Dict[str, Any]:
        """
        Tek bir PDF dosyasını işler
        
        Args:
            pdf_path (str): PDF dosyasının yolu
            strategy (str): Çıkarma stratejisi ("auto", "pypdf2", "pdfplumber", "tabula", "combined")
            
        Returns:
            Dict[str, Any]: İşleme sonuçları
        """
        result = {
            'file_name': Path(pdf_path).name,
            'file_path': pdf_path,
            'processing_timestamp': datetime.now().isoformat(),
            'strategy': strategy,
            'format_detection': {},
            'extraction_results': {},
            'final_output': {},
            'success': False
        }
        
        try:
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF dosyası bulunamadı: {pdf_path}")
            
            # Format tespiti
            logger.info(f"Format tespiti başlatılıyor: {pdf_path}")
            format_detection = self.format_detector.detect_format(pdf_path)
            result['format_detection'] = format_detection
            
            # Strateji belirleme
            if strategy == "auto":
                strategy = self._determine_optimal_strategy(format_detection)
            result['strategy'] = strategy
            
            # Çıkarma işlemi
            logger.info(f"Çıkarma işlemi başlatılıyor (strateji: {strategy}): {pdf_path}")
            extraction_result = self._perform_extraction(pdf_path, strategy)
            result['extraction_results'] = extraction_result
            
            # Final çıktı oluşturma
            result['final_output'] = self._create_final_output(
                format_detection, extraction_result, strategy
            )
            
            result['success'] = not bool(extraction_result.get('error'))
            
            # İstatistikler güncelleme
            self._update_stats(result)
            
        except Exception as e:
            logger.error(f"PDF işleme hatası {pdf_path}: {e}")
            result['error'] = str(e)
            result['success'] = False
            self.processing_stats['failed'] += 1
        
        return result
    
    def _determine_optimal_strategy(self, format_detection: Dict[str, Any]) -> str:
        """Format tespitine göre optimal stratejiyi belirler"""
        optimal_strategies = self.format_detector.get_optimal_extraction_strategy(
            format_detection
        )
        
        # İlk stratejiyi döndür
        return optimal_strategies[0] if optimal_strategies else "combined"
    
    def _perform_extraction(self, pdf_path: str, strategy: str) -> Dict[str, Any]:
        """Seçilen stratejiye göre çıkarma işlemini gerçekleştirir"""
        if strategy == "pypdf2":
            return self.pdf_extractor.extract_with_pypdf2(pdf_path)
        elif strategy == "pdfplumber":
            return self.pdf_extractor.extract_with_pdfplumber(pdf_path)
        elif strategy == "tabula":
            return self.pdf_extractor.extract_tables_with_tabula(pdf_path)
        elif strategy == "combined":
            return self.pdf_extractor.extract_combined(pdf_path)
        else:
            raise ValueError(f"Geçersiz strateji: {strategy}")
    
    def _create_final_output(self, format_detection: Dict[str, Any], 
                           extraction_result: Dict[str, Any], strategy: str) -> Dict[str, Any]:
        """Final çıktıyı oluşturur"""
        final_output = {
            'extraction_method': strategy,
            'format_detected': format_detection.get('format_type', 'unknown'),
            'confidence': format_detection.get('confidence', 0.0),
            'data_summary': {},
            'recommendations': format_detection.get('recommendations', []),
            'output_files': []
        }
        
        # Veri özetini oluştur
        if strategy == "combined":
            final_output['data_summary'] = extraction_result.get('summary', {})
        else:
            # Tek yöntem için özet oluştur
            summary = {
                'total_pages': len(extraction_result.get('pages', [])),
                'total_text_length': extraction_result.get('total_text_length', 0),
                'total_tables': extraction_result.get('total_tables', len(extraction_result.get('tables', [])))
            }
            final_output['data_summary'] = summary
        
        return final_output
    
    def process_directory(self, pdf_directory: str, strategy: str = "auto") -> List[Dict[str, Any]]:
        """
        Dizindeki tüm PDF dosyalarını işler
        
        Args:
            pdf_directory (str): PDF dizini
            strategy (str): Çıkarma stratejisi
            
        Returns:
            List[Dict[str, Any]]: Tüm dosyaların işleme sonuçları
        """
        pdf_dir = Path(pdf_directory)
        if not pdf_dir.exists():
            raise FileNotFoundError(f"PDF dizini bulunamadı: {pdf_directory}")
        
        results = []
        pdf_files = list(pdf_dir.glob("*.pdf"))
        
        logger.info(f"İşlenecek PDF sayısı: {len(pdf_files)}")
        self.processing_stats['total_files'] = len(pdf_files)
        
        for i, pdf_path in enumerate(pdf_files, 1):
            logger.info(f"İşleniyor ({i}/{len(pdf_files)}): {pdf_path.name}")
            
            try:
                result = self.process_pdf(str(pdf_path), strategy)
                results.append(result)
                
                # Her sonucu ayrı ayrı kaydet
                output_name = f"{pdf_path.stem}_processed.json"
                self._save_result(result, output_name)
                
            except Exception as e:
                logger.error(f"Dosya işleme hatası {pdf_path.name}: {e}")
                error_result = {
                    'file_name': pdf_path.name,
                    'error': str(e),
                    'success': False
                }
                results.append(error_result)
        
        # Toplu sonuç kaydet
        self._save_batch_results(results)
        
        return results
    
    def _save_result(self, result: Dict[str, Any], output_name: str) -> str:
        """Tek sonucu JSON dosyasına kaydeder"""
        output_path = self.output_dir / output_name
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2, default=str)
            
            logger.info(f"Sonuç kaydedildi: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Sonuç kaydetme hatası: {e}")
            raise
    
    def _save_batch_results(self, results: List[Dict[str, Any]]) -> str:
        """Toplu sonuçları kaydeder"""
        batch_output = {
            'processing_summary': {
                'total_files': len(results),
                'successful': sum(1 for r in results if r.get('success', False)),
                'failed': sum(1 for r in results if not r.get('success', True)),
                'processing_timestamp': datetime.now().isoformat()
            },
            'format_statistics': self.processing_stats['formats_detected'],
            'results': results
        }
        
        output_path = self.output_dir / "batch_processing_results.json"
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(batch_output, f, ensure_ascii=False, indent=2, default=str)
            
            logger.info(f"Toplu sonuçlar kaydedildi: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Toplu sonuç kaydetme hatası: {e}")
            raise
    
    def _update_stats(self, result: Dict[str, Any]):
        """İstatistikleri günceller"""
        if result.get('success'):
            self.processing_stats['successful'] += 1
        else:
            self.processing_stats['failed'] += 1
        
        # Format istatistikleri
        format_type = result.get('format_detection', {}).get('format_type', 'unknown')
        if format_type in self.processing_stats['formats_detected']:
            self.processing_stats['formats_detected'][format_type] += 1
        else:
            self.processing_stats['formats_detected'][format_type] = 1
    
    def generate_report(self, results: List[Dict[str, Any]] = None, output_dir: str = None) -> str:
        """
        İşleme sonuçlarından rapor oluşturur
        
        Args:
            results (List[Dict[str, Any]], optional): İşleme sonuçları
            output_dir (str, optional): Raporun kaydedileceği dizin
            
        Returns:
            str: Rapor dosyasının yolu
        """
        if results is None:
            # Son batch sonuçlarını yükle
            target_dir = Path(output_dir) if output_dir else self.output_dir
            batch_file = target_dir / "batch_processing_results.json"
            if batch_file.exists():
                with open(batch_file, 'r', encoding='utf-8') as f:
                    batch_data = json.load(f)
                    results = batch_data.get('results', [])
            else:
                results = []
        
        report_content = self._create_report_content(results)
        report_path = (Path(output_dir) if output_dir else self.output_dir) / "pdf_extraction_report.md"
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report_content)
            
            logger.info(f"Rapor oluşturuldu: {report_path}")
            return str(report_path)
            
        except Exception as e:
            logger.error(f"Rapor oluşturma hatası: {e}")
            raise
    
    def _create_report_content(self, results: List[Dict[str, Any]]) -> str:
        """Rapor içeriğini oluşturur"""
        successful = sum(1 for r in results if r.get('success', False))
        failed = sum(1 for r in results if not r.get('success', True))
        
        # Format dağılımı
        format_dist = {}
        for result in results:
            format_type = result.get('format_detection', {}).get('format_type', 'unknown')
            format_dist[format_type] = format_dist.get(format_type, 0) + 1
        
        content = f"""# PDF Çıkarma Raporu

## Genel İstatistikler
- **Toplam Dosya:** {len(results)}
- **Başarılı:** {successful}
- **Başarısız:** {failed}
"""
        
        if len(results) > 0:
            content += f"- **Başarı Oranı:** {(successful/len(results)*100):.1f}%\n"
        else:
            content += f"- **Başarı Oranı:** 0%\n"
        
        content += "\n## Format Dağılımı\n"
        
        for format_type, count in format_dist.items():
            if len(results) > 0:
                percentage = (count/len(results)*100)
                content += f"- **{format_type.title()}:** {count} dosya ({percentage:.1f}%)\n"
            else:
                content += f"- **{format_type.title()}:** {count} dosya (0%)\n"
        
        content += f"""
## İşleme Detayları
### Başarılı Dosyalar
"""
        
        for result in results:
            if result.get('success'):
                file_name = result.get('file_name', 'Bilinmeyen')
                format_type = result.get('format_detection', {}).get('format_type', 'unknown')
                strategy = result.get('strategy', 'unknown')
                
                content += f"""
#### {file_name}
- **Format:** {format_type}
- **Strateji:** {strategy}
- **Zaman:** {result.get('processing_timestamp', 'N/A')}
"""
        
        if failed > 0:
            content += f"""
### Başarısız Dosyalar
"""
            for result in results:
                if not result.get('success'):
                    file_name = result.get('file_name', 'Bilinmeyen')
                    error = result.get('error', 'Bilinmeyen hata')
                    content += f"""
#### {file_name}
- **Hata:** {error}
"""
        
        # Başarı oranı hesapla
        success_rate = (successful/len(results)*100) if len(results) > 0 else 0.0
        
        # En sık format
        most_common_format = max(format_dist.items(), key=lambda x: x[1])[0] if format_dist else 'Bilinmiyor'
        
        content += f"""
## Öneriler
1. Format tespiti başarı oranı: {success_rate:.1f}%
2. En sık karşılaşılan format: {most_common_format}
3. Çıkarma stratejileri optimize edilebilir
"""
        
        return content


def main():
    """Ana fonksiyon - test amaçlı"""
    orchestrator = PDFOrchestrator(output_dir="processed_pdfs")
    
    # Tek dosya işleme
    # result = orchestrator.process_pdf("test.pdf", strategy="auto")
    # print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # Dizin işleme
    # results = orchestrator.process_directory("pdf_folder", strategy="auto")
    
    # Rapor oluşturma
    # report_path = orchestrator.generate_report()


if __name__ == "__main__":
    main()