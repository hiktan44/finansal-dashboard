#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
from datetime import datetime

def extract_bist_bddk_tables_and_links():
    """
    PPTX analiz sonuçlarından BIST ve BDDK ile ilgili tabloları ve kaynak linklerini çıkarır
    """
    
    # JSON dosyasını oku
    with open('/workspace/data/pptx_analysis_result.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Sonuçları saklayacak değişkenler
    result = {
        'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total_slides': data['total_slides'],
        'bist_bddk_tables': [],
        'bist_bddk_links': [],
        'empty_tables': [],
        'all_tables_count': 0,
        'bddk_tables': [],
        'bist_tables': [],
        'statistics': {
            'total_tables': 0,
            'empty_tables_count': 0,
            'bist_bddk_tables_count': 0,
            'bist_bddk_links_count': 0,
            'bddk_tables_count': 0,
            'bist_tables_count': 0
        }
    }
    
    print('🔍 BIST/BDDK Tablo ve Link Tespiti Başlatılıyor...')
    print('=' * 60)
    
    # Slides'ları dolaş
    for slide in data['slides']:
        slide_num = slide['slide_number']
        slide_content = slide.get('content', [])
        slide_title = slide.get('title', '')
        
        # Tabloları kontrol et
        if 'tables' in slide and slide['tables']:
            for table in slide['tables']:
                table_info = {
                    'slide_number': slide_num,
                    'table_name': table.get('name', ''),
                    'table_type': table.get('type', ''),
                    'content': slide_content,
                    'title': slide_title
                }
                result['statistics']['total_tables'] += 1
                
                # Boş tabloları tespit et (Content Placeholder, İçerik Yer Tutucusu vb.)
                table_name = table.get('name', '').lower()
                is_empty = any(keyword in table_name for keyword in [
                    'content placeholder', 
                    'içerik yer tutucusu',
                    'content placeholder 3',
                    'content placeholder 4',
                    'içerik yer tutucusu 3',
                    'içerik yer tutucusu 4',
                    'içerik yer tutucusu 5',
                    'içerik yer tutucusu 7'
                ])
                
                if is_empty:
                    result['empty_tables'].append(table_info)
                    result['statistics']['empty_tables_count'] += 1
                    continue
                
                # Content alanını kontrol et
                all_text = ' '.join(slide_content + [slide_title]).lower()
                
                # BDDK ile ilgili linkler ve tablolar
                if 'kaynak:' in all_text and any(keyword in all_text for keyword in ['bddk', 'bankacılık düzenleme']):
                    result['bddk_tables'].append(table_info)
                    result['statistics']['bddk_tables_count'] += 1
                    
                    # Linkleri çıkar
                    for content_item in slide_content:
                        if 'kaynak:' in content_item.lower():
                            # Linkleri regex ile çıkar
                            links = re.findall(r'www\.[^\s\)]+', content_item)
                            dates = re.findall(r'\d{1,2}\s+\w+\s+\d{4}', content_item)
                            
                            for link in links:
                                if 'bddk' in link:
                                    bist_bddk_link = {
                                        'slide_number': slide_num,
                                        'source': 'BDDK',
                                        'link': f'https://{link}' if not link.startswith('http') else link,
                                        'extracted_date': dates[0] if dates else '',
                                        'content': content_item,
                                        'table_name': table.get('name', '')
                                    }
                                    result['bist_bddk_links'].append(bist_bddk_link)
                                    result['bist_bddk_tables'].append(table_info)
                                    result['statistics']['bist_bddk_links_count'] += 1
                                    result['statistics']['bist_bddk_tables_count'] += 1
                                    break
                
                # BIST ile ilgili linkler ve tablolar
                if 'kaynak:' in all_text and any(keyword in all_text for keyword in ['bist', 'borsa istanbul', 'hisse senedi']):
                    result['bist_tables'].append(table_info)
                    result['statistics']['bist_tables_count'] += 1
                    
                    # Linkleri çıkar
                    for content_item in slide_content:
                        if 'kaynak:' in content_item.lower():
                            links = re.findall(r'www\.[^\s\)]+', content_item)
                            dates = re.findall(r'\d{1,2}\s+\w+\s+\d{4}', content_item)
                            
                            for link in links:
                                if 'bist' in link:
                                    bist_bddk_link = {
                                        'slide_number': slide_num,
                                        'source': 'BIST',
                                        'link': f'https://{link}' if not link.startswith('http') else link,
                                        'extracted_date': dates[0] if dates else '',
                                        'content': content_item,
                                        'table_name': table.get('name', '')
                                    }
                                    result['bist_bddk_links'].append(bist_bddk_link)
                                    result['bist_bddk_tables'].append(table_info)
                                    result['statistics']['bist_bddk_links_count'] += 1
                                    result['statistics']['bist_bddk_tables_count'] += 1
                                    break
                
                # Ek olarak, finansal kurum tablolarını da ara
                financial_keywords = ['kur korumalı', 'döviz mevduat', 'kredi', 'banka', 'mevduat']
                if any(keyword in all_text for keyword in financial_keywords) and 'kaynak:' in all_text:
                    if any(org in all_text for org in ['bddk', 'tcmb', 'merkez bankası']):
                        result['bddk_tables'].append(table_info)
                        result['statistics']['bddk_tables_count'] += 1
                        
                        # Linkleri çıkar
                        for content_item in slide_content:
                            if 'kaynak:' in content_item.lower():
                                links = re.findall(r'www\.[^\s\)]+', content_item)
                                dates = re.findall(r'\d{1,2}\s+\w+\s+\d{4}', content_item)
                                
                                for link in links:
                                    if any(org in link for org in ['bddk', 'tcmb']):
                                        # Bu BDDK veya TCMB kaynağı
                                        source = 'BDDK' if 'bddk' in link else 'TCMB'
                                        bist_bddk_link = {
                                            'slide_number': slide_num,
                                            'source': source,
                                            'link': f'https://{link}' if not link.startswith('http') else link,
                                            'extracted_date': dates[0] if dates else '',
                                            'content': content_item,
                                            'table_name': table.get('name', '')
                                        }
                                        result['bist_bddk_links'].append(bist_bddk_link)
                                        if source == 'BDDK':
                                            result['bist_bddk_tables'].append(table_info)
                                            result['statistics']['bist_bddk_tables_count'] += 1
                                        result['statistics']['bist_bddk_links_count'] += 1
                                        break
    
    # Tekrarları temizle (list değerler için özel işlem)
    seen_tables = set()
    cleaned_tables = []
    for table in result['bist_bddk_tables']:
        # List değerleri string'e çevir
        table_key = (
            table['slide_number'],
            table['table_name'],
            table['table_type'],
            str(table['content']),
            table['title']
        )
        if table_key not in seen_tables:
            seen_tables.add(table_key)
            cleaned_tables.append(table)
    result['bist_bddk_tables'] = cleaned_tables
    
    seen_links = set()
    cleaned_links = []
    for link in result['bist_bddk_links']:
        link_key = (
            link['slide_number'],
            link['source'],
            link['link'],
            link['extracted_date'],
            link['content'],
            link['table_name']
        )
        if link_key not in seen_links:
            seen_links.add(link_key)
            cleaned_links.append(link)
    result['bist_bddk_links'] = cleaned_links
    
    # Sonuçları yazdır
    print(f"📊 Toplam Slayt Sayısı: {result['total_slides']}")
    print(f"📋 Toplam Tablo Sayısı: {result['statistics']['total_tables']}")
    print(f"❌ Boş Tablo Sayısı: {result['statistics']['empty_tables_count']}")
    print(f"🏛️ BDDK Tablo Sayısı: {result['statistics']['bddk_tables_count']}")
    print(f"📈 BIST Tablo Sayısı: {result['statistics']['bist_tables_count']}")
    print(f"🔗 BIST/BDDK Link Sayısı: {result['statistics']['bist_bddk_links_count']}")
    print(f"📊 BIST/BDDK İlgili Tablo Sayısı: {result['statistics']['bist_bddk_tables_count']}")
    print()
    
    if result['bist_bddk_links']:
        print("🔗 Bulunan BIST/BDDK Linkler:")
        print("-" * 40)
        for link_info in result['bist_bddk_links']:
            print(f"Slayt {link_info['slide_number']}: {link_info['source']}")
            print(f"  Link: {link_info['link']}")
            print(f"  Tarih: {link_info['extracted_date']}")
            print(f"  Tablo: {link_info['table_name']}")
            print()
    
    if result['empty_tables']:
        print("❌ Bulunan Boş Tablolar:")
        print("-" * 30)
        for table_info in result['empty_tables'][:10]:  # İlk 10 boş tablo
            print(f"Slayt {table_info['slide_number']}: {table_info['table_name']}")
        if len(result['empty_tables']) > 10:
            print(f"... ve {len(result['empty_tables']) - 10} tane daha")
        print()
    
    return result

if __name__ == "__main__":
    result = extract_bist_bddk_tables_and_links()
    
    # Sonuçları JSON dosyasına kaydet
    output_file = '/workspace/bist_bddk_analiz_sonucu.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Analiz tamamlandı. Sonuçlar '{output_file}' dosyasına kaydedildi.")