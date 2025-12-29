# FRED API Anahtarı Alma Rehberi

## FRED API Anahtarı Nasıl Alınır?

1. **FRED Hesabı Oluşturun**
   - [https://fredaccount.stlouisfed.org](https://fredaccount.stlouisfed.org) adresine gidin
   - Ücretsiz bir hesap oluşturun

2. **API Anahtarı Alın**
   - Hesabınıza giriş yaptıktan sonra [https://fredaccount.stlouisfed.org/apikeys](https://fredaccount.stlouisfed.org/apikeys) sayfasına gidin
   - "API anahtarlarınızı isteyin veya görüntüleyin" linkine tıklayın
   - Yeni bir API anahtarı oluşturun (32 karakterli küçük harf, alfanümerik dize)

3. **Environment Variable Ayarlayın**
   - API anahtarını aldıktan sonra, environment variable olarak ayarlayın:
   ```bash
   export FRED_API_KEY="your_32_character_api_key_here"
   ```

## Toplanacak Seriler

Scriptimiz aşağıdaki serileri toplayacak:

### Faiz Oranları
- `FEDFUNDS`: Federal Reserve Faiz Oranı
- `DGS10`: ABD 10 Yıl Hazine Faizi
- `DGS2`: ABD 2 Yıl Hazine Faizi  
- `DGS1`: ABD 1 Yıl Hazine Faizi

### Makroekonomik Göstergeler
- `CPIAUCSL`: ABD TÜFE (Consumer Price Index)
- `UNRATE`: ABD İşsizlik Oranı
- `GDP`: ABD Gayri Safi Yurt İçi Hasıla

### Döviz Kurları
- `DEXUSAL`: USD/AUD
- `DEXCHUS`: USD/CNY
- `DEXDEUS`: USD/EUR
- `DEXJPUS`: USD/JPY
- `DEXUKUS`: USD/GBP

## API Anahtarını Ayarladıktan Sonra

```bash
cd /workspace/data
python fred_data_collector.py
```

Bu komut tüm verileri `fred_global_indicators.json` dosyasına kaydedecek.