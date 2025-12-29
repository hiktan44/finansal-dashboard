#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def analyze_tcmb_data():
    """PPTX analiz sonuçlarından TCMB ile ilgili tabloları ve linkleri çıkarır"""
    
    # JSON dosyasını oku
    with open('data/pptx_analysis_result.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    tcmb_data = {
        "tcmb_tables": [],
        "tcmb_links": [],
        "empty_tables": [],
        "analysis_summary": {
            "total_slides_with_tcmb": 0,
            "total_tcmb_tables": 0,
            "total_empty_tables": 0,
            "total_tcmb_links": 0
        }
    }
    
    # Tüm slaytları incele
    for slide in data['slides']:
        slide_num = slide['slide_number']
        content = slide.get('content', [])
        tables = slide.get('tables', [])
        links = slide.get('links', [])
        
        # Content içinde TCMB referansı var mı?
        has_tcmb_ref = False
        tcmb_links_found = []
        
        for content_item in content:
            if isinstance(content_item, str):
                # TCMB linklerini ara
                tcmb_matches = re.findall(r'www\.tcmb\.gov\.tr[^)\s]*', content_item)
                if tcmb_matches:
                    has_tcmb_ref = True
                    tcmb_links_found.extend(tcmb_matches)
                
                # Kaynak bilgilerini çıkar
                if 'Kaynak:' in content_item and 'tcmb' in content_item.lower():
                    # Kaynak satırını tam olarak çıkar
                    source_match = re.search(r'\(Kaynak:[^)]*tcmb[^)]*\)', content_item)
                    if source_match:
                        source_info = source_match.group()
                        tcmb_data["tcmb_links"].append({
                            "slide_number": slide_num,
                            "source": source_info.strip()
                        })
        
        # TCMB referansı olan slaytlar için tabloları kaydet
        if has_tcmb_ref or any('tcmb' in str(content_item).lower() for content_item in content):
            tcmb_data["analysis_summary"]["total_slides_with_tcmb"] += 1
            
            for table in tables:
                table_info = {
                    "slide_number": slide_num,
                    "table_name": table.get('name', ''),
                    "table_type": table.get('type', ''),
                    "content_snippet": ' '.join(content[:2]) if content else '',
                    "has_tcmb_source": len(tcmb_links_found) > 0
                }
                tcmb_data["tcmb_tables"].append(table_info)
                tcmb_data["analysis_summary"]["total_tcmb_tables"] += 1
        
        # Boş tabloları tespit et (Content Placeholder vb.)
        for table in tables:
            table_name = table.get('name', '')
            if any(placeholder in table_name.lower() for placeholder in [
                'content placeholder', 'içerik yer tutucusu', 'table'
            ]):
                # Bu tablonun TCMB ile ilgisi var mı kontrol et
                is_tcmb_related = False
                for content_item in content:
                    if isinstance(content_item, str) and 'tcmb' in content_item.lower():
                        is_tcmb_related = True
                        break
                
                empty_table_info = {
                    "slide_number": slide_num,
                    "table_name": table_name,
                    "table_type": table.get('type', ''),
                    "is_tcmb_related": is_tcmb_related,
                    "content_snippet": ' '.join(content[:2]) if content else ''
                }
                tcmb_data["empty_tables"].append(empty_table_info)
                tcmb_data["analysis_summary"]["total_empty_tables"] += 1
    
    # TCMB linklerini say
    tcmb_data["analysis_summary"]["total_tcmb_links"] = len(tcmb_data["tcmb_links"])
    
    # Sonuçları kaydet
    with open('tcmb_analysis_result.json', 'w', encoding='utf-8') as f:
        json.dump(tcmb_data, f, ensure_ascii=False, indent=2)
    
    print("TCMB Analizi Tamamlandı!")
    print(f"TCMB referansı olan slayt sayısı: {tcmb_data['analysis_summary']['total_slides_with_tcmb']}")
    print(f"TCMB tabloları sayısı: {tcmb_data['analysis_summary']['total_tcmb_tables']}")
    print(f"Boş tablolar sayısı: {tcmb_data['analysis_summary']['total_empty_tables']}")
    print(f"TCMB linkleri sayısı: {tcmb_data['analysis_summary']['total_tcmb_links']}")
    
    return tcmb_data

if __name__ == "__main__":
    analyze_tcmb_data()