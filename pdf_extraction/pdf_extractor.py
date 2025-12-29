"""
PDF Çıkarma Araçları
====================

Bu modül PDF dosyalarından farklı yöntemlerle veri çıkarma işlevleri sağlar.
- PyPDF2: Metin çıkarma için
- pdfplumber: Gelişmiş metin ve tablo çıkarma için  
- tabula-py: Tablo çıkarma için
"""

import os
import json
import pandas as pd
import pdfplumber
import PyPDF2
import tabula
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

# Logging yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PDFExtractor:
    """PDF dosyalarından veri çıkarmak için ana sınıf"""
    
    def __init__(self, output_dir: str = "extracted_data"):
        """
        PDF Extractor başlatıcı
        
        Args:
            output_dir (str): Çıkarılan verilerin kaydedileceği dizin
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.supported_formats = ['.pdf']
        
    def extract_with_pypdf2(self, pdf_path: str) -> Dict[str, Any]:
        """
        PyPDF2 kullanarak PDF'den metin çıkarır
        
        Args:
            pdf_path (str): PDF dosyasının yolu
            
        Returns:
            Dict[str, Any]: Çıkarılan veriler
        """
        result = {
            'method': 'pypdf2',
            'file_name': Path(pdf_path).name,
            'pages': [],
            'total_text_length': 0,
            'metadata': {}
        }
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Metadata çıkarma
                if pdf_reader.metadata:
                    result['metadata'] = {
                        'title': pdf_reader.metadata.get('/Title', ''),
                        'author': pdf_reader.metadata.get('/Author', ''),
                        'subject': pdf_reader.metadata.get('/Subject', ''),
                        'creator': pdf_reader.metadata.get('/Creator', ''),
                        'producer': pdf_reader.metadata.get('/Producer', ''),
                        'creation_date': pdf_reader.metadata.get('/CreationDate', ''),
                        'modification_date': pdf_reader.metadata.get('/ModDate', '')
                    }
                
                # Her sayfadaki metni çıkarma
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        text = page.extract_text()
                        page_data = {
                            'page_number': page_num + 1,
                            'text': text,
                            'text_length': len(text)
                        }
                        result['pages'].append(page_data)
                        result['total_text_length'] += len(text)
                    except Exception as e:
                        logger.error(f"Sayfa {page_num + 1} çıkarılamadı: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"PyPDF2 ile PDF çıkarma hatası: {e}")
            result['error'] = str(e)
            
        return result
    
    def extract_with_pdfplumber(self, pdf_path: str) -> Dict[str, Any]:
        """
        pdfplumber kullanarak PDF'den metin ve tablo çıkarır
        
        Args:
            pdf_path (str): PDF dosyasının yolu
            
        Returns:
            Dict[str, Any]: Çıkarılan veriler
        """
        result = {
            'method': 'pdfplumber',
            'file_name': Path(pdf_path).name,
            'pages': [],
            'tables': [],
            'total_text_length': 0,
            'metadata': {}
        }
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Metadata çıkarma
                if pdf.metadata:
                    result['metadata'] = pdf.metadata
                
                # Her sayfadaki verileri çıkarma
                for page_num, page in enumerate(pdf.pages):
                    try:
                        page_data = {
                            'page_number': page_num + 1,
                            'text': '',
                            'tables': [],
                            'text_length': 0
                        }
                        
                        # Metin çıkarma
                        text = page.extract_text()
                        if text:
                            page_data['text'] = text
                            page_data['text_length'] = len(text)
                            result['total_text_length'] += len(text)
                        
                        # Tablo çıkarma
                        tables = page.extract_tables()
                        if tables:
                            for table_idx, table in enumerate(tables):
                                table_data = {
                                    'page_number': page_num + 1,
                                    'table_index': table_idx,
                                    'data': table,
                                    'rows': len(table),
                                    'columns': len(table[0]) if table else 0
                                }
                                page_data['tables'].append(table_data)
                                result['tables'].append(table_data)
                        
                        result['pages'].append(page_data)
                        
                    except Exception as e:
                        logger.error(f"Sayfa {page_num + 1} çıkarılamadı: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"pdfplumber ile PDF çıkarma hatası: {e}")
            result['error'] = str(e)
            
        return result
    
    def extract_tables_with_tabula(self, pdf_path: str, pages: str = "all") -> Dict[str, Any]:
        """
        tabula-py kullanarak PDF'den tablo verilerini çıkarır
        
        Args:
            pdf_path (str): PDF dosyasının yolu
            pages (str): İşlenecek sayfa aralığı ("all", "1-2", "3", vb.)
            
        Returns:
            Dict[str, Any]: Çıkarılan tablo verileri
        """
        result = {
            'method': 'tabula-py',
            'file_name': Path(pdf_path).name,
            'tables': [],
            'total_tables': 0,
            'parameters': {
                'pages': pages,
                'area': None,
                'guess': True,
                'area_coords': None
            }
        }
        
        try:
            # Tablo çıkarma
            tables = tabula.read_pdf(
                pdf_path,
                pages=pages,
                multiple_tables=True,
                guess=True,
                silent=True
            )
            
            for table_idx, table_df in enumerate(tables):
                if not table_df.empty:
                    table_data = {
                        'table_index': table_idx,
                        'data': table_df.to_dict('records'),
                        'columns': table_df.columns.tolist(),
                        'shape': table_df.shape,
                        'data_types': {col: str(dtype) for col, dtype in table_df.dtypes.items()},
                        'summary': {
                            'rows': len(table_df),
                            'columns': len(table_df.columns),
                            'null_values': table_df.isnull().sum().to_dict()
                        }
                    }
                    result['tables'].append(table_data)
                    
            result['total_tables'] = len(result['tables'])
            
        except Exception as e:
            logger.error(f"tabula-py ile tablo çıkarma hatası: {e}")
            result['error'] = str(e)
            
        return result
    
    def extract_combined(self, pdf_path: str) -> Dict[str, Any]:
        """
        Tüm yöntemleri birleştirerek kapsamlı çıkarma
        
        Args:
            pdf_path (str): PDF dosyasının yolu
            
        Returns:
            Dict[str, Any]: Tüm yöntemlerden çıkarılan veriler
        """
        result = {
            'file_name': Path(pdf_path).name,
            'file_path': pdf_path,
            'extraction_timestamp': pd.Timestamp.now().isoformat(),
            'pypdf2_result': {},
            'pdfplumber_result': {},
            'tabula_result': {},
            'summary': {}
        }
        
        try:
            # PyPDF2 çıkarma
            logger.info(f"PyPDF2 ile çıkarma başlatılıyor: {pdf_path}")
            result['pypdf2_result'] = self.extract_with_pypdf2(pdf_path)
            
            # pdfplumber çıkarma
            logger.info(f"pdfplumber ile çıkarma başlatılıyor: {pdf_path}")
            result['pdfplumber_result'] = self.extract_with_pdfplumber(pdf_path)
            
            # tabula-py çıkarma
            logger.info(f"tabula-py ile çıkarma başlatılıyor: {pdf_path}")
            result['tabula_result'] = self.extract_tables_with_tabula(pdf_path)
            
            # Özet oluşturma
            result['summary'] = self._create_summary(result)
            
        except Exception as e:
            logger.error(f"Kombine çıkarma hatası: {e}")
            result['error'] = str(e)
            
        return result
    
    def _create_summary(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Çıkarma sonuçlarından özet oluşturur
        
        Args:
            result (Dict[str, Any]): Çıkarma sonuçları
            
        Returns:
            Dict[str, Any]: Özet bilgiler
        """
        summary = {
            'total_pages': 0,
            'total_text_length': 0,
            'total_tables': 0,
            'extraction_methods': [],
            'file_size': 0,
            'extraction_success': True
        }
        
        try:
            file_path = result.get('file_path', '')
            if os.path.exists(file_path):
                summary['file_size'] = os.path.getsize(file_path)
            
            # PyPDF2 sonuçlarından bilgi toplama
            pypdf2_result = result.get('pypdf2_result', {})
            if not pypdf2_result.get('error'):
                summary['extraction_methods'].append('pypdf2')
                summary['total_pages'] = max(summary['total_pages'], len(pypdf2_result.get('pages', [])))
                summary['total_text_length'] += pypdf2_result.get('total_text_length', 0)
            
            # pdfplumber sonuçlarından bilgi toplama
            pdfplumber_result = result.get('pdfplumber_result', {})
            if not pdfplumber_result.get('error'):
                summary['extraction_methods'].append('pdfplumber')
                summary['total_pages'] = max(summary['total_pages'], len(pdfplumber_result.get('pages', [])))
                summary['total_text_length'] += pdfplumber_result.get('total_text_length', 0)
                summary['total_tables'] += len(pdfplumber_result.get('tables', []))
            
            # tabula-py sonuçlarından bilgi toplama
            tabula_result = result.get('tabula_result', {})
            if not tabula_result.get('error'):
                summary['extraction_methods'].append('tabula-py')
                summary['total_tables'] += tabula_result.get('total_tables', 0)
            
        except Exception as e:
            logger.error(f"Özet oluşturma hatası: {e}")
            summary['extraction_success'] = False
            
        return summary
    
    def save_to_json(self, data: Dict[str, Any], output_name: str = None) -> str:
        """
        Çıkarılan verileri JSON dosyasına kaydeder
        
        Args:
            data (Dict[str, Any]): Kaydedilecek veri
            output_name (str, optional): Çıktı dosya adı
            
        Returns:
            str: Kaydedilen dosyanın yolu
        """
        if output_name is None:
            file_name = data.get('file_name', 'extracted_data')
            output_name = f"{Path(file_name).stem}_extracted.json"
        
        output_path = self.output_dir / output_name
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
            
            logger.info(f"Veriler kaydedildi: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"JSON kaydetme hatası: {e}")
            raise
    
    def process_multiple_pdfs(self, pdf_directory: str, methods: List[str] = None) -> List[Dict[str, Any]]:
        """
        Birden fazla PDF dosyasını işler
        
        Args:
            pdf_directory (str): PDF dosyalarının bulunduğu dizin
            methods (List[str], optional): Kullanılacak çıkarma yöntemleri
            
        Returns:
            List[Dict[str, Any]]: İşlenen tüm dosyaların sonuçları
        """
        if methods is None:
            methods = ['combined']
        
        pdf_dir = Path(pdf_directory)
        if not pdf_dir.exists():
            raise FileNotFoundError(f"PDF dizini bulunamadı: {pdf_directory}")
        
        results = []
        pdf_files = list(pdf_dir.glob("*.pdf"))
        
        if not pdf_files:
            logger.warning(f"Dizinde PDF dosyası bulunamadı: {pdf_directory}")
            return results
        
        logger.info(f"İşlenecek PDF sayısı: {len(pdf_files)}")
        
        for pdf_path in pdf_files:
            try:
                logger.info(f"İşleniyor: {pdf_path.name}")
                
                for method in methods:
                    if method == 'combined':
                        result = self.extract_combined(str(pdf_path))
                    elif method == 'pypdf2':
                        result = self.extract_with_pypdf2(str(pdf_path))
                    elif method == 'pdfplumber':
                        result = self.extract_with_pdfplumber(str(pdf_path))
                    elif method == 'tabula':
                        result = self.extract_tables_with_tabula(str(pdf_path))
                    else:
                        logger.warning(f"Bilinmeyen yöntem: {method}")
                        continue
                    
                    result['processing_method'] = method
                    results.append(result)
                    
            except Exception as e:
                logger.error(f"PDF işleme hatası {pdf_path.name}: {e}")
                error_result = {
                    'file_name': pdf_path.name,
                    'error': str(e),
                    'processing_method': method
                }
                results.append(error_result)
        
        return results


def main():
    """Ana fonksiyon - test amaçlı"""
    # Test için örnek kullanım
    extractor = PDFExtractor(output_dir="extracted_pdfs")
    
    # Tek PDF işleme
    # result = extractor.extract_combined("test.pdf")
    # extractor.save_to_json(result)
    
    # Birden fazla PDF işleme
    # results = extractor.process_multiple_pdfs("pdf_folder", methods=['combined'])


if __name__ == "__main__":
    main()