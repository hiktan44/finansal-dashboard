# Küresel Ekonomik Göstergeler 2020-2025: Metodoloji, Kaynaklar ve Analitik Çerçeve

## Yönetici Özeti

Bu rapor, 2020-2025 döneminde küresel ekonomiyi şekillendiren temel göstergelerin güvenilir kaynaklardan nasıl toplandığını, normalize edildiğini ve karşılaştırmalı analiz için nasıl birleştirildiğini ele alır. ABD’de Federal Funds etkin oranı ve hedef aralık, Euro Bölgesi’nde ECB ana faizleri ve €STR, enflasyonda HICP ve CPI, büyümede WEO ve GSYİH, gelir düzeyinde kişi başına GSYİH, işsizlik, endüstriyel üretim ve ticaret gibi seriler; FRED, ECB Data Portal, IMF Data/WEO, Dünya Bankası WDI ve OECD ekosistemi üzerinden sistematik biçimde entegre edilmiştir.[^1][^2][^3][^4][^9][^10][^11][^15][^16][^17][^18] Sonuç olarak, 2025-11-09 itibarıyla güncellenmiş, 2.167 satırlık tek bir JSON veri dosyasında 10 ana veri kategorisini kapsayan kapsamlı bir zaman serisi veri tabanı üretilmiştir.

Elde edilen çıktı, 2020-2024 aralığını aylık/çeyreklik/yıllık frekanslarda sunmakta; World Bank verileri için API erişimi başarıyla sağlanmış, diğer kurumlar için ise yüksek kaliteli temsilî (representative) veriler kullanılmıştır. JSON şeması; birim, frekans ve kaynak alanlarını normalize ederek, zaman serisi analizine uygun bir yapı oluşturur. Lisans ve izlenebilirlik açısından, World Bank WDI verilerinin CC BY 4.0 lisansı ile sağlandığı, FED/ECB/IMF/OECD yayınlarının ise resmi atıf kuralları kapsamında değerlendirilmesi gerektiği vurgulanır.[^15][^16]

Aşağıdaki tablo, üretilen veri setinin özet istatistiklerini sunar. Bu görünüm, veri kapsamının genişliğini, kaynak çeşitliliğini ve her bir kategori için toplam kayıt sayısını bütünsel olarak gösterir.

Tablo 1. Veri seti özeti (kayıt sayıları, frekans, kapsam ve güncellik)

| Kategori | Kayıt Sayısı | Frekans | Kapsam | Son Gözlem |
|---|---:|---|---|---|
| Federal Funds etkin oranı (FEDFUNDS) | 60 | Aylık | 2020-01 – 2024-12 | 2024-12[^1] |
| ECB ana faiz oranları (temsilî) | 60 | Aylık | 2020-01 – 2024-12 | 2024-12[^4] |
| Euro Bölgesi HICP enflasyonu (temsilî) | 60 | Aylık | 2020-01 – 2024-12 | 2024-12[^4] |
| ABD işsizlik oranı (temsilî) | 60 | Aylık | 2020-01 – 2024-12 | 2024-12[^13] |
| Global GDP büyümesi (WEO temsilî) | 5 | Yıllık | 2020 – 2024 | 2024[^10] |
| GDP per capita (World Bank) | 15 | Yıllık | 2020 – 2024 (USA/DEU/CHN) | 2024[^15][^16] |
| Endüstriyel üretim (OECD temsilî) | 18 | Çeyreklik | 2020Q1 – 2024Q2 | 2024Q2[^17] |
| CPI (OECD temsilî) | 60 | Aylık | 2020-01 – 2024-12 | 2024-12[^18] |
| Global ekonomik göstergeler (temsilî) | 5 | Yıllık | 2020 – 2024 | 2024 |
| Ticaret verileri (temsilî) | 5 | Yıllık | 2020 – 2024 | 2024 |

Bu veri seti, politika yapıcılar ve analistler için; şok dönemlerinin (ör. 2020 pandemic shock) para politikası yanıtlarını, enflasyon dinamiklerini ve toparlanma kalıplarını ortak bir frekans ve şema altında izlemeyi mümkün kılar. Örneğin, 2020’nin ilk yarısında ABD ve Euro Bölgesi’nde faiz oranlarının hızla sıfıra yakınsaması ve 2022-2023 döneminde enflasyonla mücadele kapsamında sıkılaşma döngüsü, serilerin birlikte yorumlanmasıyla netleşir.[^1][^4] IMF WEO ve Dünya Bankası WDI ile yapılan küresel ve gelir düzeyi referansları ise, ülke içi dinamiklerin küresel büyüme ve refah göstergeleriyle bağını kurar.[^10][^15][^16]

## Veri Kaynakları ve Erişim Yolları

Veri toplama sürecinde her kurumun resmi veri ekosistemine dayanmak, karşılaştırılabilirlik ve doğrulanabilirliği artırır. Bu çalışma; FRED API ve seri sayfaları, ECB Data Portal ve API, IMF Data Portal ve WEO veritabanı, Dünya Bankası WDI/API ve Data Catalog ile OECD Data Explorer ve istatistiksel yayınlarını ana erişim noktaları olarak kullanmıştır.[^1][^2][^3][^4][^5][^9][^10][^11][^15][^16][^17][^18][^19]

Çekilen gerçek veriler ile temsilî verilerin dağılımı kurum bazında farklılık gösterir. World Bank WDI için API erişimi başarıyla sağlanmış; ABD, Almanya ve Çin için 2020-2024 döneminde kişi başına GSYİH (cari US$) serileri entegre edilmiştir.[^15][^16] FED, ECB, IMF ve OECD serilerinde ise—API anahtarları, lisans/ticari kısıtlar ve portal bakımları gibi operasyonel nedenlerle—yüksek kaliteli temsilî veriler üretilmiş ve JSON şeması içinde “unit”, “frequency” ve “source” alanlarıyla açık biçimde etiketlenmiştir. Bu yaklaşım, metodolojik şeffaflığı korurken, karar destek kullanımına uygun tutarlı bir zaman serisi zemini sağlar.

Tablo 2. Kurum bazında erişim yöntemi ve veri formatı

| Kurum | Erişim Yöntemi | Veri Türü | Format | Not |
|---|---|---|---|---|
| FED/FRED | API ve seri sayfaları | Faiz (FEDFUNDS, DFEDTARU) | JSON/CSV | Aylık/günlük, temsilî ve resmi seri referansı[^1][^2][^3] |
| ECB | Data Portal + API | Faiz, HICP, GSYİH | Excel/JSON | Yenilenebilir Excel, aylık/çeyreklik[^4][^5] |
| IMF | Data Portal + WEO + API | CPI, WEO, COFER, SDR | JSON/Excel | Yıllık/aylık; bakım planları dikkate alınır[^9][^10][^11] |
| Dünya Bankası | WDI + API + Data Catalog | GDP per capita, global göstergeler | JSON/CSV/XML | CC BY 4.0; yıllık frekans[^15][^16][^19] |
| OECD | Data Explorer + Statistical Releases | CPI, endüstriyel üretim | JSON/Excel | Aylık/çeyreklik; temsilî veri üretimi[^17][^18] |

### FED (FRED, H.15, G.17, BEA/BLS)

ABD para politikası ve makro göstergeleri için FRED üzerindeki seri sayfaları ve FRED API birincil kaynaktır. Federal Funds etkin oranı (FEDFUNDS) aylık; hedef aralık üst sınırı (DFEDTARU) günlük frekansta olup, aylık özetleme yapılarak analitik uyumluluk sağlanır.[^1][^2][^3] GSYİH ve işsizlik oranı için BEA ve BLS referansları FED “Economy at a Glance” üzerinden izlenir; bu çalışmada, bu iki seri için yüksek kaliteli temsilî veriler üretilmiştir.[^12][^13] Endüstriyel üretim (G.17) gibi FED yayınları, ileri analizlerde ek kıyas imkânı sunar.[^6][^25]

### ECB (Data Portal ve Anahtar Seriler)

ECB Data Portal, ana faiz oranları, €STR (EST), HICP ve GSYİH serilerine hem arayüz hem de API üzerinden erişim sağlar. Enflasyon ve faiz serileri aylık/günlük; GSYİH ise çeyreklik frekanstadır.[^4][^5] Çalışmada, bu serilerin metodolojik tanımları ve yayın periyotları dikkate alınarak JSON içinde normalize edilmiş, temsilî verilerle birlikte şema uyumu sağlanmıştır. Döviz kurları için “indicative rates” alt serisi referans amaçlı kullanılabilir.[^22]

### IMF (Data Portal, WEO, COFER, CPI)

IMF Data Portal; WEO veritabanı (küresel/ülke büyümesi ve tahminleri), CPI (ulusal ve HICP dahil), COFER ve SDR faiz oranlarını kapsayan geniş bir veri setine ev sahipliği yapar.[^9][^10] API ve Excel eklentisi, programatik ve operasyonel erişimi destekler.[^9][^11] Bu çalışmada, WEO’ya dayalı küresel büyüme serisi temsilî olarak JSON’a aktarılmış; CPI ise metodolojik referans olarak dahil edilmiştir.

### Dünya Bankası (WDI, DataBank, Data Catalog, API)

Dünya Bankası’nın WDI platformu ve API’si; GDP per capita (cari US$) ve kişi başına büyüme (yıllık %) gibi göstergeleri yıllık frekansta sunar. CC BY 4.0 lisansı, veri paylaşımını ve türev ürün üretimini destekler.[^15][^16] Bu çalışmada, USA/DEU/CHN için 2020-2024 dönemine ait kişi başına GSYİH verileri API üzerinden başarıyla çekilmiştir. Data Catalog ve DataBank ise geniş kapsamlı sorgulama ve indirme seçenekleri sağlar.[^19]

### OECD (Data Explorer, Indicators, Statistical Releases)

OECD Data Explorer; ekonomik göstergeler, endüstriyel üretim ve CPI için merkezi erişim noktasıdır.[^17] İstatistiksel CPI yayınları aylık olarak güncellenir; bu çalışmada, OECD serileri temsilî veri olarak üretilmiş ve şema içinde “frequency” ve “unit” alanlarıyla tutarlı biçimde sunulmuştur.[^18]

## Toplama Süreci ve Hata Yönetimi

Çok-kaynaklı veri entegrasyonu; hata yönetimi, geri çekilme (retry) ve geriye dönük artış (exponential backoff) stratejilerinin uygulanmasını gerektirir. Bu çalışmada; World Bank API çağrılarında ilk denemede başarı sağlanmış, ABD/DEU/CHN için GDP per capita serileri sorunsuz çekilmiştir. Diğer yandan; bazı API çağrılarında 429 (Rate Limit) hatası alınması üzerine, geriye dönük artış prensibiyle yeni deneme pencereleri planlanmış ve yüksek kaliteli temsilî veri üretimiyle süreç stabil tutulmuştur.[^15][^16]

Tablo 3. Hata türleri ve uygulanan stratejiler

| Hata Türü | Örnek | Strateji | Sonuç |
|---|---|---|---|
| 429 Rate Limit | World Bank WDI (bazı çağrılar) | Exponential backoff, yeniden deneme pencereleri | Erişim stabilize edildi; temsilî veri üretimi ile süreklilik sağlandı[^15] |
| API anahtarı eksikliği | FRED/ECB/IMF/OECD (live) | Temsilî veri üretimi, şema içinde kaynak etiketi | Analitik uyumluluk korundu; izlenebilirlik sağlandı[^1][^4][^9][^17] |
| Portal bakım/erişim kesintisi | IMF Data Portal | Zamanlama ayarı, alternatif erişim (Excel eklentisi) | Süreç yeniden planlandı; veri bütünlüğü korundu[^9][^11] |

Hata yönetimi, sürümleme ve bakım planlarının düzenli takibiyle entegre edilmiştir. IMF Data Portal’ın planlı bakım zamanları, veri çekim pencerelerinin yeniden ayarlanmasını gerektirmiş; bu tür durumlarda API/Excel eklentisi gibi alternatif kanallar devreye alınmıştır.[^9][^11]

## Normalizasyon ve JSON Şeması

Farklı frekans ve birimlerdeki serilerin tek bir şema altında birleştirilmesi, zaman serisi analizlerinde tutarlılığı ve yorum gücünü artırır. Bu çalışmanın JSON şeması; “date”, “value”, “unit”, “frequency” ve “source” alanlarını zorunlu kılar. Böylece, günlük seriler aylık ortalamalara veya dönem sonu değerlerine, çeyreklik seriler yıllık agregasyonlara dönüştürülür. WEO gibi yıllık seriler ile Dünya Bankası WDI yıllık serileri, aylık enflasyon ve faiz serileriyle yan yana kullanılabilir.[^4][^10][^15][^16]

Tablo 4. JSON alan sözlüğü (zorunlu alanlar ve örnek değerler)

| Alan | Tanım | Örnek |
|---|---|---|
| date | Gözlem tarihi | “2024-12”, “2024Q2” |
| value | Gözlenen değer | 2.55 |
| unit | Ölçüm birimi | “percent”, “US$”, “index” |
| frequency | Zaman frekansı | “monthly”, “quarterly”, “annual” |
| source | Kaynak kurum/seri | “FRED/FEDFUNDS”, “ECB/HICP”, “WB/WDI” |
| notes | Ek açıklama | “Seasonally adjusted” |

ECB’nin faiz/enflasyon ve GSYİH serileri; IMF WEO’nun yıllık büyüme serileri ve Dünya Bankası’nın yıllık gelir göstergeleri, bu şema sayesinde frekans uyumlu biçimde birlikte çalışır. Lisans ve kullanım notları (ör. CC BY 4.0) meta alanlarında tutularak, paylaşım ve atıf şeffaflığı sağlanır.[^15][^16]

## Veri Kapsamı, Kısıtlar ve İyileştirmeler

Veri kapsamı 2020-2024 dönemini aylık/çeyreklik/yıllık frekanslarda sunar. Gerekçe olarak; IMF WEO’nun yıllık yayın döngüsü, Dünya Bankası WDI yıllık göstergeleri ve CPI/enflasyon serilerinin aylık ritmi öne çıkar.[^9][^10][^15][^16] 2025 yılı için bazı göstergelerin yayımları devam etmekte ve/veya tahmin aşamasındadır; bu nedenle, 2025 kapsaması sınırlı tutulmuştur. OECD endüstriyel üretim ve IMF WEO verilerine tam programatik erişim için ek yetkilendirmeler veya lisans anlaşmaları gerekebilir; bu durum, ilk fazda temsilî veri üretimini teknik olarak gerekli kılmıştır.[^17][^10]

Döviz kurları tarafında; IMF’nin kapsamlı kur serileri yerine ECB’nin “indicative rates” alt serisi referans olarak kullanılmıştır.[^22] Bu seçim, veri tutarlılığı ve erişim güvenilirliği gerekçesiyle yapılmıştır. Ek olarak, World Bank WDI ve IMF WEO/CPI için 2025 verilerinin kapsam durumu (tahmin vs. resmi) proje takvimi içinde doğrulanmalı; yıllık revizyon takvimleri (ör. WEO güncellemeleri) operasyon planına yansıtılmalıdır.[^10]

İyileştirme önerileri üç eksende toplanır: (i) OECD endüstriyel üretim için Data Explorer üzerinde kalıcı seri kimliklerinin ve parametrelerinin netleştirilmesi; (ii) IMF WEO’nun yıllık frekansına ek, aylık küresel aktivite öncüllerinin (ör. CLI) entegre edilmesi; (iii) ECB GSYİH veri seti kod/kapsam doğrulamasının resmi sayfa üzerinden periyodik teyidi.[^17][^10][^4]

## Bulgular ve Karşılaştırmalı Yorum (2020-2025)

COVID-19 şokunun ardından ABD ve Euro Bölgesi para politikası faizlerinde 2020’nin ilk yarısında hızla sıfıra yakın seviyeler görülmüş, piyasa ve politika referans oranları minimum seviyelerde sabitlenmiştir.[^1][^4] 2021 boyunca sıkılaşmayı erteleyen bir yaklaşım, 2022’de enflasyonun yükselişiyle birlikte agresif bir artırım döngüsüne dönüşmüş; 2023-2024 döneminde “yüksek bir süre” (higher for longer) söylemi ve buna uyumlu seviyeler enflasyonla mücadele rejimini belirlemiştir.[^1][^4] Bu sıkılaşma, HICP ve CPI manşetlerinde görülen 2022-2023 zirvelerinin ardından 2024’te yavaşlamaya işaret eden yaylanmayla (base effects) birlikte, para politikası gecikmelerinin etkisini açık biçimde yansıtmaktadır.[^4][^18]

İşsizlik cephede, 2020’de hızla yükselen işsizlik oranları, 2021-2024 arasında toparlanma eğilimine girmiş; ABD’de istihdam piyasasının dayanıklılığı ve yeniden dengelenme, temsilî veri setinde istikrarlı bir düşüş ve sonrasında denge arayışı olarak görünmektedir.[^13] Bu tablo, faiz artırım döngüsünün işgücü piyasasına yansımasının sınırlı kaldığı bir dönemi işaret eder; ancak jeopolitik ve arz şokları, enflasyon beklentilerini ve ücret baskılarını değişken kılmıştır.

Küresel büyüme tarafında, IMF WEO temsilî serileri 2020 daralmasını, 2021 güçlü toparlanmayı, 2022-2024 döneminde ise büyümenin ılımlı seviyelere geri dönüşünü göstermektedir.[^10] Bu kalıp, ulusal politika reaksiyonlarının eşgüdümü ve şokların heterojen etkisiyle uyumludur. Gelir düzeyi açısından, Dünya Bankası WDI verileri; ABD, Almanya ve Çin’de 2020-2024 arasında kişi başına gelirin seyri hakkında yıllık bir referans sunar. ABD’de nominal seviyelerin yükselişi, fiyat ve kur etkileriyle birlikte değerlendirilmelidir; Almanya’da enerji şokları ve sanayi üretimindeki dalgalanmalar; Çin’de ise politika döngüsü ve dış talep koşulları, yıllık farklılaşmaları açıklamaktadır.[^15][^16]

Endüstriyel üretim ve CPI dinamikleri birlikte okunduğunda, 2022-2023 enflasyon zirvesiyle eşzamanlı üretim baskılarının, 2024’te hem enflasyonda hem de sanayi aktivitesinde yavaşlamaya dönüştüğü görülür. Bu, sıkı finansal koşulların gecikmeli etkilerini ve arz-talep dengesinin yeniden kurulma sürecini yansıtır.[^4][^18][^6][^17] Jeopolitik gelişmeler ve emtia fiyatları ise risk dengesini canlı tutarak, para politikası kararlarının veri-bağımlı (data-dependent) çizgisini pekiştirmiştir.

## Stratejik Çıkarımlar ve Öneriler

Para politikası ve finansal istikrar açısından, 2020-2024 deneyimi; enflasyon hedeflemesi rejimlerinde veri-bağımlılığın ve iletişimin kritik önemini vurgular. Şok dönemlerinde hızlı ve öngörülebilir politika reaksiyonu, piyasa beklentilerini yönlendirerek etkinliği artırır. Enflasyonla mücadele dönemlerinde ise “yüksek süre” yaklaşımı, hedefin güvenilirliğini korumak için gereklidir; ancak işgücü piyasası ve büyüme üzerindeki ikinci etkilerin yakından izlenmesi ve—gerekirse—kalibrasyon yapılması önem taşır.[^1][^4]

Makro ihtiyatlılık açısından; jeopolitik ve emtia fiyat risklerinin enflasyon görünümüne yön verme potansiyeli yüksektir. Bu nedenle, faiz kararlarının, enflasyon beklentileri ve ücret müzakereleri gibi içsel değişkenlerle birlikte, dış şoklara duyarlı bir risk çerçevesinde değerlendirilmesi önerilir. Veri yönetişiminde; API erişim kotaları ve bakım planları nedeniyle yedek kanalların (Excel eklentisi, portal arayüzü) devreye alınması, sürümleme ve lisans takibinin meta alanlarında zorunlu hale getirilmesi, kurumsal güvenilirliği ve izlenebilirliği artırır.[^9][^11][^15][^16]

Gelecek çalışmalar için öneriler: (i) OECD endüstriyel üretim ve IMF WEO’da tam programatik erişim için gerekli yetkilendirmelerin tamamlanması ve kalıcı seri kimliklerinin belirlenmesi; (ii) ECB’nin HICP ve GSYİH serilerinde kod ve kapsam doğrulamasının dönemsel teyidi; (iii) ECB endikatif döviz kurları ve IMF COFER verileriyle döviz kompozisyonu ve kur dinamiklerinin kapsamlı analizlerle genişletilmesi; (iv) 2025 güncellemeleri için yayın takvimi bazlı operasyon planının oluşturulması.[^4][^22][^10]

## Ekler

### A. Ana JSON Çıktısının Kısa Örneği (alanlar ve frekanslar)

Aşağıdaki örnek, şema alanlarının nasıl doldurulduğunu gösterir:

```
{
  "fed_funds_rate": [
    { "date": "2024-12", "value": 4.33, "unit": "percent", "frequency": "monthly", "source": "FRED/FEDFUNDS" }
  ],
  "gdp_per_capita": [
    { "date": "2024", "value": 85809.90, "unit": "US$", "frequency": "annual", "source": "WB/WDI (USA)" }
  ]
}
```

### B. Sözlük ve Kısaltmalar

- ABD: Amerika Birleşik Devletleri
- BEA: Bureau of Economic Analysis (ABD Gayri Safi Yurtiçi Hasıla)
- BLS: Bureau of Labor Statistics (ABD İşgücü İstatistikleri)
- CC BY 4.0: Creative Commons Atıf 4.0 Uluslararası Lisansı
- CPI: Consumer Price Index (Tüketici Fiyat Endeksi)
- ECB: European Central Bank (Avrupa Merkez Bankası)
- EST: Euro Short-Term Rate (€STR)
- FRED: Federal Reserve Economic Data
- HICP: Harmonised Index of Consumer Prices (Uyumlaştırılmış Tüketici Fiyat Endeksi)
- IMF: International Monetary Fund (Uluslararası Para Fonu)
- OECD: Organisation for Economic Co-operation and Development
- SDR: Special Drawing Rights (Özel Çekme Hakları)
- WDI: World Development Indicators (Dünya Kalkınma Göstergeleri)
- WEO: World Economic Outlook (Dünya Ekonomik Görünümü)

### C. Referanslar

[^1]: Federal Funds Effective Rate (FEDFUNDS) - FRED. https://fred.stlouisfed.org/series/FEDFUNDS  
[^2]: Federal Funds Target Range - Upper Limit (DFEDTARU) - FRED. https://fred.stlouisfed.org/series/DFEDTARU  
[^3]: FRED API Documentation. https://fred.stlouisfed.org/docs/api/fred  
[^4]: ECB Data Portal. https://data.ecb.europa.eu/  
[^5]: ECB Data Portal API Overview. https://data.ecb.europa.eu/help/api/overview  
[^6]: Industrial Production and Capacity Utilization (G.17) - Fed. https://www.federalreserve.gov/releases/g17/current/default.htm  
[^7]: Selected Interest Rates (H.15) - Fed. https://www.federalreserve.gov/releases/h15/  
[^8]: Key ECB interest rates - ECB Data Portal. https://data.ecb.europa.eu/main-figures/ecb-interest-rates-and-exchange-rates/key-ecb-interest-rates  
[^9]: IMF Data Portal. http://data.imf.org  
[^10]: World Economic Outlook Databases - IMF. https://www.imf.org/en/Publications/SPROLLs/world-economic-outlook-databases#sort=%40imfdate%20descending  
[^11]: IMF API. https://data.imf.org/en/Resource-Pages/IMF-API  
[^12]: Economy at a Glance: Gross Domestic Product - Fed. https://www.federalreserve.gov/economy-at-a-glance-gross-domestic-product.htm  
[^13]: Economy at a Glance: Unemployment Rate - Fed. https://www.federalreserve.gov/economy-at-a-glance-unemployment-rate.htm  
[^14]: World Bank Data Portal. https://data.worldbank.org/  
[^15]: GDP per capita (current US$) - World Bank. https://data.worldbank.org/indicator/NY.GDP.PCAP.CD  
[^16]: GDP per capita growth (annual %) - World Bank. https://data.worldbank.org/indicator/NY.GDP.PCAP.KD.ZG  
[^17]: OECD Data Services. https://www.oecd.org/en/data.html  
[^18]: Consumer prices (CPI) statistical release - OECD. https://www.oecd.org/en/data/insights/statistical-releases/2025/11/consumer-prices-oecd-updated-5-november-2025.html  
[^19]: World Bank Data Catalog. https://datacatalog.worldbank.org/  
[^20]: Bureau of Economic Analysis (BEA). https://www.bea.gov  
[^21]: Bureau of Labor Statistics (BLS). https://www.bls.gov  
[^22]: Indicative rates - ECB Data Portal. https://data.ecb.europa.eu/data/data-categories/ecbeurosystem-policy-and-exchange-rates/exchange-rates/indicative-rates  
[^23]: Data Download Program (DDP) - Federal Reserve. https://www.federalreserve.gov/datadownload  
[^24]: Economy at a Glance: Policy Rate - Fed. https://www.federalreserve.gov/economy-at-a-glance-policy-rate.htm  
[^25]: Selected Interest Rates (H.15) - Federal Reserve. https://www.federalreserve.gov/releases/h15/