#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TÜİK Dış Ticaret Verileri Analizi ve JSON Derleme
2024-2025 dönemi için aylık verilerin derlenmesi ve analiz edilmesi
"""

import json
import pandas as pd
from datetime import datetime
import re
from typing import Dict, Any

class TUKIKDisTicaretAnalyzer:
    def __init__(self):
        """TÜİK Dış Ticaret veri analizörü başlatma"""
        self.exports_data = {}
        self.imports_data = {}
        self.sectors_data = {}
        
        # Toplanan aylık veriler
        self.monthly_data = {
            "2024-08": {"exports": 22.048, "imports": 27.040},
            "2024-09": {"exports": 21.987, "imports": 27.116},
            "2024-10": {"exports": 23.500, "imports": 29.409},
            "2024-12": {"exports": 23.443, "imports": 32.221},
            "2025-02": {"exports": 20.761, "imports": 28.533},
            "2025-03": {"exports": 23.415, "imports": 30.610},
            "2025-05": {"exports": 24.817, "imports": 31.462},
            "2025-07": {"exports": 24.938, "imports": 31.383},
            "2025-08": {"exports": 21.729, "imports": 25.940}
        }
        
        # Sektörel dağılım verileri (en güncel veriler)
        self.sectoral_data = {
            "2024-12": {
                "imalat_sanayi": 93.7,
                "tarim_ormancilik_balikcilik": 4.1,
                "madencilik_tasocakciligi": 1.6
            },
            "2025-08": {
                "imalat_sanayi": 94.9,
                "tarim_ormancilik_balikcilik": 2.7,
                "madencilik_tasocakciligi": 1.6
            }
        }

    def parse_currency_value(self, value_str: str) -> float:
        """Para birimi değerlerini milyar USD'ye dönüştürür"""
        if isinstance(value_str, (int, float)):
            return float(value_str)
            
        # "milyar", "milyon" gibi terimleri temizle
        cleaned = re.sub(r'[^\d,.-]', '', str(value_str))
        cleaned = cleaned.replace(',', '.')
        
        # Milyar/milyon dönüşümü
        if 'milyar' in value_str.lower():
            return float(cleaned)
        elif 'milyon' in value_str.lower():
            return float(cleaned) / 1000
        else:
            return float(cleaned)

    def process_monthly_data(self):
        """Aylık verileri işle ve exports/imports dict'lerine dönüştür"""
        print("🔄 Aylık veriler işleniyor...")
        
        for date, data in self.monthly_data.items():
            # Tarihi YYYY-MM formatına dönüştür
            formatted_date = date
            
            # İhracat ve ithalat değerlerini kaydet
            self.exports_data[formatted_date] = round(data["exports"], 2)
            self.imports_data[formatted_date] = round(data["imports"], 2)
            
            print(f"  📊 {formatted_date}: İhracat {data['exports']:.2f} milyar USD, "
                  f"İthalat {data['imports']:.2f} milyar USD")

    def process_sectoral_data(self):
        """Sektörel dağılım verilerini işle"""
        print("🔄 Sektörel veriler işleniyor...")
        
        # Sektör ortalamalarını hesapla
        all_sectors = set()
        for date_data in self.sectoral_data.values():
            all_sectors.update(date_data.keys())
        
        sector_totals = {}
        sector_counts = {}
        
        for sector in all_sectors:
            sector_totals[sector] = 0
            sector_counts[sector] = 0
            
            for date_data in self.sectoral_data.values():
                if sector in date_data:
                    sector_totals[sector] += date_data[sector]
                    sector_counts[sector] += 1
        
        # Ortalama hesapla
        for sector in all_sectors:
            if sector_counts[sector] > 0:
                average_share = sector_totals[sector] / sector_counts[sector]
                self.sectors_data[sector] = round(average_share, 1)
                print(f"  🏭 {sector}: %{average_share:.1f} ortalama pay")

    def calculate_trends(self) -> Dict[str, Any]:
        """Trend analizleri hesapla"""
        print("🔄 Trend analizleri yapılıyor...")
        
        # Yıllık karşılaştırma
        export_2024 = [v for k, v in self.exports_data.items() if k.startswith('2024')]
        export_2025 = [v for k, v in self.exports_data.items() if k.startswith('2025')]
        import_2024 = [v for k, v in self.imports_data.items() if k.startswith('2024')]
        import_2025 = [v for k, v in self.imports_data.items() if k.startswith('2025')]
        
        trends = {
            "export_growth_2024": round(((sum(export_2024) / len(export_2024)) / sum(export_2024) * 100), 1) if export_2024 else 0,
            "export_growth_2025": round(((sum(export_2025) / len(export_2025)) / sum(export_2025) * 100), 1) if export_2025 else 0,
            "import_growth_2024": round(((sum(import_2024) / len(import_2024)) / sum(import_2024) * 100), 1) if import_2024 else 0,
            "import_growth_2025": round(((sum(import_2025) / len(import_2025)) / sum(import_2025) * 100), 1) if import_2025 else 0,
        }
        
        print(f"  📈 Ortalama ihracat artışı: %{trends['export_growth_2024']:.1f} (2024), %{trends['export_growth_2025']:.1f} (2025)")
        print(f"  📉 Ortalama ithalat artışı: %{trends['import_growth_2024']:.1f} (2024), %{trends['import_growth_2025']:.1f} (2025)")
        
        return trends

    def generate_final_json(self) -> Dict[str, Any]:
        """Final JSON formatını oluştur"""
        print("🔄 Final JSON formatı oluşturuluyor...")
        
        final_data = {
            "exports": self.exports_data,
            "imports": self.imports_data,
            "sectors": self.sectors_data,
            "metadata": {
                "data_source": "TÜİK - Türkiye İstatistik Kurumu",
                "period": "2024-2025",
                "system": "Genel Ticaret Sistemi",
                "currency": "USD (milyar)",
                "last_updated": datetime.now().isoformat(),
                "months_covered": list(self.exports_data.keys()),
                "data_points_count": len(self.exports_data)
            },
            "analysis": self.calculate_trends()
        }
        
        return final_data

    def save_to_json(self, data: Dict[str, Any], filename: str = "data/dis_ticaret_2024_2025.json"):
        """JSON dosyasını kaydet"""
        print(f"💾 Veriler {filename} dosyasına kaydediliyor...")
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Başarıyla kaydedildi: {filename}")
        return filename

    def print_summary(self, data: Dict[str, Any]):
        """Özet bilgileri yazdır"""
        print("\n" + "="*60)
        print("📊 TÜİK DIŞ TİCARET VERİLERİ - 2024-2025 ANALİZ RAPORU")
        print("="*60)
        
        print(f"\n📅 Kapsanan Dönem: {len(data['exports'])} ay")
        print(f"📅 İlk Veri: {min(data['exports'].keys())}")
        print(f"📅 Son Veri: {max(data['exports'].keys())}")
        
        print(f"\n💰 İhracat Verileri:")
        total_exports = sum(data['exports'].values())
        print(f"  Toplam: {total_exports:.1f} milyar USD")
        print(f"  Aylık Ortalama: {total_exports/len(data['exports']):.1f} milyar USD")
        
        print(f"\n📉 İthalat Verileri:")
        total_imports = sum(data['imports'].values())
        print(f"  Toplam: {total_imports:.1f} milyar USD")
        print(f"  Aylık Ortalama: {total_imports/len(data['imports']):.1f} milyar USD")
        
        print(f"\n🏭 Sektörel Dağılım:")
        for sector, share in data['sectors'].items():
            print(f"  {sector}: %{share}")
        
        print(f"\n📈 2024 vs 2025 Karşılaştırma:")
        exports_2024 = [v for k, v in data['exports'].items() if k.startswith('2024')]
        exports_2025 = [v for k, v in data['exports'].items() if k.startswith('2025')]
        if exports_2024 and exports_2025:
            avg_2024 = sum(exports_2024) / len(exports_2024)
            avg_2025 = sum(exports_2025) / len(exports_2025)
            growth = ((avg_2025 - avg_2024) / avg_2024) * 100
            print(f"  İhracat ortalaması değişimi: %{growth:+.1f}")
        
        print("\n" + "="*60)

def main():
    """Ana fonksiyon"""
    print("🚀 TÜİK Dış Ticaret Verileri Analizi Başlatılıyor...")
    print("="*60)
    
    analyzer = TUKIKDisTicaretAnalyzer()
    
    # Veri işleme adımları
    analyzer.process_monthly_data()
    analyzer.process_sectoral_data()
    
    # Final JSON oluştur
    final_data = analyzer.generate_final_json()
    
    # Özet yazdır
    analyzer.print_summary(final_data)
    
    # JSON dosyasını kaydet
    output_file = analyzer.save_to_json(final_data)
    
    print(f"\n🎉 Analiz tamamlandı!")
    print(f"📁 Çıktı dosyası: {output_file}")
    
    return final_data

if __name__ == "__main__":
    result = main()
