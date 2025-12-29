#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
from typing import Dict, List, Any

def find_tuik_tables_and_links():
    """TÜİK ile ilgili tabloları ve linklerini tespit et"""
    
    # JSON dosyasını oku
    with open('/workspace/data/pptx_analysis_result.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    results = {
        "total_slides": data.get("total_slides", 0),
        "tuik_tables": [],
        "empty_tables": [],
        "tuik_links": [],
        "summary": {
            "total_tuik_tables": 0,
            "total_empty_tables": 0,
            "total_tuik_links": 0
        }
    }
    
    # Her slaytı analiz et
    for slide in data.get("slides", []):
        slide_number = slide.get("slide_number")
        content = slide.get("content", [])
        tables = slide.get("tables", [])
        
        # TÜİK linklerini ara
        tuik_links_in_slide = []
        for content_item in content:
            if isinstance(content_item, str):
                # TÜİK linklerini ara
                tuik_pattern = r'www\.tuik\.gov\.tr'
                if re.search(tuik_pattern, content_item, re.IGNORECASE):
                    # Tam linki ve tarihi çıkar
                    link_match = re.search(r'(Kaynak:[^)]*www\.tuik\.gov\.tr[^)]*)', content_item)
                    if link_match:
                        link_info = link_match.group(1).strip()
                        tuik_links_in_slide.append({
                            "slide_number": slide_number,
                            "content": link_info,
                            "url": "www.tuik.gov.tr"
                        })
        
        # TÜİK tabloları
        has_tuik_content = any("tuik.gov.tr" in str(item).lower() for item in content)
        
        # Tabloları analiz et
        for table in tables:
            table_name = table.get("name", "")
            
            # TÜİK tablosu mu?
            if has_tuik_content and table.get("type") == "table":
                results["tuik_tables"].append({
                    "slide_number": slide_number,
                    "table_name": table_name,
                    "table_type": table.get("type"),
                    "content_preview": str(content)[:200] + "..." if len(str(content)) > 200 else str(content)
                })
                results["summary"]["total_tuik_tables"] += 1
            
            # Boş tablo mu? (Content Placeholder)
            if "Content Placeholder" in table_name:
                results["empty_tables"].append({
                    "slide_number": slide_number,
                    "table_name": table_name,
                    "table_type": table.get("type")
                })
                results["summary"]["total_empty_tables"] += 1
        
        # TÜİK linklerini results'a ekle
        if tuik_links_in_slide:
            results["tuik_links"].extend(tuik_links_in_slide)
            results["summary"]["total_tuik_links"] += len(tuik_links_in_slide)
    
    # Tekrarları temizle
    seen_links = set()
    unique_tuik_links = []
    for link in results["tuik_links"]:
        link_key = f"{link['slide_number']}-{link['url']}"
        if link_key not in seen_links:
            seen_links.add(link_key)
            unique_tuik_links.append(link)
    
    results["tuik_links"] = unique_tuik_links
    results["summary"]["total_tuik_links"] = len(unique_tuik_links)
    
    # Tekrarlanan tabloları temizle
    seen_tables = set()
    unique_tuik_tables = []
    for table in results["tuik_tables"]:
        table_key = f"{table['slide_number']}-{table['table_name']}"
        if table_key not in seen_tables:
            seen_tables.add(table_key)
            unique_tuik_tables.append(table)
    
    results["tuik_tables"] = unique_tuik_tables
    results["summary"]["total_tuik_tables"] = len(unique_tuik_tables)
    
    return results

if __name__ == "__main__":
    results = find_tuik_tables_and_links()
    
    # Sonuçları JSON dosyasına kaydet
    with open('/workspace/tuik_analysis_result.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # Konsola özet bilgi yazdır
    print("TÜİK Tablo ve Link Analizi Tamamlandı!")
    print(f"Toplam Slayt: {results['total_slides']}")
    print(f"TÜİK Tablosu: {results['summary']['total_tuik_tables']}")
    print(f"Boş Tablo: {results['summary']['total_empty_tables']}")
    print(f"TÜİK Link: {results['summary']['total_tuik_links']}")
    print(f"Sonuç 'tuik_analysis_result.json' dosyasına kaydedildi.")