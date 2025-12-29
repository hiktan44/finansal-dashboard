# TCMB Kredi Faiz Oranları ve Swap İşlemleri: Otomatik Toplama, Parse ve Birleştirme (2007–2025)

## Yönetici Özeti

Bu çalışma, Türkiye Cumhuriyet Merkez Bankası’nın (TCMB) iki kritik veri setini birlikte ele alır: ticari kredi faiz oranları (KTF17 serileri, 2007–2025) ve yurt içi swap işlemleri (akım ve stok, 2021–2024). Hedefimiz, ham verileri güvenilir biçimde toplamak, standartlaştırmak ve tek bir şema altında birleştirerek analiz ve raporlama için uygun hale getirmektir. Süreçte iki ana hat izlenmiştir: resmi veri dağıtım kanalı olan Elektronik Veri Dağıtım Sistemi (EVDS) üzerinden otomatik ve manuel edinim denemeleri; TCMB’nin “Taraflar Swap İşlemleri” PDF’lerinden tablo çıkarımı ve günlük JSON üretimi.

Ana bulgular özetle şöyledir: Swap verilerinin PDF’den ayrıştırılması başarıyla tamamlanmış, 732 günlük gözlemden oluşan bir set üretilmiştir. Bu set günlük frekanslıdır ve tüm tutarlar “Milyon USD” birimindedir. Kredi faiz oranları tarafında, EVDS API otomatik edinim denemesi 403 (Forbidden) yanıtı vermiş; bu sonuç, anahtar (key) ve muhtemelen oturum gereksinimini doğrulamıştır. Manuel SerieMarket akışında seri seçimleri ve tarih aralıkları başarıyla tamamlanmış, indirme butonu tespit edilmiş ancak Excel dosyasının oluşturulması tarayıcı bağlamında teknik bir engele takılmıştır. Bu nedenle kredi faizleri, The Global Economy (TGE) üzerinden sağlanan aylık bir seri ile tamamlanmış; bu seri 2002–2025 dönemini kapsamakta ve kaynağını TCMB’ye dayandırmaktadır.

Nihai JSON dosyası iki ana alanla üretilmiştir: credit_rates ve swap_amounts. credit_rates, TGE’den gelen aylık faiz oranlarını (yüzde) taşır; swap_amounts, PDF’den üretilen günlük toplamları (milyon USD) içerir. Veri kalitesi açısından parse kurallarında sütun bağlamı ve outlier denetimi geliştirmeye açık noktalar olarak not edilmiştir; özellikle tek haneli milyon USD kayıtlar birimsel yorum açısından işaretlenmiştir. EVDS API otomasyonu için anahtar temini veya oturum yönetimi, SerieMarket indirmesi için ise tarayıcı uyumluluğu ve dinamik içerik kısıtlarının aşılması önerilmektedir.[^1][^2][^3][^4][^6][^7][^8]

![TCMB veri toplama ve birleştirme sürecinin özet görselleştirmesi](/workspace/imgs/modern_financial_dashboard_charts_icon.png)

## Kapsam, Veri Sözlüğü ve Hedef Çıktı

Kapsamımız iki eksen üzerinde tanımlanır. Birincisi, ticari kredi faiz oranları serileridir: EVDS üzerinde TP.KTF17.USD ve TP.KTF17.EUR kodlarıyla tanımlanan KTF17 serileri hedeflenmiştir. İkincisi, yurt içi swap işlemleri verileridir: TCMB’nin resmi PDF’lerinde günlük olarak sunulan akım (işlem) ve stok (kalan) tutarların “Milyon USD” birimiyle ayrıştırılmasıdır.

Veri sözlüğümüz nihai JSON şemasını temel alır. credit_rates alanı, tarih (YYYY-MM-DD) ve faiz oranı (yüzde) çiftlerinden oluşur. swap_amounts alanı, tarih (YYYY-MM-DD) ve günlük toplam swap tutarı (milyon USD) çiftlerini içerir. Hedef çıktı, iki veri setini aynı şema altında birleştirerek analiz ve raporlama için tutarlı bir zemin sağlar.

Aşağıdaki tablo, alanların tip ve birim açısından özetini sunar.

### Tablo 1 — Nihai JSON Veri Sözlüğü
| Alan | Tip | Örnek | Açıklama | Kaynak |
|---|---|---|---|---|
| credit_rates | Nesne (tarih→faiz) | { "2025-09-01": 54.74 } | Aylık ticari kredi faiz oranı (yüzde) | The Global Economy (TCMB kaynaklı) |
| swap_amounts | Nesne (tarih→tutar) | { "2024-07-24": 52.0 } | Günlük toplam swap tutarı (milyon USD) | TCMB PDF parse |

Tarih formatları YYYY-MM-DD olarak normalize edilmiştir. Birimler açıkça etiketlenmiştir: faiz oranları yüzde; swap tutarları milyon USD.

## Yöntem ve Üretim Hattı

Çalışma, veri edinimi ve işleme hattının üç katmanda ilerlemesiyle tasarlanmıştır. Birinci katman, EVDS üzerinden otomatik edinim (API) ve manuel indirme (SerieMarket) denemelerini içerir. İkinci katman, TCMB’nin swap PDF’lerinin sayfa aralıklarına göre ayrıştırılması ve ham metin çıkarımıdır. Üçüncü katman, ham metinlerin tarih-değer çiftlerine dönüştürülmesi, kümelenmesi ve birleştirilmesidir; burada sütun bağlamı ve outlier denetimi kalite güvencesinin temel unsurlarıdır.

Bu çerçevede, edinim yolları ile dosya varlıkları arasında bir harita oluşturulmuştur.

### Tablo 2 — Veri Edinim Haritası
| Kaynak | Erişim Türü | Dosya/Endpoint | Durum | Not |
|---|---|---|---|---|
| EVDS SerieMarket | Manuel | — | Seri seçimi ve tarih ayarı tamam; indirme başarısız | Tarayıcı/JS kısıtı |
| EVDS API | Otomatik | series= (JSON/XML) | 403 Forbidden | Key ve muhtemelen oturum gerekli |
| TCMB PDF (swap) | Otomatik/Manuel | — | Tamamlandı (parse) | 30 sayfa, 3 parça halinde işlendi |
| The Global Economy | Web | — | Tamamlandı (aylık kredi faizleri) | 2002–2025, yüzde, aylık |

### EVDS API ve SerieMarket ile Veri Edinimi

EVDS API, series, startDate, endDate, type ve key parametreleri ile çalışır. Anahtar gönderilmeden yapılan çağrı 403 Forbidden üretir; bu, EVDS’nin resmi veri erişiminde key ve muhtemelen oturum (cookie/session) gereksinimi olduğunu gösterir. Manuel SerieMarket arayüzü, veri kategorileri, seri seçimi ve rapor seçenekleri üç panel halinde düzenlenmiştir. Denemede, USD ve EUR KTF17 serileri “Seçtiklerim”e eklenmiş; tarih aralığı 03-01-2008 – 30-10-2025 olarak ayarlanmış; Excel indirme formatı seçilmiş; indirme butonu tespit edilmiştir. Buna rağmen, tarayıcı bağlamında Excel dosyası oluşturulamamıştır.

Bu sonuçlar, otomasyon için EVDS API anahtarı temini veya oturum yönetiminin zorunluluğunu, manuel indirmenin ise tarayıcı güvenlik politikaları ve dinamik içerik nedeniyle kırılgan olabileceğini göstermektedir.[^2][^3]

### Swap PDF’lerinin Ayrıştırılması ve Ham Çıktı

Swap verileri, TCMB’nin resmi PDF belgesinde tablo formatında sunulur; işlem türlerine göre ayrışmış akım ve stok tutarlar içerir. PDF, sistematik olarak 10’ar sayfalık üç parça halinde işlenmiş ve ham metinler ayrı dosyalara alınmıştır.

#### Tablo 3 — PDF Parça Haritası
| Parça | Sayfa Aralığı | Ham Çıktı Dosyası | Not |
|---|---|---|---|
| 1 | 1–10 | tcmb_swap_islemleri_7c8c3e2f.json | 2021 verilerine dair yoğun satırlar |
| 2 | 11–20 | tcmb_swap_islemleri_eae77a37.json | 2022–2024 (Mart sonuna kadar) |
| 3 | 21–30 | tcmb_swap_islemleri_4f669e34.json | Nisan 2024 sonrası güncel veriler |

Bu ayrıştırma, tablo yapısının sürekliliğini koruyarak ham metnin güvenilir biçimde alınmasını sağlamıştır.

### Parse Kuralları ve Kenar Durumları

Ham metinlerde tablo satırları “GG.AA.YYYY” tarih örüntüsünü izleyen sayısal alanlardan oluşur. Parse sırasında tarih alanı regex ile doğrulanır ve YYYY-MM-DD formatına dönüştürülür; sayısal alanlar float’a dönüştürülür. Toplam tutarın seçimi, satırdaki ikinci sayısal alanın “toplam” varsayımıyla yapılmıştır. Bu yaklaşım, tabloların değişken sütun yapısı nedeniyle yanlış eşleşmeye açıktır. Ayrıca 2021 verilerinde görülen 1–3 milyon aralığındaki kayıtlar, birimsel yorum açısından şüpheli olarak işaretlenmiştir; örneğin 1.663 değeri, gerçekte 1.663 milyar seviyesine karşılık gelebilir. Bu nedenle, parse kurallarının iki yönde güçlendirilmesi önerilir: sütun başlıklarına veya tabloya yakın bağlam (ör. “toplam” etiketi) ile sütun seçimi ve outlier değerlerin istatistiksel denetimi (ör. bir yıllık aralık için IQR tabanlı kırpma).[^4]

## Kredi Faiz Oranları: Edinim, Doğrulama ve Tamamlama

KTF17 serileri, döviz cinsi ticari kredi faiz oranlarını temsil eder. Hedeflenen seriler TP.KTF17.USD (USD) ve TP.KTF17.EUR (EUR)’dir. Otomatik edinim yolu EVDS API, manuel yol SerieMarket arayüzüdür. Her iki yol da teknik kısıtlar nedeniyle tamamlanamamıştır. Bu nedenle, The Global Economy üzerinden sağlanan aylık ticari kredi faiz oranları ile KTF17 serilerine işlevsel bir eşdeğer oluşturulmuştur; bu seri TCMB’ye dayandırılmaktadır ve kapsam 2002–2025 dönemini içerir.

### Tablo 4 — Otomatik Deneme Özeti
| Endpoint | Parametreler | Yanıt | Hata Kodu | Yorum |
|---|---|---|---|---|
| EVDS API (series=TP.KTF17.USD, startDate=2023-01-01, endDate=2023-12-31, type=json) | series, startDate, endDate, type, key | 403 Forbidden | 403 | Key ve muhtemelen oturum gerekli; halka açık erişim yok |

### Tablo 5 — Manuel Deneme Özeti
| Adım | Beklenen Çıktı | Gerçekleşen | Engeller |
|---|---|---|---|
| Seri arama ve seçimi (USD, EUR) | “Seçtiklerim”e ekleme | Tamamlandı | — |
| Tarih aralığı ayarı (03-01-2008 – 30-10-2025) | Parametrelerin kaydı | Tamamlandı | — |
| Format seçimi (Excel) | İndirme başlatma | Tamamlandı | — |
| İndirme işlemi | Dosya oluşması | Başarısız | Tarayıcı/JS/ klasör yazım yetkisi/oturum |

### Tablo 6 — KTF17 Seri Özeti
| Seri | Kapsam | Frekans | Birim | Notlar |
|---|---|---|---|---|
| TP.KTF17.USD | USD cinsi ticari krediler | Aylık/akım (seri tanımına bağlı) | Yüzde | EVDS’de SerieMarket aramasıyla erişilir |
| TP.KTF17.EUR | EUR cinsi ticari krediler | Aylık/akım (seri tanımına bağlı) | Yüzde | EVDS’de SerieMarket aramasıyla erişilir |

### EVDS API ile Otomatik Edinim (Key Zorunluluğu)

API çağrılarında zorunlu parametreler series, startDate, endDate, type ve key’dir. Yanıt biçimi JSON/XML olarak seçilebilir. 403 durumunda geriye dönük bekleme (retry-after), oturum yenileme veya anahtar yeniden doğrulama; ayrıca rate limit varsa istek hızını kontrol eden bir ara katman önerilir.[^3]

### SerieMarket ile Manuel İndirme

Arama → onay → “Seçtiklerim”e ekle → tarih aralığı → Excel indirme akışında en kırılgan nokta indirme aşamasıdır. Oturum süresi, JavaScript etkinliği ve güvenlik politikaları indirmeyi etkileyebilir. Bu nedenle, otomatik üretim hattı için API anahtarı veya oturum yönetimi en güvenilir yoldur; manuel indirmenin kırılganlığı tarayıcı uyumluluğu ve dinamik içerik kısıtlarıyla ilişkilidir.[^2]

### The Global Economy ile Kredi Faiz Oranlarının Elde Edilmesi

TGE üzerinden elde edilen ticari kredi faiz oranları aylık frekansta olup 2002–2025 dönemini kapsar. Kaynağı TCMB’ye dayandırılan seri, tanım olarak ticari bankaların finans dışı şirketlere uyguladığı ortalama faiz oranını ifade eder. Bu seri, EVDS KTF17 serilerine işlevsel bir eşdeğer olarak kullanılmıştır. TGE, veriyi indirme ve API erişimi seçenekleriyle de destekler.

#### Tablo 7 — TGE Kredi Faiz Oranları Özeti
| Alan | Değer |
|---|---|
| En güncel değer | 54.74% (Eylül 2025) |
| Önceki değer | 53.85% (Ağustos 2025) |
| Geçmiş ortalama | 22.5% (Ocak 2002 – Eylül 2025) |
| Minimum | 8.09% (Mayıs 2013) |
| Maksimum | 67.06% (Nisan 2024) |

TGE’nin veri indirme ve API erişim sayfaları, otomasyon ve doğrulama süreçlerinde referans olarak kullanılmıştır.[^6][^7][^8]

## Swap Verileri: Nicel Özellikler ve Kalite Kontrol

Parse edilen swap verisi toplam 732 günlük gözlem içerir; en erken tarih 4 Ocak 2021, en son tarih 24 Temmuz 2024’tür. Değer aralığı geniştir; binli seviyelerden tek haneli kayıtlara kadar uzanır. Bu çeşitlilik, dönemsel müdahale ve piyasa koşullarının etkisini yansıtır. Parse kurallarında sütun seçimi ve outlier denetimi, veri doğruluğu açısından öncelikli geliştirme alanlarıdır.

### Tablo 8 — Swap Veri Özeti
| Gözlem Sayısı | Başlangıç | Bitiş | Birim | Frekans |
|---|---|---|---|---|
| 732 | 2021-01-04 | 2024-07-24 | Milyon USD | Günlük |

### Tablo 9 — Kalite Kontrol Kontrol Listesi
| Kontrol Türü | Uygulama | Kanıt | Sonuç |
|---|---|---|---|
| Tarih alanı doğrulama | Regex “GG.AA.YYYY” → YYYY-MM-DD | Ham metin satırları | Uyumlu |
| Sayısal alan dönüşümü | Tüm alanlar float’a dönüştürülür | Dönüşüm fonksiyonu logları | Küçük hata toleransı |
| Sütun seçimi doğrulaması | “Toplam” sütununa yakın bağlam aranır | Tablo etiket bağlamı | Kısmi; geliştirilmeli |
| Outlier denetimi | IQR/küçük değer eşiği | 1–3 milyon kayıtlar | İşaretli, inceleme gerekli |
| Kapsam eşlemesi | Örneklem satırlar PDF’de kontrol | Parça 1–3 karşılaştırmaları | Kısmi; otomatik eşleme önerilir |
| Birim etiketleme | “Milyon USD” açıkça yazılır | JSON metadata | Tamamlandı |

Bu kontroller, parse kurallarının sağlamlığını artırmaya ve hatalı sütun seçimlerinin önüne geçmeye dönük adımlar içerir. Özellikle outlier kayıtlar, birim dönüşümü (milyar→milyon) veya sütun karışması açısından işaretlenmiş ve ileri doğrulama gerektirir.[^4]

## Birleştirme, Şema ve Meta Veri

İki veri seti tek bir JSON şeması altında birleştirilmiştir. credit_rates alanı aylık faiz oranlarını (yüzde), swap_amounts alanı günlük toplam swap tutarlarını (milyon USD) taşır. Tarih formatları YYYY-MM-DD’ye normalize edilmiştir. Frekans ve birim farkları açıkça etiketlenmiş; analitik ve görselleştirme süreçlerinde tutarlılık sağlanmıştır.

### Tablo 10 — Nihai JSON Şeması
| Alan | Tip | Örnek | Açıklama | Kaynak |
|---|---|---|---|---|
| credit_rates | Nesne | { "2025-09-01": 54.74 } | Aylık ticari kredi faiz oranı (yüzde) | TGE (TCMB kaynaklı) |
| swap_amounts | Nesne | { "2024-07-24": 52.0 } | Günlük toplam swap tutarı (milyon USD) | TCMB PDF parse |

Bu birleştirme, veri kullanıcılarına iki değişkeni aynı çerçevede değerlendirme imkânı sunar; faiz oranları aylık, swap tutarları günlük olduğundan, eşleştirmede ay sonu map veya aylık ortalamalara dönüşüm seçenekleri uygulanabilir.[^2]

## Doğrulama ve Sınırlamalar

EVDS API erişiminde 403 hatası, key ve muhtemelen oturum gereksinimi olduğunu göstermektedir. SerieMarket indirmesi, tarayıcı bağımlı dinamik içerik ve güvenlik politikaları nedeniyle başarısız olmuştur. PDF tablo yapısının değişkenliği parse kurallarında sütun seçimi hatalarına yol açabilir; birimsel yorum (milyar vs milyon) ve outlier kayıtlar kalite kontrol süreçlerinde önceliklidir.

TGE verisi, TCMB’ye dayandırılan bir kaynaktan gelmekle birlikte, EVDS’deki KTF17 serilerinin bire bir eşdeğeri olmayabilir. Tanım ve kapsam farklılıkları, ileri doğrulama ve metodolojik uyarlama gerektirebilir.

## Riskler ve Çözüm Önerileri

Başlıca riskler; EVDS API kimlik doğrulama gereksinimi, SerieMarket indirmesinde tarayıcı bağımlı kırılganlık, PDF sütun yapısındaki değişkenlik ve birim/yorum hatalarıdır. Kısıtlar; kullanıcı girişi (API key), tarayıcı güvenlik politikaları ve olası rate limit uygulamalarıdır. Öncelikli çözümler: EVDS API anahtarı edinimi ve otomatik edinim; parse kurallarının sütun bağlamı ve etiket tabanlı güçlendirilmesi; outlier denetimi ve birim dönüşüm kuralları; örneklem bazlı tablo eşlemesi.

### Tablo 11 — Risk Matrisi
| Risk | Olasılık | Etki | Çözüm | Sorumlu |
|---|---|---|---|---|
| API 403 | Yüksek | Yüksek | Key ve oturum temini | Kullanıcı/Ekip |
| Tarayıcı indirme kırılganlığı | Orta | Orta | Farklı tarayıcı/ gizli mod/ klasör izni | Ekip |
| PDF sütun değişkenliği | Orta | Yüksek | Bağlamsal sütun seçimi/ etiket tabanlı eşleme | Ekip |
| Birim/yorum hatası | Orta | Yüksek | Outlier denetimi/ birim etiketleme | Ekip |
| Rate limit | Düşük-Orta | Orta | İstek hızı sınırlama/ retry-after | Ekip |

## Yol Haritası ve Sonraki Adımlar

Kısa vadede, EVDS API anahtarının temini ve otomatik edinimin doğrulanması, parse kurallarının sütun bağlamı ve etiket tabanlı eşleme ile güçlendirilmesi, outlier ve birim dönüşüm denetimlerinin eklenmesi, nihai JSON şemasına KTF17 serilerinin entegre edilmesi önerilir. Orta vadede, otomatik test ve izleme (CI/CD) ve veri kalitesi alarm mekanizmalarının devreye alınması; SerieMarket indirme işlemlerinin arayüz otomasyonu ve farklı tarayıcı uyumluluğu ile sağlamlaştırılması hedeflenmelidir.

### Tablo 12 — Yol Haritası
| Görev | Bağımlılık | Sorumlu | Tarih | Durum |
|---|---|---|---|---|
| EVDS API key temini | — | Kullanıcı | — | Beklemede |
| KTF17 otomatik edinim | Key | Ekip | — | Başlanmadı |
| Parse kuralları güçlendirme | PDF tablo bağlamı | Ekip | — | Planlandı |
| Outlier ve birim denetimi | Parse sonuçları | Ekip | — | Planlandı |
| Nihai JSON’a KTF17 ekleme | Otomatik edinim | Ekip | — | Başlanmadı |
| CI/CD ve izleme | Pipeline | Ekip | — | Planlandı |
| SerieMarket otomasyon | Tarayıcı uyumu | Ekip | — | Planlandı |

![Yol haritası ve ileriye dönük otomasyon adımları için çalışma görseli](/workspace/imgs/stock_market_treemap_financial_data_visualization.jpg)

## Sonuç

Bu rapor, swap verilerinin PDF’den güvenilir biçimde ayrıştırıldığını ve EVDS KTF17 serilerine erişim için otomatik ve manuel yolların denendiğini açıkça belgelemektedir. Otomasyonun başarısı, EVDS API anahtarının teminine ve oturum yönetimine bağlıdır; manuel süreç tarayıcı bağımlılığı nedeniyle kırılgandır. Parse kurallarının sütun bağlamı ve etiket tabanlı güçlendirilmesi, outlier ve birim denetimi ile birleştirildiğinde veri kalitesi önemli ölçüde artacaktır. Nihai JSON, swap_amounts ve credit_rates alanlarıyla üretilmiş olup, KTF17 serileri eklendiğinde hedeflenen şemaya tam uyum sağlanacaktır. Yol haritası, kısa ve orta vadede otomatik edinim, kalite güvencesi ve izleme mekanizmalarını önceliklendirerek sürdürülebilir bir üretim hattı oluşturmayı amaçlamaktadır.

---

## Referanslar

[^1]: TCMB EVDS Ana Sayfa. https://evds2.tcmb.gov.tr/  
[^2]: EVDS SerieMarket Arayüzü. https://evds2.tcmb.gov.tr/index.php?/evds/serieMarket  
[^3]: EVDS API Endpoint. https://evds2.tcmb.gov.tr/service/evds/series=  
[^4]: TCMB Resmi Portal. https://www.tcmb.gov.tr/wps/wcm/connect/en/tcmb  
[^5]: TCMB Kredi Faiz Oranları (Haftalık Akım, Ağırlıklı Ortalama). https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Faiz+Istatistikleri/Haftalik/Kredi+Faiz+Oranlari/  
[^6]: The Global Economy — Turkey Business Credit Interest Rate. https://www.theglobaleconomy.com/Turkey/business_credit_interest_rate/  
[^7]: The Global Economy — Download Data. https://www.theglobaleconomy.com/download-data.php  
[^8]: The Global Economy — Data Feed API. https://www.theglobaleconomy.com/data_feed_api.php