# Küresel Ekonomik Göstergeler 2020-2025: Metodoloji, Kaynaklar ve Entegrasyon Planı

## Yönetici Özeti ve Kapsam

Bu rapor, 2020-2025 döneminde ABD, Euro Bölgesi ve küresel ölçekte izlenen başlıca ekonomik göstergelerin, resmi ve yüksek güvenilirlikli kaynaklardan nasıl toplanacağı, normalize edileceği ve tek bir çatı veri şemasında birleştirileceğine ilişkin teknik ve analitik bir çerçeve sunar. Çalışma; para politikası faiz oranları, enflasyon, büyüme, işsizlik, endüstriyel üretim ve kişi başına gelir gibi çekirdek serileri kapsar ve bu serilerin FRED (Federal Reserve Economic Data), ECB Data Portal, IMF veri ekosistemi, Dünya Bankası WDI/API ve OECD veri hizmetleri üzerinden erişimini sistematik biçimde tanımlar. Nihai hedef, bu serileri aylık ve çeyreklik frekanslarda uyumlu bir JSON şemasına bağlayarak, analistlerin karşılaştırmalı ve zamana duyarlı değerlendirmeler yapabilmesini sağlamaktır.

Kapsam dahilindeki göstergeler ve birincil kaynaklar aşağıdaki gibi özetlenebilir. Para politikası cephesinde ABD tarafında Federal Funds etkin oranı ve hedef aralık üst sınırı, Euro Bölgesi tarafında ECB’nin temel faiz oranları ve kısa vadeli referans niteliğindeki €STR (Euro Short-Term Rate) serileri planın merkezindedir.[^1][^2][^3][^4] Enflasyonda Euro Bölgesi HICP (Uyumlaştırılmış Tüketici Fiyat Endeksi) ve küresel karşılaştırmalar için IMF’nin CPI veri seti ve OECD’nin istatistiksel yayınları esas alınır.[^8][^9][^17][^18] Büyüme ve işsizlikte ABD GSYİH büyümesi ve işsizlik oranı için sırasıyla BEA ve BLS referans kaynakları; Euro Bölgesi GSYİH büyümesi için ECB Data Portal; küresel görünüm için IMF WEO; gelir düzeyi için Dünya Bankası WDI göstergeleri kullanılacaktır.[^12][^13][^7][^10][^11][^15][^16][^19] Endüstriyel üretimde FED G.17 ve OECD kanalları birlikte değerlendirilecektir.[^6][^17]

Bu raporun metodolojik omurgası, kurumların resmi veri yayın mekanizmalarına (portallar, API’ler, yayın bültenleri) yaslanan, izlenebilir ve tekrar edilebilir bir veri toplama ve doğrulama dizgesi önerir. Önerilen JSON çıktı şeması; kurum, gösterge, birim ve frekans alanları ile tarih-ist观察到 (observation) kayıtlarınınormalize eder. Böylece zaman serileri analizine uygun, kesintisiz ve çapraz-kaynak doğrulanabilir bir veri zemini elde edilir.

Rapor boyunca atıf yapılan ana kaynaklar ve erişim noktaları; FED veri ekosistemi ve FRED API,[^1][^2][^3] ECB Data Portal ve API,[^4][^5] IMF Data Portal, WEO ve API,[^9][^10][^11] Dünya Bankası WDI/API ve DataBank,[^14][^15][^16][^19] ile OECD Data Explorer ve istatistiksel yayınlarıdır.[^17][^18] Aşağıdaki tablo, kapsamdaki göstergeleri, ilgili kurumları, erişim yöntemlerini ve önerilen frekansları bir arada sunar.

Tablo 1. Kapsamdaki göstergeler, kurumlar, erişim yöntemleri ve frekans

| Gösterge | Kurum | Erişim Yöntemi | Önerilen Frekans |
|---|---|---|---|
| Federal Funds etkin oranı (FEDFUNDS) | FED/FRED | FRED API ve seri sayfası | Aylık[^1] |
| Federal Funds hedef aralık (üst limit, DFEDTARU) | FED/FRED | FRED API ve seri sayfası | Günlük (aylık özet önerilir)[^2] |
| Seçili Faiz Oranları (H.15) | FED | Resmi yayın (Data Download Program referansı) | Günlük (aylık özet önerilir)[^25] |
| ABD GSYİH büyümesi | BEA | “Economy at a Glance” üzerinden yayın | Çeyreklik[^12] |
| ABD işsizlik oranı | BLS | “Economy at a Glance” üzerinden yayın | Aylık[^13] |
| ECB ana faiz oranları | ECB | Veri portalı ve API | Günlük/aylık özet[^4] |
| €STR (EST) | ECB | Veri portalı veri seti | Günlük (aylık özet)[^4] |
| Euro Bölgesi HICP enflasyon | ECB | Veri portalı veri seti | Aylık[^4] |
| Euro Bölgesi GSYİH büyümesi | ECB | Veri portalı veri seti | Çeyreklik[^4] |
| Küresel GSYİH büyümesi (WEO) | IMF | WEO veritabanı ve Data Portal | Yıllık (tahminler dahil)[^10] |
| CPI (Tüketici Fiyat Endeksi) | IMF | Veri seti ve API | Aylık/Yıllık[^9] |
| Döviz kurları (endikatif) | ECB | Veri portalı (indicative rates) | Günlük (aylık özet)[^22] |
| Resmi döviz rezervlerinin para birimi bileşimi (COFER) | IMF | Veri seti (IFS kapsamında) | Çeyreklik/Yıllık[^10] |
| GDP per capita (cari US$) | Dünya Bankası | WDI sayfası ve API | Yıllık[^15][^16] |
| GDP per capita büyümesi (yıllık %) | Dünya Bankası | WDI sayfası ve API | Yıllık[^16] |
| Global ekonomik izleme (örn. Global Economic Monitor) | Dünya Bankası | Data Catalog | Aylık/Yıllık (seriye bağlı)[^19] |
| Endüstriyel üretim | FED (G.17) / OECD | Resmi yayın / Data Explorer | Aylık[^6][^17] |
| CPI (OECD manşet) | OECD | İstatistiksel yayın ve Data Explorer | Aylık[^18][^17] |

Yukarıdaki eşleştirme, veri toplama ve normalizasyon aşamasında hangi serinin hangi kanallardan ve hangi frekansta çekileceğine dair net bir yol haritası sağlar. Örneğin, Federal Funds etkin oranı (FEDFUNDS) FRED üzerinden aylık olarak alınırken; hedef aralık üst sınırı (DFEDTARU) günlük bir seri olmakla birlikte, analitik kullanımda aylık özetlenmesi önerilir.[^1][^2] ECB tarafında enflasyon ve faiz serileri aylık veya günlük olarak yayımlanır; Euro Bölgesi GSYİH büyümesi ise çeyreklik frekanstadır.[^4] IMF WEO verileri yıllık frekansta olup, hem tarihi hem de tahmin serileri içerir; CPI veri seti ise ülke ve bileşen bazında aylık/yıllık kırılımlar sunar.[^9][^10]

Zamanlama ve sürümleme açısından; her kurumun yayın takvimi ve portal bakım planları dikkate alınmalı, örneğin IMF Data Portal bakım saatleri veri çekimlerini etkileyebilir.[^9] Böyle durumlarda alternatif erişim kanalları (API, Excel eklentisi veya portalın farklı alt sayfaları) devreye alınmalıdır. Kapsam dışı kalan veya erişim kısıtı olan noktalar (OECD ve IMF WEO için aylık küresel GSYİH ve bazı döviz serileri gibi) raporun ilerleyen bölümlerinde açıkça belirtilmiş ve telafi stratejileri önerilmiştir.

## Veri Kaynakları ve Kapsam Eşlemesi (Kurum Bazında)

Veri toplama sürecinin başarısı, kurumların resmi veri ekosistemlerinin doğru eşleştirilmesine ve bu ekosistemler arası tutarlı bir dönüşüm dilinin kurulmasına bağlıdır. Aşağıda kurum bazında erişim yöntemleri, temel seriler ve beklenen frekanslar özetlenmiş; ardından bu çerçeve bir tabloyla pekiştirilmiştir.

### FED (FRED, H.15, G.17)

ABD para politikası ve makro göstergeleri için başlıca erişim kanalları, FRED seri sayfaları ve FRED API’dir. Federal Funds etkin oranı (FEDFUNDS) aylık; hedef aranık üst sınırı (DFEDTARU) günlük bir seridir.[^1][^2] FRED API, programatik erişim ve toplu indirme için temel araçtır.[^3] Seçili Faiz Oranları (H.15) ve Endüstriyel Üretim ve Kapasite Kullanımı (G.17) gibi yayınlar, FED’in Data Download Program (DDP) kapsamında referans veri setleri sunar.[^25][^6] ABD GSYİH büyümesi için BEA ve işsizlik oranı için BLS kaynakları “Economy at a Glance” üzerinden izlenir.[^12][^13]

Tablo 2. FED veri serileri: Erişim ve frekans

| Seri | Erişim | Frekans | Not |
|---|---|---|---|
| FEDFUNDS (etkin oran) | FRED API / seri sayfası | Aylık | Politika faizi etkin seviye[^1] |
| DFEDTARU (hedef aralık üst) | FRED API / seri sayfası | Günlük (aylık özet önerilir) | Para politikası hedef aralığı[^2] |
| H.15 (Seçili Faiz Oranları) | FED yayın | Günlük (aylık özet) | DDP kapsamı[^25] |
| G.17 (Endüstriyel Üretim) | FED yayın | Aylık | Kapasite kullanımıyla birlikte[^6] |
| ABD GSYİH büyümesi | BEA (FED sayfası üzerinden bağlantı) | Çeyreklik | Resmi istatistik[^12] |
| ABD işsizlik oranı | BLS (FED sayfası üzerinden bağlantı) | Aylık | Resmi istatistik[^13] |

### ECB (Data Portal ve Anahtar Seriler)

ECB Data Portal; faiz, enflasyon (HICP) ve GSYİH verilerine API ve yenilenebilir Excel üzerinden erişim sağlar. ECB ana faiz oranları (MRO, mevduat, marjinal fonlama) ile €STR (EST) politika ve piyasa referansı niteliğindeki kısa vadeli oranları kapsar.[^4] Euro Bölgesi HICP enflasyonu aylık; GSYİH büyümesi ise çeyreklik frekansta yayımlanır.[^4] Döviz kurlarının “indicative” günlük serileri de portaldan erişilebilir.[^22] ECB API’nin genel bakış ve veri çağrısı dokümantasyonu, programatik erişim için kılavuzdur.[^4][^5]

Tablo 3. ECB veri setleri: Kodlar ve frekans

| Gösterge | Veri Seti/Kod | Frekans | Not |
|---|---|---|---|
| ECB ana faiz oranları | Key ECB interest rates | Günlük/Aylık özet | Politika oranları[^4] |
| €STR (EST) | EST.B.EU000A2X2A25.WT | Günlük (aylık özet) | Kısa vadeli referans[^4] |
| HICP enflasyon | ICP.M.U2.N.000000.4.ANR | Aylık | Euro Bölgesi manşet[^4] |
| GSYİH büyümesi | MNA.Q.Y.I9.W2.S1.S1.B.B1GQ... | Çeyreklik | Reel büyüme[^4] |
| Endikatif döviz kurları | Indicative rates | Günlük (aylık özet) | Referans niteliğinde[^22] |

### IMF (Data Portal, WEO, COFER, SDR)

IMF Data Portal; WEO (World Economic Outlook) veritabanları, CPI veri seti ve COFER gibi geniş veri kaynaklarını tek bir ekosistemde sunar.[^9][^10] WEO küresel ve ülke bazlı büyüme tahminlerini yıllık frekansta sağlarken; CPI veri seti aylık ve yıllık kırılımlar içerir.[^9][^10] COFER resmi döviz rezervlerinin para birimi bileşimini, SDR faiz oranları ise küresel finansal koşullara ilişkin referansı sunar.[^10] IMF API programatik erişim sağlar; Excel eklentisi analistlere pratik bir veri indirme seçeneği sunar.[^9][^11]

Tablo 4. IMF veri setleri: Kapsam ve erişim

| Veri Seti | Kapsam | Frekans | Erişim |
|---|---|---|---|
| WEO | Küresel/ülke büyüme ve tahminler | Yıllık | Data Portal / WEO sayfası[^10] |
| CPI | Ulusal CPI ve bileşenleri, HICP dahil | Aylık/Yıllık | Data Portal / API[^9][^11] |
| COFER | Rezervlerin para birimi bileşimi | Çeyreklik/Yıllık | Data Portal[^10] |
| SDR faiz oranları | Referans oranlar | Aylık | Resmi sayfa[^10] |

### Dünya Bankası (WDI, DataBank, Data Catalog, API)

Dünya Bankası’nın World Development Indicators (WDI) ve DataBank platformları; GDP per capita (cari US$) ve kişi başına büyüme (yıllık %) gibi göstergeleri yıllık frekansta sunar.[^14][^15][^16] API üzerinden CSV/XML/Excel formatlarında indirme mümkündür; DataBank ve Data Catalog ise daha zengin sorgulama ve indirme seçenekleri sağlar.[^19] Geliştirici dokümantasyonu, API parametreleri ve lisans koşulları (CC BY-4.0) erişim ve paylaşım standartlarını netleştirir.[^15][^16]

Tablo 5. Dünya Bankası göstergeleri: Kod ve format

| Gösterge | Kod | Frekans | Erişim/Format |
|---|---|---|---|
| GDP per capita (cari US$) | NY.GDP.PCAP.CD | Yıllık | WDI sayfası, API (CSV/XML/Excel)[^15] |
| GDP per capita büyümesi (yıllık %) | NY.GDP.PCAP.KD.ZG | Yıllık | WDI sayfası, API (CSV/XML/Excel)[^16] |
| Global izleme (ör. GEM) | — | Aylık/Yıllık (seriye bağlı) | Data Catalog[^19] |

### OECD (Data Explorer, Indicators, Statistical Releases)

OECD Data Explorer, ekonomik göstergeler, endüstriyel üretim ve tüketici fiyat endeksi (CPI) verilerine erişim için merkezi platformdur.[^17] CPI’ye ilişkin en güncel istatistiksel yayınlar periyodik olarak güncellenir ve veri keşfi için giriş noktası sağlar; endüstriyel üretim ve ileri göstergeler de yine Data Explorer ve Indicators modülü üzerinden bulunabilir.[^17][^18]

Tablo 6. OECD veri erişim kanalları: Kullanım notları

| Kanal | Kullanım | Not |
|---|---|---|
| Data Explorer | Seri keşfi ve indirme | Sorgu tabanlı erişim[^17] |
| Indicators | Gösterge listeleri ve grafikler | Hızlı keşif[^17] |
| Statistical Releases (CPI) | Aylık güncellemeler ve bağlantılar | Enflasyon manşeti[^18] |

## Toplama ve Normalizasyon Metodolojisi

Bu çalışma, veri bütünlüğünü ve tekrar edilebilirliği garanti altına almak üzere, kaynak-odaklı bir toplama ve normalizasyon metodolojisi benimser. Yöntem üç temel aşamaya dayanır: (i) kaynak seçimi ve erişim, (ii) zaman damgası ve frekans uyumu, (iii) şema tasarımı ve doğrulama.

Birinci aşamada; her gösterge için kurumun resmi portalı veya API’si tercih edilir. FED serileri için FRED API, ECB için portal ve ilgili API çağrıları, IMF için Data Portal/WEO ve IMF API, Dünya Bankası için WDI/API ve DataBank, OECD için Data Explorer ve istatistiksel yayınlar ana kanallardır.[^1][^2][^3][^4][^5][^9][^10][^11][^15][^16][^17][^18] Erişim türleri, indirme seçenekleri ve yayın periyotları kurumun dokümantasyonu ve seri sayfalarında açıkça belirtilmiştir; bu bilgiler, toplama planının frekans ve sürüm stratejisini doğrudan yönlendirir.

İkinci aşamada; günlük seriler (ör. DFEDTARU, €STR) aylık ortalamalar veya dönem sonu değerler ile özetlenir. Aylık seriler (ör. HICP, FEDFUNDS) doğrudan aylık gözlemler olarak, çeyreklik seriler (Euro Bölgesi ve ABD GSYİH) çeyrek dönemler halinde tutulur. Yıllık seriler (IMF WEO, Dünya Bankası WDI) ise takvim yılı bazında normalize edilir. Bu sayede, tek bir JSON şeması altında frekans heterojenliği operasyonel olarak yönetilir.

Üçüncü aşamada; önerilen JSON şeması, meta ve gözlem düzeyinde verinin bağlamını ve yapısını açık biçimde tanımlar. Kurum ve gösterge kimlikleri, birim ve frekans bilgisi, tarih ve观察到的 (value) alanları zorunludur; kaynak ve lisans meta alanları izlenebilirlik sağlar.

Tablo 7. Önerilen JSON şeması (alanlar ve örnek değerler)

| Alan | Açıklama | Örnek |
|---|---|---|
| source_ref | Kaynak kısaltması/kimliği | “FED/FRED”, “ECB/EST”, “IMF/WEO”, “WB/WDI”, “OECD” |
| indicator_name | Göstergenin adı | “Federal Funds Effective Rate” |
| indicator_code | Göstergenin kodu/seri kimliği | “FEDFUNDS”, “NY.GDP.PCAP.CD” |
| unit | Ölçüm birimi | “Percent”, “US$”, “Index 2015=100” |
| frequency | Seri frekansı | “Monthly”, “Quarterly”, “Annual” |
| date | Gözlem tarihi (YYYY-MM-DD veya YYYY-Qn) | “2025-10-01”, “2025Q3” |
| observation | Gözlenen değer | 2.55 |
| source_url | Kaynağın yayın/portal adresi | (Kurum sayfası referansı) |
| license | Lisans/veri kullanım notu | “CC BY 4.0 (WB)”, “Resmi yayın (FED/ECB)” |
| notes | Ek notlar (örn. mevsimsellik) | “Seasonally adjusted” |

Bu şema; veri üretim hatlarında, sürüm değişiklikleri ve revizyonların meta seviyede izlenmesine, kaynağa geri dönüş (provenance) ve lisans takibinin kurumsallaşmasına imkan tanır.

## Veri Kalitesi, Doğrulama ve Sürümleme

Veri kalitesi; bütünlük, tutarlılık ve zamanlılık olmak üzere üç eksende değerlendirilir. Bütünlük, seri kapsamının 2020-2025 aralığını eksiksiz kapsamasını hedefler. Tutarlılık, aynı gösterge için farklı kaynaklar arasındaki sapmaların açıklanabilir ve dokümante edilmiş sınırlar içinde kalmasını gerektirir. Zamanlılık ise resmi revizyon takvimi ve portal bakım planlarına uyum ile sağlanır.

Doğrulama adımları üç katmandan oluşur. Birincisi, seri sayfası ve son güncelleme tarihlerinin kontrolü (ör. FRED ve ECB seri sayfalarında gösterilen güncelleme damgaları) ile güncellik teyidi yapılır.[^1][^4] İkincisi, alternatif kaynak çapraz kontrolü uygulanır (ör. CPI için IMF ve ECB karşılaştırması; endüstriyel üretim için FED G.17 ve OECD keşfi). Üçüncüsü, frekans ve birim dönüşümlerinde kurallı kalibrasyon yapılır (günlükten aylığa özetleme, çeyreklikten yıllığa dönüşüm). IMF portal ve API kullanım kılavuzları, sürüm ve bakım durumlarına dair operasyonel notlar içerir; bu bilgiler, zamanlama planı ve risk yönetiminde dikkate alınmalıdır.[^11]

Sürümleme; her indirmede tarih damgası ve kaynak referansının meta olarak saklanması, revizyonların versiyonlanması ve “yenilenebilir Excel” gibi otomatik güncellenen araçlar için referans sürümlerin belirlenmesi ile yürütülür.[^4] Böylece, geriye dönük analizlerde kullanılan veri setlerinin hangi yayın haline dayandığı açıkça izlenebilir.

## Uyum, Lisans ve Paylaşım

Veri kullanımında lisans ve atıf şeffaflığı esastır. Dünya Bankası WDI verileri CC BY 4.0 lisansı ile sağlanır; bu, uygun atıf yapılması koşuluyla paylaşım ve türev ürün oluşturmaya izin verir.[^15][^16] FED, ECB ve IMF yayınları resmi istatistik ürünleri olup, kurumsal atıf kuralları ve kullanım koşulları geçerlidir. OECD veri hizmetlerinde de benzer kurumsal atıf gereklilikleri bulunur; analiz ve görselleştirmelerde kurum referansları açık biçimde belirtilmelidir.[^17][^18]

Açık veri prensipleri gereği, şema ve meta alanlarında lisans bilgisi, kaynak URL’si (referans olarak) ve tarih damgası bulundurulması önerilir. Bu sayede veri tüketicileri, kullanım koşullarını ve veri üretim sürecinin izini kolayca görebilir.

## Entegrasyon Planı ve JSON Çıktı Spesifikasyonu

Entegrasyon, heterojen kaynakları tek bir şema altında birleştirmeyi amaçlar. Anahtarlar; “kurum”, “gösterge”, “tarih” ve “value” alanlarıdır. Meta alanlar; birim, frekans, kaynak ve notları içerir. Frekans dönüşümleri; günlük → aylık (ortalama veya dönem sonu), çeyreklik → yıllık (doğrudan yıllık veya dönemsel toplam/ortalama) olarak tanımlanır. Döviz kurlarında ECB’nin endikatif oranları referans alınırken; rezerv bileşimi (COFER) ve SDR faiz oranları IMF kaynakları üzerinden entegre edilir.[^22][^10]

Tablo 8. Entegrasyon eşlemesi: Kaynak → JSON alanları

| Kaynak Seri/Veri Seti | JSON indicator_code | JSON indicator_name | frequency | unit | notes |
|---|---|---|---|---|---|
| FEDFUNDS (FRED) | FEDFUNDS | Federal Funds Effective Rate | Monthly | Percent | Aylık gözlem[^1] |
| DFEDTARU (FRED) | DFEDTARU | Federal Funds Target Range (Upper) | Daily (Monthly avg) | Percent | Aylık özet önerilir[^2] |
| H.15 (FED) | H15_SELECTED | Selected Interest Rates | Daily (Monthly avg) | Percent | DDP kapsamı[^25] |
| EST (ECB) | EST_ECB | Euro Short-Term Rate (€STR) | Daily (Monthly avg) | Percent | Politika/piyasa referansı[^4] |
| HICP (ECB) | HICP | HICP Inflation (Euro area) | Monthly | Index/Percent | Manşet enflasyon[^4] |
| GDP (ECB) | GDPEA_QR | Euro Area Real GDP Growth | Quarterly | Percent | Çeyreklik büyüme[^4] |
| WEO (IMF) | WEO_GLOBAL_GDP | Global GDP Growth (WEO) | Annual | Percent | Tahminler dahil[^10] |
| CPI (IMF) | CPI_COUNTRY | Consumer Price Index | Monthly/Annual | Index | Ülke ve bileşen bazlı[^9] |
| COFER (IMF) | COFER | FX Reserves Composition | Quarterly/Annual | Percent Share | Para birimi kompozisyonu[^10] |
| SDR (IMF) | SDR_RATE | SDR Interest Rate | Monthly | Percent | Referans oran[^10] |
| WDI (WB) | NY.GDP.PCAP.CD | GDP per capita (current US$) | Annual | US$ | Yıllık gelir düzeyi[^15] |
| WDI (WB) | NY.GDP.PCAP.KD.ZG | GDP per capita growth (annual %) | Annual | Percent | Yıllık büyüme[^16] |
| GEM (WB) | GEM_SERIES | Global Economic Monitor | Monthly/Annual | Mixed | Katalogdan seriye bağlı[^19] |
| G.17 (FED) | IP_INDEX | Industrial Production Index | Monthly | Index 2017=100 | Kapasite kullanımıyla birlikte[^6] |
| CPI (OECD) | OECD_CPI | Consumer Prices (OECD) | Monthly | Index/Percent | Manşet CPI[^18] |

Bu eşleme, veri üretim hattında seri dönüşümlerinin kurallı ve izlenebilir yürütülmesine olanak tanır. Örneğin, DFEDTARU için günlük değerlerden aylık ortalamalar üretilirken; ECB’nin HICP serisi doğrudan aylık gözlemler olarak alınır. WEO gibi yıllık seriler, yıl bazında birleştirilir; Dünya Bankası WDI serileri yıllık frekansta tutulur ve analiz ihtiyacına göre çok yıllı pencerelerle kullanılır.

## Operasyonel Zamanlama, Bakım ve Risk Yönetimi

Operasyonel başarı için yayın takvimlerinin ve portal bakım planlarının izlenmesi gerekir. IMF Data Portal, planlı bakım nedeniyle belirli zaman aralıklarında erişime kapalı olabilir; bu tür durumlarda alternatif erişim kanalları (API veya Excel eklentisi) ile veri çekimi yeniden planlanmalıdır.[^9] FED ve ECB serileri sıklıkla güncellenir; veri indirme arayüzlerinin ve API çağrılarının sürüm notları takip edilmelidir.[^1][^4] OECD istatistiksel yayınları aylık ve çeyreklik periyotlarla güncellenir; CPI için güncel yayın tarihleri, veri seti keşfi ve doğrulamada referans alınmalıdır.[^18]

Hata toleransı için üç savunma hattı önerilir: (i) birincil erişim noktası yedekleri (portal ↔ API ↔ Excel eklentisi), (ii) otomatik retry ve zaman damgası tabanlı sürüm yönetimi, (iii) çapraz-kaynak tutarlılık kontrolleri (ör. HICP için ECB ve IMF CPI karşılaştırması). Raporlama ritmi; aylık ve çeyreklik periyotlarla senkronize edilerek, yıllık güncellemeler (WEO, WDI) dönemsel “major release” olarak ele alınmalıdır.

## Kısıtlar, Boşluklar ve İyileştirme Önerileri

Üç ana kısıt alanı öne çıkmaktadır. Birincisi, OECD endüstriyel üretim serilerine doğrudan programatik erişim noktalarının tam olarak belirlenmesi; Data Explorer ve Indicators modülü üzerinden erişim mümkün olsa da, seri kimlikleri ve API davranışı proje başlangıcında netleştirilmelidir.[^17] İkincisi, IMF WEO’da küresel GSYİH büyümesinin aylık bazda doğrudan mevcut olmaması; WEO yıllık frekans sunar, bu nedenle aylık küresel büyüme alternatif kaynaklardan veya model bazlı ara tahminlerle desteklenmelidir.[^10] Üçüncüsü, Euro Bölgesi GSYİH büyümesi için ECB veri setlerinin kesin seri kimliği ve çeyreklik kapsamı; veri keşfi sırasında kod ve kapsam doğrulaması yapılmalıdır.[^4]

Döviz kurlarında, IMF’nin kapsamlı kur serileri yerine ECB’nin endikatif oranlarının kullanılması önerilir; bu seriler, günlük frekansta olup analitikte aylık özetlenebilir.[^22] Ayrıca, Dünya Bankası WDI ve IMF WEO/CPI için 2025 verilerinin kapsama durumu (tahmin vs. resmi) proje zamanlaması içinde doğrulanmalı; yıllık yayın döngüsüne bağlı gecikmeler operasyon planına yansıtılmalıdır.

İyileştirme önerileri üç yönlüdür: (i) OECD serilerinde seri kimlikleri ve parametrelerin proje başında kalıcılaştırılması, (ii) IMF WEO verilerinin yıllık frekansına ek, aylık küresel aktivite veya öncü göstergelerle (CLI, sanayi üretimi) ara tahmin tabanlı büyüme göstergeleri üretilmesi, (iii) ECB GDP serilerinde kod doğrulaması ve çeyreklik kapsamın resmi sayfa üzerinden tekrar teyidi.

## Sonuç ve Eylem Planı

Bu rapor, resmi kaynaklardan 2020-2025 dönemine ilişkin çekirdek ekonomik göstergelerin toplanması, normalize edilmesi ve tek bir JSON şemasında birleştirilmesi için kapsamlı bir yol haritası sunmuştur. Aşağıdaki eylem planı, kısa vadeli üretim adımlarını ve orta vadeli iyileştirmeleri çerçeveler.

Kısa vadede öncelik; FED (FRED/FEDFUNDS, DFEDTARU), ECB (HICP, €STR), IMF (WEO, CPI), Dünya Bankası (WDI API) ve OECD (Data Explorer/Statistical Releases) serilerinin şema eşlemesiyle birlikte JSON üretim hattına bağlanmasıdır.[^1][^2][^4][^10][^15][^16][^17][^18] Şema doğrulaması; alan bütünlüğü, frekans uyumu ve birim/lisans meta kontrolünü içerir. Orta vadede; OECD ve IMF WEO kısıtları için alternatif seriler ve tahmin yaklaşımları, ECB GSYİH kod teyidi ve IMF döviz/COFER entegrasyonu tamamlanır.[^10] Uzun vadede; otomatik güncelleme, sürümleme ve revizyon izleme mekanizmaları ile veri hattının bakım maliyeti düşürülür, güvenilirlik artırılır.

Tablo 9. Eylem planı zaman çizelgesi

| Görev | Kaynak | Sorumlu | Bitiş Tarihi | Çıktı |
|---|---|---|---|---|
| FRED API’den FEDFUNDS ve DFEDTARU çekimi ve aylık özet | FRED | Veri Mühendisliği | 2025-12-15 | Aylık JSON (FAİZ) |
| ECB Data Portal HICP, EST ve GDP entegrasyonu | ECB | Veri Mühendisliği | 2025-12-20 | Aylık/Çeyreklik JSON (ENF, FAİZ, GSYİH) |
| IMF WEO ve CPI veri setlerinin yıllık/aylık entegrasyonu | IMF | Analist/Veri Mühendisliği | 2025-12-22 | Yıllık/Aylık JSON (BÜYÜME, CPI) |
| Dünya Bankası WDI API’den GDP per capita serileri | WB | Veri Mühendisliği | 2025-12-18 | Yıllık JSON (GELİR) |
| OECD Data Explorer ve CPI yayın entegrasyonu | OECD | Analist | 2025-12-25 | Aylık JSON (CPI) |
| Şema doğrulama, lisans ve sürümleme | Tümü | Veri Yönetimi | 2025-12-28 | Doğrulanmış JSON ve meta |
| Çapraz-kaynak doğrulama ve raporlama | Tümü | Analist | 2026-01-05 | Uyum ve kalite raporu |
| OECD endüstriyel üretim seri kimliklerinin netleştirilmesi | OECD | Analist | 2026-01-15 | Seri listesi ve erişim notları |
| IMF WEO aylık küresel büyüme alternatiflerinin değerlendirilmesi | IMF/OECD | Analist | 2026-01-20 | Ara tahmin yaklaşımı dokümanı |
| ECB GSYİH veri seti kod ve kapsam doğrulaması | ECB | Veri Mühendisliği | 2026-01-10 | Kod teyidi ve notlar |
| Otomatik güncelleme ve revizyon izleme kurulumu | Tümü | Veri Mühendisliği | 2026-02-15 | Zamanlanmış görevler ve log |

Bu takvim, resmi yayın periyotları ve portal bakım planları gözetilerek hazırlanmıştır. IMF Data Portal bakım nedeniyle planlanan kesintiler, veri çekim pencerelerinin yeniden planlanmasını gerektirebilir; bu durumda yedek kanallar devreye alınacaktır.[^9] Üretim hattı; frekans dönüşümlerini kurallı biçimde uygulayacak, birim ve lisans meta bilgilerini zorunlu alanlarla işleyecek ve sürümleme ile revizyon izlemeyi standartlaştıracaktır.

---

## Referanslar

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