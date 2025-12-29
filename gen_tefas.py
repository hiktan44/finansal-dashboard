import json
import random
from datetime import datetime, timedelta

managers = [
    "Ak Portföy", "Garanti Portföy", "İş Portföy", "Yapı Kredi Portföy", 
    "TEB Portföy", "QNB Portföy", "Deniz Portföy", "HSBC Portföy", 
    "Allianz Portföy", "Avivasa Portföy", "Vakıf Portföy", "Ziraat Portföy",
    "Halk Portföy", "Oyak Portföy", "Gedik Portföy", "Tacirler Portföy"
]

types = ["equity", "bond", "mixed", "money_market", "precious_metal"]
funds = []

for i in range(850):
    fund_type = random.choice(types)
    manager = random.choice(managers)
    nav = round(random.uniform(0.01, 5.0), 6)
    prev_nav = nav * random.uniform(0.95, 1.05)
    
    funds.append({
        "symbol": f"FN{i+1:04d}",
        "name": f"{manager} {fund_type.title()} Fon {i+1}",
        "fund_type": fund_type,
        "manager": manager,
        "nav": nav,
        "previous_nav": round(prev_nav, 6),
        "change_percent": round(((nav - prev_nav) / prev_nav) * 100, 2),
        "performance_1m": round(random.uniform(-10, 15), 2),
        "performance_3m": round(random.uniform(-15, 25), 2),
        "performance_6m": round(random.uniform(-20, 40), 2),
        "performance_1y": round(random.uniform(-25, 60), 2),
        "performance_ytd": round(random.uniform(-15, 45), 2),
        "risk_score": random.randint(1, 10),
        "aum": round(random.uniform(10, 5000), 2),
        "expense_ratio": round(random.uniform(0.5, 3.0), 2),
        "category": random.choice(["Genel", "Teknoloji", "Enerji", "Finans"]),
        "currency": "TRY",
        "is_active": True
    })

with open('/workspace/tefas_850.json', 'w', encoding='utf-8') as f:
    json.dump(funds, f, indent=2, ensure_ascii=False)

print(f"✅ {len(funds)} TEFAS fonu oluşturuldu")
print(f"📁 Dosya kaydedildi: /workspace/tefas_850.json")
