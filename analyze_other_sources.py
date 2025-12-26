#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
from collections import defaultdict

def analyze_other_sources():
    """TÜİK, TCMB, Hazine, BIST, BDDK dışındaki diğer kaynakları analiz et"""
    
    # JSON dosyasını oku
    with open('/workspace/data/pptx_analysis_result.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Anahtar listesi - hariç tutulacak kaynaklar
    excluded_sources = ['TÜİK', 'TCMB', 'Hazine', 'BIST', 'BDDK', 'tuik.gov.tr', 'tcmb.gov.tr', 'muhasebat.gov.tr', 'hmb.gov.tr', 'bddk.org.tr']
    
    # Sonuçlar için değişkenler
    other_sources_tables = []
    other_source_links = []
    empty_tables = []
    
    # Slides array'ini işle
    for slide in data['slides']:
        slide_number = slide['slide_number']
        
        # 1. Tables'ı olan slaytları analiz et
        if 'tables' in slide and slide['tables']:
            for table in slide['tables']:
                table_info = {
                    'slide_number': slide_number,
                    'table_name': table.get('name', ''),
                    'table_type': table.get('type', '')
                }
                
                # Boş tablo kontrolü
                if 'Content Placeholder' in table.get('name', '') or 'Yer Tutucu' in table.get('name', ''):
                    table_info['is_empty'] = True
                    table_info['empty_reason'] = 'Content Placeholder'
                    empty_tables.append(table_info)
                else:
                    table_info['is_empty'] = False
                
                # Content alanında kaynak bilgilerini kontrol et
                if 'content' in slide:
                    for content_line in slide['content']:
                        if 'Kaynak:' in content_line or 'www.' in content_line:
                            # Hariç tutulacak kaynakları kontrol et
                            is_excluded = False
                            for excluded in excluded_sources:
                                if excluded.lower() in content_line.lower():
                                    is_excluded = True
                                    break
                            
                            # Hariç tutulmayan kaynakları ekle
                            if not is_excluded:
                                # URL'leri çıkar
                                urls = re.findall(r'https?://[^\s\)]+|www\.[^\s\)]+', content_line)
                                if urls:
                                    for url in urls:
                                        other_source_links.append({
                                            'slide_number': slide_number,
                                            'url': url,
                                            'context': content_line.strip()
                                        })
                                
                                # Kaynak: ile başlayan metinleri ekle
                                kaynak_match = re.search(r'Kaynak:\s*([^(www]*?)(?:\s+www\.|\s*$)', content_line)
                                if kaynak_match:
                                    source = kaynak_match.group(1).strip()
                                    if source and source not in [link['url'] for link in other_source_links]:
                                        other_source_links.append({
                                            'slide_number': slide_number,
                                            'url': source,
                                            'context': content_line.strip()
                                        })
                
                # Sadece TÜİK, TCMB, Hazine, BIST, BDDK dışındaki tabloları ekle
                if 'content' in slide:
                    has_excluded_source = False
                    for content_line in slide['content']:
                        for excluded in excluded_sources:
                            if excluded.lower() in content_line.lower():
                                has_excluded_source = True
                                break
                        if has_excluded_source:
                            break
                    
                    if not has_excluded_source:
                        other_sources_tables.append(table_info)
    
    # Benzersiz kaynakları çıkar
    unique_sources = []
    seen_urls = set()
    
    for link in other_source_links:
        if link['url'] not in seen_urls:
            unique_sources.append(link)
            seen_urls.add(link['url'])
    
    # Sonuçları sırala
    other_sources_tables.sort(key=lambda x: x['slide_number'])
    unique_sources.sort(key=lambda x: x['slide_number'])
    empty_tables.sort(key=lambda x: x['slide_number'])
    
    # Sonuç JSON'ını oluştur
    result = {
        'analysis_summary': {
            'total_slides': data['total_slides'],
            'slides_with_tables': len([s for s in data['slides'] if s.get('tables')]),
            'other_sources_tables_count': len(other_sources_tables),
            'other_source_links_count': len(unique_sources),
            'empty_tables_count': len(empty_tables)
        },
        'other_sources_tables': other_sources_tables,
        'other_source_links': unique_sources,
        'empty_tables': empty_tables,
        'source_categories': {
            'YIGM': [],
            'Kultur': [],
            'Investing': [],
            'Others': []
        }
    }
    
    # Kaynakları kategorilere ayır
    for link in unique_sources:
        url_lower = link['url'].lower()
        if 'yigm' in url_lower or 'ktb.gov.tr' in url_lower:
            result['source_categories']['YIGM'].append(link)
        elif 'kultur' in url_lower or 'gov.tr' in url_lower:
            result['source_categories']['Kultur'].append(link)
        elif 'investing.com' in url_lower:
            result['source_categories']['Investing'].append(link)
        else:
            result['source_categories']['Others'].append(link)
    
    return result

if __name__ == "__main__":
    result = analyze_other_sources()
    
    # Sonuçları dosyaya kaydet
    with open('/workspace/diger_kaynaklar_analizi.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print("Analiz tamamlandı!")
    print(f"Toplam slayt sayısı: {result['analysis_summary']['total_slides']}")
    print(f"Tablo içeren slayt sayısı: {result['analysis_summary']['slides_with_tables']}")
    print(f"Diğer kaynak tabloları: {result['analysis_summary']['other_sources_tables_count']}")
    print(f"Diğer kaynak linkler: {result['analysis_summary']['other_source_links_count']}")
    print(f"Boş tablolar: {result['analysis_summary']['empty_tables_count']}")
    
    print("\nKaynak kategorileri:")
    for category, links in result['source_categories'].items():
        print(f"  {category}: {len(links)} link")