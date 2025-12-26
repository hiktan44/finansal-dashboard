#!/usr/bin/env python3
"""
Hızlı API Test - 10 saniye timeout
"""

import requests
import json
import time
import os
from datetime import datetime

def quick_api_test():
    print("🚀 Hızlı API Test")
    print("=" * 30)
    
    session = requests.Session()
    session.timeout = 10  # 10 saniye timeout
    
    # Test 1: OECD
    try:
        print("1. OECD test...")
        response = session.get("https://stats.oecd.org/SDMX-JSON/data/KEI/USA.PRMO.INDICATOR")
        print(f"   OECD: {response.status_code}")
    except Exception as e:
        print(f"   OECD: HATA - {str(e)[:30]}")
    
    # Test 2: FRED
    try:
        print("2. FRED test...")
        response = session.get("https://fred.stlouisfed.org/series/FEDFUNDS")
        print(f"   FRED: {response.status_code}")
    except Exception as e:
        print(f"   FRED: HATA - {str(e)[:30]}")
    
    # Test 3: World Bank (zoraten)
    try:
        print("3. World Bank test...")
        response = session.get("https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.PCAP.CD?format=json")
        print(f"   World Bank: {response.status_code}")
    except Exception as e:
        print(f"   World Bank: HATA - {str(e)[:30]}")
    
    print("=" * 30)
    print("✅ Hızlı test tamamlandı")

if __name__ == "__main__":
    quick_api_test()
