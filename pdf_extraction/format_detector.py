"""
PDF Format Detector
==================

Bu modül PDF dosyalarının formatını tespit eder ve uygun çıkarma stratejisini belirler.
"""

import pdfplumber
import PyPDF2
import hashlib
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class PDFFormatDetector:
    """PDF formatını tespit eden sınıf"""
    
    def __init__(self):
        self.known_formats = {
            'scanned_image': {
                'keywords': ['image', 'jpeg', 'png', 'scanned', 'ocr'],
                'characteristics': ['low_text_ratio', 'high_image_content']
            },
            'text_based': {
                'keywords': ['text', 'font', 'embedded'],
                'characteristics': ['high_text_ratio', 'extractable_text']
            },
            'mixed_content': {
                'keywords': ['mixed', 'hybrid'],
                'characteristics': ['text_and_images', 'complex_layout']
            },
            'form_based': {
                'keywords': ['form', 'fillable', 'acroform'],
                'characteristics': ['interactive_elements', 'form_fields']
            },
            'table_heavy': {
                'keywords': ['table', 'data', 'spreadsheet'],
                'characteristics': ['many_tables', 'structured_data']
            }
        }
    
    def detect_format(self, pdf_path: str) -> Dict[str, Any]:
        """
        PDF formatını tespit eder
        
        Args:
            pdf_path (str): PDF dosyasının yolu
            
        Returns:
            Dict[str, Any]: Format tespit sonuçları
        """
        detection_result = {
            'file_name': Path(pdf_path).name,
            'file_path': pdf_path,
            'file_size': 0,
            'format_type': 'unknown',
            'confidence': 0.0,
            'characteristics': {},
            'recommendations': [],
            'analysis_details': {}
        }
        
        try:
            # Dosya bilgileri
            if os.path.exists(pdf_path):
                detection_result['file_size'] = os.path.getsize(pdf_path)
            
            # PyPDF2 ile analiz
            pypdf2_analysis = self._analyze_with_pypdf2(pdf_path)
            detection_result['analysis_details']['pypdf2'] = pypdf2_analysis
            
            # pdfplumber ile analiz
            pdfplumber_analysis = self._analyze_with_pdfplumber(pdf_path)
            detection_result['analysis_details']['pdfplumber'] = pdfplumber_analysis
            
            # Format tespiti
            format_type, confidence, characteristics = self._classify_format(
                pypdf2_analysis, pdfplumber_analysis
            )
            
            detection_result['format_type'] = format_type
            detection_result['confidence'] = confidence
            detection_result['characteristics'] = characteristics
            
            # Öneriler oluştur
            detection_result['recommendations'] = self._generate_recommendations(
                format_type, characteristics
            )
            
        except Exception as e:
            logger.error(f"Format tespit hatası: {e}")
            detection_result['error'] = str(e)
            
        return detection_result
    
    def _analyze_with_pypdf2(self, pdf_path: str) -> Dict[str, Any]:
        """PyPDF2 ile PDF analizi"""
        analysis = {
            'has_text': False,
            'text_extraction_possible': False,
            'has_images': False,
            'has_forms': False,
            'page_count': 0,
            'text_per_page_avg': 0,
            'has_encryption': False
        }
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                analysis['page_count'] = len(pdf_reader.pages)
                analysis['has_encryption'] = pdf_reader.is_encrypted
                
                if pdf_reader.metadata:
                    analysis['metadata'] = {
                        k: str(v) for k, v in pdf_reader.metadata.items()
                    }
                
                # Her sayfayı analiz et
                total_text = 0
                has_text_content = False
                
                for page in pdf_reader.pages:
                    try:
                        text = page.extract_text()
                        if text and text.strip():
                            has_text_content = True
                            total_text += len(text)
                    except:
                        continue
                
                analysis['has_text'] = has_text_content
                analysis['text_extraction_possible'] = has_text_content
                analysis['text_per_page_avg'] = total_text / analysis['page_count'] if analysis['page_count'] > 0 else 0
                
        except Exception as e:
            logger.error(f"PyPDF2 analiz hatası: {e}")
            analysis['error'] = str(e)
            
        return analysis
    
    def _analyze_with_pdfplumber(self, pdf_path: str) -> Dict[str, Any]:
        """pdfplumber ile PDF analizi"""
        analysis = {
            'has_text': False,
            'has_tables': False,
            'table_count': 0,
            'text_per_page_avg': 0,
            'table_density': 0,
            'page_analysis': []
        }
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                analysis['page_count'] = len(pdf.pages)
                
                page_texts = []
                total_tables = 0
                
                for page_num, page in enumerate(pdf.pages):
                    page_analysis = {
                        'page_number': page_num + 1,
                        'has_text': False,
                        'text_length': 0,
                        'has_tables': False,
                        'table_count': 0
                    }
                    
                    try:
                        # Metin analizi
                        text = page.extract_text()
                        if text and text.strip():
                            page_analysis['has_text'] = True
                            page_analysis['text_length'] = len(text)
                            page_texts.append(len(text))
                        
                        # Tablo analizi
                        tables = page.extract_tables()
                        if tables:
                            page_analysis['has_tables'] = True
                            page_analysis['table_count'] = len(tables)
                            total_tables += len(tables)
                        
                    except Exception as e:
                        logger.warning(f"Sayfa {page_num + 1} analiz hatası: {e}")
                    
                    analysis['page_analysis'].append(page_analysis)
                
                analysis['has_text'] = any(p['has_text'] for p in analysis['page_analysis'])
                analysis['has_tables'] = total_tables > 0
                analysis['table_count'] = total_tables
                analysis['text_per_page_avg'] = sum(page_texts) / len(page_texts) if page_texts else 0
                analysis['table_density'] = total_tables / analysis['page_count'] if analysis['page_count'] > 0 else 0
                
        except Exception as e:
            logger.error(f"pdfplumber analiz hatası: {e}")
            analysis['error'] = str(e)
            
        return analysis
    
    def _classify_format(self, pypdf2_analysis: Dict, pdfplumber_analysis: Dict) -> Tuple[str, float, Dict[str, Any]]:
        """PDF formatını sınıflandırır"""
        characteristics = {}
        scores = {}
        
        # Skorlama kriterleri
        if pypdf2_analysis.get('text_per_page_avg', 0) < 100:
            scores['scanned_image'] = scores.get('scanned_image', 0) + 0.3
            characteristics['low_text_ratio'] = True
        
        if pypdf2_analysis.get('text_per_page_avg', 0) > 1000:
            scores['text_based'] = scores.get('text_based', 0) + 0.4
            characteristics['high_text_ratio'] = True
        
        if pdfplumber_analysis.get('table_density', 0) > 0.5:
            scores['table_heavy'] = scores.get('table_heavy', 0) + 0.6
            characteristics['many_tables'] = True
        
        if pypdf2_analysis.get('text_per_page_avg', 0) > 100 and pdfplumber_analysis.get('table_count', 0) > 0:
            scores['mixed_content'] = scores.get('mixed_content', 0) + 0.3
            characteristics['text_and_tables'] = True
        
        if pdfplumber_analysis.get('table_count', 0) > 0:
            characteristics['structured_data'] = True
        
        # En yüksek skorlu formatı belirle
        if scores:
            format_type = max(scores.items(), key=lambda x: x[1])
            return format_type[0], format_type[1], characteristics
        
        return 'unknown', 0.0, characteristics
    
    def _generate_recommendations(self, format_type: str, characteristics: Dict[str, Any]) -> List[str]:
        """Format tipine göre öneriler oluşturur"""
        recommendations = []
        
        if format_type == 'scanned_image':
            recommendations.extend([
                "OCR (Optical Character Recognition) kullanın",
                "Görüntü tabanlı çıkarma araçlarını tercih edin",
                "Tesseract OCR ile metin tanıma yapmayı deneyin"
            ])
        
        elif format_type == 'text_based':
            recommendations.extend([
                "PyPDF2 veya pdfplumber kullanarak doğrudan metin çıkarın",
                "Metin işleme araçları ile formatlamayı iyileştirin"
            ])
        
        elif format_type == 'table_heavy':
            recommendations.extend([
                "tabula-py ile tablo çıkarımı yapın",
                "pdfplumber'ın tablo çıkarma özelliklerini kullanın",
                "Tablo verilerini CSV/Excel formatına dönüştürün"
            ])
        
        elif format_type == 'mixed_content':
            recommendations.extend([
                "Kombine yaklaşım kullanın (tüm yöntemleri birleştirin)",
                "Metin ve görsel içeriği ayrı ayrı işleyin",
                "Sayfa bazında farklı stratejiler uygulayın"
            ])
        
        else:
            recommendations.append("Manuel format analizi yapın")
            recommendations.append("Farklı çıkarma yöntemlerini deneyin")
        
        return recommendations
    
    def get_optimal_extraction_strategy(self, detection_result: Dict[str, Any]) -> List[str]:
        """Tespit edilen format için optimal çıkarma stratejisini belirler"""
        format_type = detection_result.get('format_type', 'unknown')
        characteristics = detection_result.get('characteristics', {})
        
        strategies = []
        
        if format_type == 'scanned_image':
            strategies = [
                "tabula-py",  # Tablolar için
                "pdfplumber"  # Sayfa yapısı için
            ]
        
        elif format_type == 'text_based':
            strategies = [
                "pypdf2",
                "pdfplumber"
            ]
        
        elif format_type == 'table_heavy':
            strategies = [
                "tabula-py",
                "pdfplumber"
            ]
        
        elif format_type == 'mixed_content':
            strategies = [
                "combined"  # Tüm yöntemleri kullan
            ]
        
        else:
            strategies = [
                "combined",  # Varsayılan kombine yaklaşım
                "pypdf2",
                "pdfplumber"
            ]
        
        return strategies


def main():
    """Test fonksiyonu"""
    detector = PDFFormatDetector()
    
    # Test için örnek kullanım
    # result = detector.detect_format("test.pdf")
    # print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()