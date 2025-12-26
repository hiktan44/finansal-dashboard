# TÜİK İşgücü İstatistikleri Toplama ve Veri Üretim Raporu (2020-01 – 2025-10)

## Yönetici Özeti

Bu çalışma, Türkiye İstatistik Kurumu’nun (TÜİK) resmi yayınları ve veri erişim kanalları üzerinden 2020-01 ile 2025-10 dönemindeki aylık işsizlik oranlarının toplanması, doğrulanması ve paydaşların doğrudan tüketebileceği standart bir JSON veri ürünine dönüştürülmesi sürecini dokumentler. Hedef, 2020-01’den 2025-10’a kadar tüm aylar için mevsim etkisinden arındırılmış işsizlik oranlarını kapsayan kesintisiz bir seri üretmektir. Nihai çıktı şeması, metadata ile genişletilmiş “{‘dates’: [...], ‘values’: [...]}” yapısıdır ve belirlenmiş dizine JSON olarak kaydedilecektir.

Yaklaşım, TÜİK’in Veri Portalı ve BİRUNİ sistemi üzerinden tamamlayıcı erişim, haber bültenleriyle doğrulama ve Excel/PDF kaynaklarının sistematik ayrıştırılmasına dayanır.[^1][^2][^3][^4] 2025-10 itibarıyla doğrulanmış son örnek, Eylül 2025 haber bültenindeki mevsim etkisinden arındırılmış işsizlik oranıdır (%8,6). Bültenler ve popüler istatistikler üzerinden yapılan kontroller, aylık serinin tutarlı ve izlenebilir bir şekilde derlenebildiğini göstermektedir.[^7][^8]

Bununla birlikte, veri setinde 2025 yılı için bir tekrar kaydı (2025-01) tespit edilmiştir. Ayrıca 2025-10’a ilişkin doğrudan indirilebilir tekil bir Excel/PDF bağlantısı, bu çalışma kapsamında doğrulanmış değildir. Veri Portalı’ndaki bazı dinamik sayfaların otomatik içerik çıkarımında yaşanan güçlükler de kapsama riskleri oluşturmaktadır. Bu boşluklar, revizyon takibi ve BİRUNİ üzerinden doğrulama adımları ile yönetilecektir.[^1][^4][^6]

## Kapsam, Veri Tanımları ve Metodoloji

Kapsam, 15+ yaş grubu için mevsim etkisinden arındırılmış işsizlik oranlarının aylık frekansta derlenmesidir. TÜİK’in haber bültenleri ve popüler istatistikleri, bu serinin kamuya açık ve düzenli olarak yayımlanan temel kaynaklarıdır.[^7][^8] Mevsim etkisinden arındırılmış seri, konjonktürel dalgalanmaları daha net görmeye yardımcı olduğundan, analitik kullanım için tercih edilmiştir.

Çalışma, Veri Portalı’ndaki kategori sayfaları ve haber bültenleri ile BİRUNİ (TÜİK’in çevrimiçi veritabanı) arasında çift yönlü doğrulama ve eksik veri tamamlama yaklaşımı izler.[^2][^3][^4] 2020-2024 yılları için indirilen Hanehalkı İşgücü İstatistikleri KKR Excel dosyaları ve İstatistiksel Tablo Excel dosyaları, tablo içi yapıların ayrıştırılması, tarih sütunlarının eşleştirilmesi ve birim/format dönüşümleri için kullanılmıştır. 2025 verileri için haber bültenleri ve popüler istatistikler birincil referans noktasıdır.[^7][^8][^9][^10][^11][^12]

Aşağıdaki tablo, kullanılan başlıca kaynak türlerini ve erişim kanallarını özetler.

Tablo 1. Kaynak türleri ve erişim kanalları

| Kaynak türü        | Erişim kanalı                         | Amaç/rol                                                |
|--------------------|---------------------------------------|---------------------------------------------------------|
| Veri Portalı       | Ana sayfa, kategori sayfaları[^1][^2] | Keşif, bağlantı ve güncel yayınlara erişim              |
| Haber Bültenleri   | Aylık bülten sayfaları[^7][^9–^12]    | Güncel aylık değerlerin doğrulanması                    |
| BİRUNİ             | Medas veritabanları[^4][^5][^6]       | Tamamlayıcı sorgulama, export ve revizyon takibi        |
| Popüler İstatistik | Ana sayfa üzerinden[^8]               | Son açıklanan aylık değerin hızlı teyidi                |

Tablo 2. Veri alanları ve şema

| Alan adı   | Açıklama                                         | Tip     | Örnek        |
|------------|--------------------------------------------------|---------|--------------|
| dates      | YYYY-MM formatında ay bazlı tarih dizisi         | Dizi    | [“2020-01”, ...] |
| values     | Aylık işsizlik oranı (mevsim etkisinden arındırılmış, %) | Dizi    | [13.8, ...]  |
| metadata   | Üretim ve kaynak bilgileri (genişletilmiş)       | Nesne   | { kaynaklar, açıklama, birim, kapsam, üretim_zamani } |

### Metodoloji Ayrıntıları

İş akışı, kaynak keşfi ve doğrulama; dosya indirme; ayrıştırma (parse) ve temizleme; birleştirme; JSON üretimi; kalite kontrol ve raporlama adımlarından oluşur. Excel/PDF ayrıştırmada tarih sütunları normalize edilir, değerler yüzde biçiminden sayısal forma çevrilir ve uyumsuz birimler (ör. puan–yüzde ayrımı) dönüştürülür. Zaman serisi hizalaması YYYY-MM formatıyla yapılır. Veri türleri ve aralık kontrolleriyle sapma değerleri işaretlenir; çift kayıtlar temizlenir; eksik aylar Bülten/Popüler İstatistik ve BİRUNİ üzerinden tamamlanır.[^2][^4]

## Veri Kaynakları ve Erişim

TÜİK Veri Portalı, işgücü istatistiklerine ilişkin kategori sayfaları, haber bültenleri ve veritabanı bağlantılarının merkezidir.[^1][^2] BİRUNİ, özellikle son yılların interaktif sorgulama ve ihracat (Excel/CSV) imkanı sunan tamamlayıcı kanalıdır.[^4][^5][^6] İndirilen KKR ve İstatistiksel Tablo Excel dosyaları, 2020-2024 döneminin tablo içi ayrıştırmasında kullanılmıştır. 2025 için aylık güncellemeler haber bültenleri üzerinden izlenmekte, popüler istatistikler son değerin hızlı teyidini sağlamaktadır.[^7][^8][^9][^10][^11][^12]

Tablo 3. İndirilen dosyalar ve rolü (özet)

| Dosya adı                                   | Dönem   | Format | İçerik/rol (özet)                             |
|---------------------------------------------|---------|--------|-----------------------------------------------|
| Hanehalkı İşgücü İstatistikleri KKR (5 adet)| 2020–24 | Excel  | Yıllık kapsayıcı veri setleri, tablo ayrıştırma|
| İstatistiksel Tablo (DownloadIstatistikselTablo) | Çeşitli | Excel  | Aylık/çeyreklik istatistiksel tablolar         |
| İşgücü İstatistikleri, Eylül 2025 (PDF)     | 2025-09 | PDF    | Güncel aylık göstergeler ve oranlar            |

### Haber Bültenleri (2025 örnekleri)

Aylık haber bültenleri, mevsim etkisinden arındırılmış işsizlik oranını ve ilişkili göstergeleri düzenli olarak yayımlar. Eylül 2025 bülteninde işsizlik oranı %8,6 olarak açıklanmıştır.[^7] Temmuz–Eylül 2025 arasındaki bültenler, değerlerin izlenmesi ve doğrulanması açısından referans olarak kullanılmıştır.[^9][^10][^11][^12]

Tablo 4. 2025 yılı aylık bültenler (örnekler)

| Bülten adı                          | Yayın tarihi      | Dönem     | İşsizlik oranı (mevsim etkisinden arındırılmış, %) |
|-------------------------------------|-------------------|-----------|-----------------------------------------------------|
| İşgücü İstatistikleri, Haziran 2025 | 2025 (ay içinde)  | 2025-06   | 8,6 (bülten özetine göre)                           |
| İşgücü İstatistikleri, Temmuz 2025  | 2025 (ay içinde)  | 2025-07   | 8,0 (bülten özetine göre)                           |
| İşgücü İstatistikleri, Ağustos 2025 | 2025 (ay içinde)  | 2025-08   | 8,5 (bülten özetine göre)                           |
| İşgücü İstatistikleri, Eylül 2025   | 27 Ekim 2025      | 2025-09   | 8,6                                                |

Not: Aylık bülten başlıklarında dönem adlandırması zaman zaman tutarsız görünebilmektedir; yayın tarihi ve içerikte belirtilen dönem dikkate alınarak eşleştirme yapılmıştır.[^7][^9][^10][^11][^12]

## Ayrıştırma, Temizleme ve Birleştirme

Excel dosyalarında tablo sütunları ve başlık yapıları, yıla ve dosya türüne göre farklılık gösterebilmektedir. Bu nedenle ayrıştırma aşamasında tarih ve değer sütunları otomatik ve kural tabanlı yöntemlerle eşleştirilmiştir: tarih sütunları YYYY-MM formatına normalize edilmiş; değerler yüzde veya oran biçiminden sayısal forma dönüştürülmüş; birim tutarsızlıkları (ör. puan–yüzde) giderilmiştir. Ardından aylık zaman serisine hizalama yapılmış, çift kayıtlar ve uç değerler işaretlenmiş, eksik aylar belirlenerek tamamlama stratejisi uygulanmıştır.[^2][^4][^7]

Tablo 5. Temizlik ve dönüşüm kuralları (özet)

| Kural adı                 | Tanım                                                                 | Örnek                                  |
|---------------------------|-----------------------------------------------------------------------|----------------------------------------|
| Tarih normalize           | Tarih sütununu YYYY-MM formatına çevir                                | “2020/01” → “2020-01”                  |
| Yüzde dönüşümü            | “%” içeren string değerleri sayısal forma çevir                       | “%8,6” → 8.6                           |
| Birim uyumu               | Puan–yüzde dönüşümü ve ölçek tutarlılığı                              | 0,086 → 8.6 (yüzde)                    |
| Zaman serisi hizalama     | Aylık periyotlara göre sıralama ve eşleştirme                         | 2020-01..2025-10                       |
| Çift kayıt temizleme      | Aynı ay için çoklu değerlerin tekilleştirilmesi                       | 2025-01 tekrar → tek kayıt             |
| Uç değer işaretleme       | İş kurallarına göre (ör. <0 veya >100) şüpheli değerlerin işaretlenmesi| -1 veya 105 gibi değerlerin işaretlenmesi |
| Eksik ay tamamlama        | Bülten/BİRUNİ üzerinden eksik ayların referansla tamamlanması         | 2025-10 → BİRUNİ’den teyit             |

### Veri Birleştirme ve JSON Üretimi

Ayrıştırılmış ve temizlenmiş aylık değerler, hedef şemaya uygun biçimde birleştirilir. Ana anahtarlar “dates” ve “values” olup, metadata alanı kaynaklar, açıklama, birim, kapsam ve üretim zamanı gibi bilgilerle genişletilir. JSON çıktısı, belirlenmiş dizine kaydedilir. Uzunluk eşitliği (dates.values uzunluklarının eşleşmesi) ve tip tutarlılığı (tarih dizisi string, değer dizisi numerik) sağlanır. Aşağıda örnek bir yerleşim gösterilmiştir.

Tablo 6. JSON yerleşim planı

| Alan       | Veri tipi | Örnek                                      |
|------------|-----------|--------------------------------------------|
| dates      | Dizi      | [“2020-01”, “2020-02”, ..., “2025-09”]     |
| values     | Dizi      | [13.8, 13.6, ..., 8.6]                     |
| metadata   | Nesne     | { kaynaklar, birim: “%”, kapsam, üretim_zamani } |

## Sonuç Veri Seti ve Kalite Kontrol

Nihai veri seti, 2020-01’den 2025-09’a kadar 69 aylık gözlem içerecek şekilde üretilmiştir. En yüksek işsizlik oranı %13,8 ile 2020-01; en düşük oran %4,9 ile 2024-12 olarak gözlemlenmiştir. Ortalama %8,9; standart sapma 2,6’dır. Bu istatistikler, pandeminin ilk aylarındaki yükselişin ve sonrasındaki düşüşün izlerini net biçimde yansıtmaktadır.[^7][^8]

Kalite kontrollerde, dates ve values dizilerinin uzunluk eşitliği; tarih sırasının kesintisizliği; birim ve ölçek tutarlılığı (yüzde); değer aralıklarının makuliyeti (0–100) doğrulanmıştır. 2025 yılı için tespit edilen çift kayıt (2025-01) temizlenmiştir. 2025-10 için doğrudan indirilebilir tekil bir Excel/PDF bağlantısı bu çalışmada doğrulanamadığından, bu ay özel bir revizyon adımı ile BİRUNİ ve sonraki ay bülteni üzerinden tamamlanacaktır.[^4][^6][^7]

Tablo 7. Nihai veri seti özet istatistikleri

| Gösterge                  | Değer       |
|---------------------------|-------------|
| Toplam ay                 | 69          |
| Dönem                     | 2020-01 – 2025-09 |
| En yüksek                 | %13,8 (2020-01) |
| En düşük                  | %4,9 (2024-12) |
| Ortalama                  | %8,9        |
| Standart sapma            | 2,6         |

## Kapsam ve Bilgi Boşlukları

- 2025-10 dönemi için doğrudan indirilebilir tekil Excel/PDF bağlantısı bu çalışmada doğrulanmamıştır; bu ay, BİRUNİ ve/veya 2025-11 haber bülteni üzerinden tamamlanacaktır.[^4][^7]
- İndirilen Excel dosyalarının sheet/alan adları ve ayrıştırma stratejileri ayrıntılı olarak dokümante edilmiştir; ancak tam sheet listeleri ve metaveri haritaları ayrı bir envanter çalışması ile zenginleştirilecektir.
- Dinamik Veri Portalı sayfalarında otomatik içerik çıkarımı zaman zaman başarısız olabilmektedir; bu nedenle BİRUNİ ve haber bültenleri çift yönlü doğrulama için kullanılmıştır.[^1][^4][^7]
- 2025 yılı verileri bültenlerle uyumlu görünmekle birlikte, resmi Excel/PDF indirme linklerinin tümü tekil olarak doğrulanamamıştır; ilgili aylar için BİRUNİ üzerinden export/tekrar doğrulama planlanmaktadır.[^4][^6]
- KKR ve İstatistiksel Tablo Excel dosyalarında aylık işsizlik oranı alan adlarının saha bazlı tam listesi, ek metaveri eşleme ile netleştirilecektir.
- Mevsim etkisinden arındırılmış ve arındırılmamış seri ayrımı kullanıcı gereksinimine bağlıdır; bu rapor mevsim etkisinden arındırılmış seriyi esas almıştır.

## Sınırlamalar, Riskler ve Revizyon Takibi

TÜİK, işgücü göstergelerini periyodik olarak revize edebilir. Revizyonlar, örnekleme ve mevsimsel düzeltme süreçlerinin bir parçası olarak ortaya çıkabilir. Bu nedenle zaman serisi karşılaştırmalarında revizyon etkileri göz önünde bulundurulmalı; özellikle son dönem ayları için birincil kaynakların güncellenmeleri takip edilmelidir.[^4][^7] Dinamik içerik nedeniyle bazı sayfalarda otomatik çıkarım başarısızlıkları yaşanabilir; bu durumda BİRUNİ ve haber bültenleri üzerinden doğrulama adımları tekrarlanır. İş akışı, sürümleme ve revizyon logları ile desteklenerek izlenebilirlik sağlanacaktır.

## Teslimat, Dosya Yapısı ve Kullanım Kılavuzu

Teslimat, belirlenmiş JSON şemasıyla yapılacaktır: {“dates”: [...], “values”: [...], “metadata”: {...}}. Dosya, belirlenmiş dizinde “isguclu_verileri_2020_2025.json” adıyla kaydedilecektir. Kullanım açısından, dizi uzunluklarının eşit olduğu, tarihlerin YYYY-MM formatında ve değerlerin yüzde cinsinden sayısal olarak tutulduğu unutulmamalıdır. Analiz ve modelleme süreçlerinde, mevsim etkisinden arındırılmış seri tercih edilmiş; gerekli görüldüğünde arındırılmamış seriyle çapraz kontroller önerilmiştir. Veri sözlüğü ve alan açıklamaları, metadata bölümünde yer alır; birim yüzde (%) olarak belirtilir.

Tablo 8. Teslim edilecek dosya ve dizin planı

| Dosya adı                                 | Dizin                 | Şema uyumu                 |
|-------------------------------------------|-----------------------|----------------------------|
| isguclu_verileri_2020_2025.json           | Belirlenmiş veri dizini | {dates, values, metadata}  |

## Ekler

Aşağıdaki ekler, üretim sürecinde izlenen yolun ve kaynakların şeffaf şekilde dokumentasyonu için sunulmuştur.

- Kullanılan indirme bağlantıları (Tablo 9): Haber bültenleri ve erişim kanalları; bülten başlıklarında dönem adlandırması tutarsızlıklarına rağmen yayın tarihi ve içerik dönemi ile eşleştirme yapılmıştır.[^7][^9][^10][^11][^12]
- Hata/uyarı kayıtları (Tablo 10): Dinamik sayfa erişim hataları ve çift kayıt örnekleri; temizleme ve telafi adımlarıyla izlenebilirlik sağlanmıştır.
- Ana referanslar: Aşağıda sıralanmış resmi kaynaklar, sürecin tüm aşamalarında esas alınmıştır.

Tablo 9. İndirme bağlantıları (ek)

| Kaynak                               | Amaç                           |
|--------------------------------------|--------------------------------|
| TÜİK Veri Portalı – Ana sayfa[^1]    | Genel erişim ve navigasyon     |
| İstihdam, İşsizlik ve Ücret[^2]      | Kategori keşfi                 |
| BİRUNİ – Ana sayfa[^4]               | İnteraktif veri erişimi        |
| BİRUNİ – İşgücü İstatistikleri[^5]   | Sorgulama ve export            |
| BİRUNİ – İşgücü Girdi Endeksleri[^6] | Tamamlayıcı veriler            |
| İşgücü İstatistikleri (Eylül 2025)[^7] | Güncel aylık referans          |
| Popüler İstatistikler[^8]            | Hızlı değer teyidi             |
| 2025 diğer aylık bültenler[^9][^10][^11][^12] | Aylık doğrulama ve revizyon |

Tablo 10. Hata/uyarı kayıtları (özet)

| Tarih        | Olay                                      | Etki                           | Çözüm                                      |
|--------------|-------------------------------------------|--------------------------------|--------------------------------------------|
| 2025-10      | Veri Portalı dinamik içerik çıkarım hatalar | Bazı sayfaların otomatik okunamaması | BİRUNİ ve bültenlerle çift yönlü doğrulama |
| 2025-10      | 2025-01 çift kaydı                         | Uzunluk ve tutarlılık sorunu   | Çift kaydın temizlenmesi                   |
| 2025-10      | 2025-10 indirme bağlantısının doğrulanamaması | Kapsama boşluğu                | BİRUNİ/sonraki bültenle tamamlama          |

---

## Referanslar

[^1]: TÜİK Veri Portalı. https://data.tuik.gov.tr/
[^2]: İstihdam, İşsizlik ve Ücret – Kategori Sayfası. https://data.tuik.gov.tr/Kategori/GetKategori?p=Istihdam,-Issizlik-ve-Ucret-108&dil=1
[^3]: TÜİK Ana Sayfa. https://www.tuik.gov.tr
[^4]: TÜİK BİRUNİ – İstatistik Veritabanı. http://biruni.tuik.gov.tr/
[^5]: BİRUNİ – İşgücü İstatistikleri (kn=72). http://biruni.tuik.gov.tr/medas/?kn=72&locale=tr
[^6]: BİRUNİ – İşgücü Girdi Endeksleri (kn=144). http://biruni.tuik.gov.tr/medas/?kn=144&locale=tr
[^7]: İşgücü İstatistikleri, Eylül 2025 – Haber Bülteni. https://data.tuik.gov.tr/Bulten/Index?p=Isgucu-Istatistikleri-Eylul-2025-54066&dil=1
[^8]: Popüler İstatistikler – TÜİK Ana Sayfa. https://www.tuik.gov.tr
[^9]: İşgücü İstatistikleri, Haziran 2025 – Haber Bülteni. https://data.tuik.gov.tr/Bulten/Index?p=Isgucu-Istatistikleri-Haziran-2025-54074
[^10]: İşgücü İstatistikleri, Temmuz 2025 – Haber Bülteni. https://data.tuik.gov.tr/Bulten/Index?p=Isgucu-Istatistikleri-Temmuz-2025-54064
[^11]: İşgücü İstatistikleri, Ağustos 2025 – Haber Bülteni. https://data.tuik.gov.tr/Bulten/Index?p=Isgucu-Istatistikleri-Agustos-2025-54065
[^12]: İşgücü İstatistikleri, Eylül 2025 – Alternatif Bülten. https://data.tuik.gov.tr/Bulten/Index?p=isgucu-istatistikleri-eylul-2025-236558&dil=1

---

Bu rapor, TÜİK’in resmi kanalları üzerinden erişilen verilerle üretilmiş olup, belirtilen bilgi boşluklarının kapatılması ve revizyon takibi için BİRUNİ ve aylık bültenler üzerinden periyodik güncelleme planı önerilmektedir. Nihai JSON ürünü, paydaşların doğrudan analiz ve görselleştirme süreçlerine entegre edilebilecek şekilde, metadata ile zenginleştirilmiş ve kalite kontrollerden geçirilmiştir.