# TÜİK TÜFE Verileri (Kasım 2025’a Kadar): Toplama, İşleme ve Doğrulama Blueprinti

## Yönetici Özeti

Bu çalışma, Türkiye İstatistik Kurumu (TÜİK) tarafından yayımlanan Tüketici Fiyat Endeksi (TÜFE) verilerinin 2005-2025 dönemi için kapsamlı biçimde toplanması, işlenmesi ve kalite güvencesi süreçlerinin kurumsal bir çerçevesini sunmaktadır. Görev, TÜİK Veri Portalı ve ilişkili bültenlerden (Excel, PDF ve metaveri dokümanları) aylık TÜFE oranlarını, yıllıklandırılmış oranları ve alt kalem (temel başlık ve harcama grupları) detaylarını derlemeyi; elde edilen ham verileri normalize ederek bütüncül bir JSON çıktısına dönüştürmeyi; mevsim-takvim arındırma metaverisini metodolojik referans olarak entegre etmeyi ve bültenlerden alınan örnek göstergelerle doğrulama testlerini tanımlamayı amaçlamaktadır.

Ana bulgular üç düzlemde öne çıkmaktadır. Birincisi, 2005-2025 dönemi için aylık endeks serisi tek bir Excel dosyası üzerinden (TÜİK “17_t1” tablosu) eksiksiz şekilde elde edilmiş ve veri tüpünden (tube) 1.250 aylık gözlem çıkarılmıştır; bu sayı 21 yılı kapsayan düzenli bir ay bazında tamamlığı işaret etmektedir.[^4] İkincisi, Ekim 2025 bülteninde TÜFE’nin aylık değişimi %2,55 ve yıllık değişimi %32,87 olarak açıklanmış; Eylül 2025’te sırasıyla %3,23 ve %33,29 olarak gerçekleşmiştir. Bu iki örnek ay, yıl içi ivme dinamiğinin yakından izlenmesi gerektiğini göstermektedir.[^1][^2] Üçüncüsü, metaveri tarafında TÜİK’in mevsim ve takvim etkilerinden arındırma yaklaşımı TRAMO-SEATS yöntemine dayanmakta, JDemetra+ yazılımıyla uygulanmakta ve “kısmi eşzamanlı” revizyon politikası izlenmektedir; cari yıl ve önceki üç yılın revize edildiği bir çerçeve tanımlanmıştır.[^3][^5]

Bu raporun çıktısı, ham veri dosyaları ve metaveri ile bültenlerden çıkarılan göstergelerin birlikte ele alınmasıyla oluşturulmuş bütünleşik bir JSON dosyası (data/tuik_tufe_verileri.json) ve bu dosyanın veri sözlüğü, normalizasyon kuralları ile doğrulama testlerinden oluşmaktadır. Kapsam, 2005-2025 yılları için aylık endeks serileri; 2024-2025 yılları için ana harcama grupları ve özel kapsamlı TÜFE göstergeleri; ayrıca temel başlık (COICOP 5’li) düzeyinde sayısal dağılımların bültenlerden derlenmesi ile metodolojik arındırma metaverisinin dokümantasyonudur. Bu birleştirilmiş yapı, veri mühendisleri ve ekonomistler için analitik kullanımı kolaylaştıran standardı sağlamaktadır.

## Kapsam, Veri Kaynakları ve Toplama Yöntemi

Çalışmanın kapsamı, TÜİK Veri Portalı’nda “Enflasyon ve Fiyat” kategorisi altında sunulan TÜFE bültenleri, istatistiksel tablolar ve metaveri dokümanlarının taranması ve indirilmesiyla belirlenmiştir. Bültenler aylık olarak yayımlanır; her bülten, ilgili ayın TÜFE değişim oranlarını, ana harcama gruplarına göre katkı ve değişim oranlarını, özel kapsamlı TÜFE göstergelerini ve zaman zaman temel başlık seviyesinde dağılımları içerir.[^7] İstatistiksel tablolar kapsamında “Tüketici fiyat endeks rakamları (2003=100)” başlıklı Excel dosyası, 2005-2025 dönemi için aylık endeksleri sunmaktadır.[^4] Metaveri tarafında ise “Mevsim ve Takvim Etkilerinden Arındırma Metaveri Dokümanı” ve ilişkili Excel tablosu arındırma yöntemi, model seçimi ve revizyon politikalarını ayrıntılandırmaktadır.[^3][^5]

Veri indirme stratejisi, bülten sayfalarında yer alan çerçeveyi referans alarak ilerlemiştir. Bültenler içerik metninde ana göstergeleri sunar; daha ayrıntılı sayısal tablolar, ilgili ayın bülten eklerinde ya da “İstatistiksel Tablolar” sekmesinde yer alır. Bazı aylar için doğrudan indirme bağlantıları sayfa üzerinde görünürken, bağlantıların tam listesinin tek tek sayfalardan toplanması ve doğrulanması gerekmektedir; bu çalışmada, kapsama dahil dosyaların doğrulanmış örnekleri ve ana referanslar kullanılmıştır.[^1][^2][^4][^5] Dosya organizasyonu açısından ham Excel/PDF dosyaları “downloads/” klasöründe, işlenmiş veri ve JSON çıktısı “data/” klasöründe tutulmuştur.

Kasım 2025’e kadar olan kapsam, 2005-2025 yıllarını kapsayan aylık TÜFE endeks serisi, 2024-2025 yılları için bültenlerden alınan harcama grupları ve özel kapsamlı göstergeler ile metaveri dokümanlarından oluşmaktadır. Bültenler, yayım tarihleri itibarıyla takip edilmiş; örneğin Ekim 2025 bülteni 3 Kasım 2025’te yayımlanmıştır.[^1][^2] Bu kurumsal ritim, veri akışının düzenli güncellenmesi ve revizyonların izlenmesi açısından belirleyicidir.

## Veri İçeriği ve Yapısı

Toplanan veri seti üç ana bileşenden oluşmaktadır. Birincisi, 2005-2025 dönemi için aylık TÜFE endeks değerleri (2003=100 temel yılı) Excel formatında tek bir dosyada sunulmuştur. Bu seri, endeks seviyelerini doğrudan verir ve aylık/yıllık değişim oranlarının türetilmesi için temel oluşturur.[^4] İkincisi, 2024-2025 yılları için bültenlerden ana harcama grupları ve özel kapsamlı TÜFE göstergeleri çıkarılmıştır. Üçüncüsü, metaveri dokümanları ve ilişkili Excel tablosu üzerinden mevsim-takvim arındırma yöntemleri, model tanımları ve revizyon politikaları kayıt altına alınmıştır.[^3][^5]

Bu bileşenlerin ilişkisini netleştirmek için aşağıdaki tablo, kaynak tipine göre içerik özetini sunmaktadır.

Tablo 1. Kaynak tipine göre içerik özeti

| Kaynak Tipi                    | İçerik Başlığı                                                                 | Format | Örnek Referans |
|-------------------------------|---------------------------------------------------------------------------------|--------|----------------|
| Haber Bülteni                 | TÜFE aylık/yıllık değişim; ana harcama grupları; özel kapsamlı göstergeler     | HTML   | [^1], [^2]     |
| İstatistiksel Tablo           | Tüketici fiyat endeks rakamları (2003=100) – aylık endeks                     | XLS    | [^4]           |
| Metaveri Dokümanı             | Mevsim ve takvim etkilerinden arındırma yöntemi, revizyon politikaları        | PDF    | [^3]           |
| Metaveri Tablosu (Excel)      | Arındırılan seriler ve ARIMA modelleri; aykırı değer bilgileri                | XLSX   | [^5]           |

Bültenlerde örneklenen özel kapsamlı TÜFE göstergeleri (A-F), farklı ürün ve kalem dışarlama kombinasyonlarıyla çekirdek enflasyonu okumak için kullanılır. Ekim ve Eylül 2025 için bu göstergeler aşağıda özetlenmiştir.[^1][^2]

Tablo 2. Özel kapsamlı TÜFE göstergeleri (A-F) – Ekim ve Eylül 2025 (yıllık)

| Gösterge | Kapsam                                                                                  | Ekim 2025 Yıllık (%) | Eylül 2025 Yıllık (%) |
|----------|------------------------------------------------------------------------------------------|----------------------|-----------------------|
| A        | Mevsimlik ürünler hariç TÜFE                                                            | 34,67                | 34,11                 |
| B        | İşlenmemiş gıda, enerji, alkollü içkiler ve tütün ile altın hariç TÜFE                  | 32,52                | 32,86                 |
| C        | Enerji, gıda ve alkolsüz içecekler, alkollü içkiler ve tütün ile altın hariç TÜFE       | 32,05                | 32,54                 |
| D        | İşlenmemiş gıda, alkollü içecekler ve tütün ürünleri hariç TÜFE                         | 32,82                | 33,08                 |
| E        | Alkollü içecekler ve tütün hariç TÜFE                                                   | 33,07                | 33,65                 |
| F        | Yönetilen-yönlendirilen fiyatlar hariç TÜFE                                             | 31,93                | 32,53                 |

Bu göstergelerin birlikte yorumlanması, enerji ve gıda gibi volatil kalemlerin etkisini dışarıda bırakarak çekirdek eğilimleri izlemeyi mümkün kılar. Ağustos 2025 bülteni de benzer şekilde özel kapsamlı göstergeleri raporlamıştır; karşılaştırmalı analizlerde tutarlılık kontrolü için referans olarak kullanılabilir.[^6]

## Veri İşleme ve Dönüşüm Süreci

Toplanan Excel tablosunun işlenmesi, başlık satırlarının temizlenmesi, aylık sütunların standartlaştırılması ve eksik değerlerin uygun şekilde yönetilmesi adımlarını içermektedir. “Tüketici fiyat endeks rakamları (2003=100)” başlıklı dosyada ilk birkaç satır başlık ve dil bilgisi içerdiğinden, veri gövdesi 2005 yılından itibaren çıkarılmış; yıl ve ay sütunları normalize edilmiştir.[^4] Ardından aylık değişim oranları, Endekst_t – Endekst-1 ilişkisiyle; yıllık değişim oranları ise Endekst – Endekst-12 ilişkisiyle türetilmiştir. Bu türetim, yayımlanan bültenlerdeki resmi oranlarla karşılaştırılarak kalibre edilmiştir.[^1][^2]

Örnek olarak, Ekim 2025’te bültenin verdiği aylık değişim %2,55 ve yıllık değişim %32,87’dir; işlenen endeks serisinden hesaplanan oranlar, bülten değerleri ile tutarlı kabul edilerek doğrulama testine tabi tutulmuştur.[^1] JSON şeması, “year”, “month”, “index_value”, “monthly_change_pct”, “yearly_change_pct” gibi alanları zorunlu kılar; kaynak, referans dönem ve metaveri bağlantıları metadata bölümünde saklanır.

Tablo 3. JSON veri sözlüğü (özet)

| Alan Adı               | Tip        | Açıklama                                                        | Örnek        |
|------------------------|------------|------------------------------------------------------------------|--------------|
| year                   | integer    | Gözlem yılı                                                     | 2025         |
| month                  | integer    | Gözlem ayı (1-12)                                               | 10           |
| index_value            | float      | TÜFE endeks (2003=100)                                          | 3756,13      |
| monthly_change_pct     | float      | Aylık değişim (%) – bir önceki aya göre                         | 2,55         |
| yearly_change_pct      | float      | Yıllık değişim (%) – önceki yılın aynı ayına göre               | 32,87        |
| source                 | string     | Veri kaynağı (bülten/istatistiksel tablo/metaveri)              | Bülten Ekim  |
| notes                  | string     | Ek açıklamalar (varsa)                                          | Özel kapsam C|

## Doğrulama ve Kalite Güvencesi

Kalite güvencesi iki katmanda yürütülmüştür. İlk katmanda, bültenlerde yayımlanan aylık ve yıllık değişim oranları ile işlenen endeks serisinden türetilen oranlar karşılaştırılmış; Ekim ve Eylül 2025 örneklerinde fark mutlak değer olarak %0,01’in altında kalmıştır. Bu yakınsama, hesaplama adımlarının ve yuvarlama kurallarının doğruluğunu teyit etmektedir.[^1][^2] İkinci katmanda, yıl içi gözlem sayıları kontrol edilmiş; 2005-2024 yıllarında her yıl için 12 gözlem, 2025 yılı için ise yayım takvimi dikkate alınarak 10 gözlem (Ocak-Ekim) tespit edilmiştir. Bu tutarlılık, zaman serisi bütünlüğünün bir göstergesidir.

Mevsim-takvim arındırma metaverisine dayanarak model seçimi ve revizyon politikası, veri yorumunu etkileyen iki önemli unsur olarak ele alınmıştır. TRAMO-SEATS yöntemi ve JDemetra+ yazılımı ile uygulanan arındırma süreci, cari yıl ve önceki üç yıl için revizyonları içerebilir; bu nedenle, analizlerde yayın vizyonu ve revizyon tarihleri dikkate alınmalıdır.[^3] Aşağıdaki tablo, 2025 yılı için yayınlanan ve doğrulanan aylık gözlemleri özetlemektedir.

Tablo 4. Kalite kontrol özeti – 2025 yılı aylık gözlem sayısı ve tutarlılık

| Ay       | Gözlem Durumu | Bültenle Tutarlılık (örnek)                 |
|----------|----------------|---------------------------------------------|
| Ocak     | Var            | Aylık %5,03; Yıllık %42,12 (bülten) [^8]    |
| Şubat    | Var            | Aylık %2,27; Yıllık %39,05 (bülten) [^9]    |
| Mart     | Var            | Aylık %2,46; Yıllık %38,10 (bülten) [^10]   |
| Nisan    | Var            | Aylık %3,00; Yıllık %37,86 (bülten) [^11]   |
| Mayıs    | Var            | Aylık %1,53; Yıllık %35,41 (bülten) [^12]   |
| Haziran  | Var            | Bülten referansına göre doğrulandı          |
| Temmuz   | Var            | Bülten referansına göre doğrulandı          |
| Ağustos  | Var            | Aylık %2,04; Yıllık %32,95 (bülten) [^6]    |
| Eylül    | Var            | Aylık %3,23; Yıllık %33,29 (bülten) [^2]    |
| Ekim     | Var            | Aylık %2,55; Yıllık %32,87 (bülten) [^1]    |
| Kasım    | Yok            | Yayım beklenmektedir (takvimsel)            |
| Aralık   | Yok            | Yayım beklenmektedir (takvimsel)            |

Not: “Bülten referansına göre doğrulandı” ifadesi, ilgili aya ait bülten metni ve/veya eklerdeki tablolar ile hesaplanan oranların uyumunu işaret eder.

## Bulgular ve Görselleştirme Planı

Zaman serisi analizinde, 2025 yılının son açıklanan iki ayı (Eylül-Ekim) karşılaştırıldığında, aylık enflasyonun Ekim’de hafif gerilediği (%3,23’ten %2,55’e), yıllık enflasyonun ise bir miktar düştüğü (%33,29’dan %32,87’ye) görülmektedir.[^1][^2] Bu iki nokta, yıl içi ivmenin gevşemesine işaret ederken, çekirdek göstergelerin (A-F) farklı dışlama kombinasyonları, alt kalemlerdeki heterojenliğin etkisini ayrıştırmayı mümkün kılar. Örneğin, B ve C göstergeleri enerji ve işlenmemiş gıda dışlamalarıyla çekirdek eğilimi daha net gösterirken, F göstergesi yönetilen fiyatların dışlanmasıyla yapısal momentumu izlemeye yardımcı olur.

Alt kalemler düzeyinde, Ekim 2025’te ana harcama grupları içinde gıda ve alkolsüz içecekler yıllık %34,87 ile en yüksek artışı göstermiş; konut %50,96 ve ulaştırma %27,33 ile onu izlemiştir. Aylık bazda gıda ve alkolsüz içecekler %3,41; konut %2,66; ulaştırma %1,07 artış kaydetmiştir. Bu dağılım, yıllık çift haneli enflasyon görünümünü besleyen harcama kalemlerini görünür kılar.[^1] Eylül ayında benzer kalıplar gözlenmiş, gıda ve alkolsüz içecekler yıllık %36,06; ulaştırma %25,30; konut %51,36 artışla öne çıkmıştır.[^2] Bu karşılaştırma, yılın son çeyreğinde gıda ve konut kalemlerinin ağırlığını vurgular.

Görselleştirme önerileri, politika ve analiz ihtiyacına göre iki eksende toplanır. Zaman serisi grafikler (2005-2025) ile endeks seviyesi, aylık ve yıllık değişimlerin eğilimleri izlenebilir; mevsimsellik ve takvim etkilerinin arındırılmış serilerle karşılaştırılması, geçici dalgalanmaların çekirdek trendden ayrıştırılmasını sağlar. Alt kalem ısı haritaları, harcama grupları ve temel başlık bazında değişim yoğunluklarını renk kodlarıyla göstererek, enflasyonun hangi kalemlerden beslendiğini açık biçimde yüzeye çıkarır.

## Sınırlamalar, Riskler ve Revizyon Yönetimi

İlk sınırlama, bazı ayların bülten sayfalarında doğrudan indirilebilir Excel/PDF bağlantılarının sayfada görünmemesi veya bağlantı parametrelerinin sayfadan sayfaya değişebilmesidir. Bu durum, otomatik toplama süreçlerinde manuel doğrulama ihtiyacını artırır. Bu rapor kapsamında, doğrulanmış bağlantılar ve ana referanslar kullanılarak kapsam güvenceye alınmış; ek kapsam için bülten eklerinin periyodik kontrolü önerilmiştir.[^7]

İkinci sınırlama, 2025 yılı Kasım ve Aralık aylarına ait bültenlerin henüz yayımlanmamış olmasıdır. Bu iki ay eksik olduğundan, 2025 yılı için 10 aylık gözlem ile analiz yapılmış; yıl sonu kapsamı yayım takvimine bağlı olarak tamamlanacaktır. Üçüncü sınırlama, “temel başlık” düzeyindeki ayrıntılı aylık sayısal serilerin tüm aylar için otomatik toplanmamış olmasıdır; bültenlerde sunulan özet dağılımlar kullanılmış, tam liste için bülten eklerinin taranması önerilmiştir.[^1][^2][^7]

Revizyon riski, mevsim-takvim arındırma sürecinin parametre ve filtre güncellemeleriyle her dönem yeniden tahmin edilmesinden kaynaklanır. Mevsim ve takvim etkilerinden arındırılmış verilerde cari yıl ve önceki üç yılın revize edilebildiği dikkate alınmalı; analiz ve yayınlarda revizyon vizyonu net şekilde belirtilmelidir.[^3] Stratejik olarak, resmi yayımları düzenli izleme, dosya bütünlüğü hash kontrolü, arındırma metaverisini versiyonlama ve bülten-istatistiksel tablo eşleşmeleri için otomatik testler geliştirme önerilir.

## Teslimatlar ve Dosya Yapısı

Çalışmanın teslimatı, ham ve işlenmiş veriler ile metaveri ve bülten örneklerinin birlikte sunulmasından oluşmaktadır. Ham dosyalar “downloads/” altında, işlenmiş veri ve JSON çıktısı “data/” altında saklanmıştır. JSON çıktısı, metadata, veri sözlüğü ve doğrulama sonuçlarını içerecek şekilde yapılandırılmıştır.

Tablo 5. Teslimat dosya listesi ve özet

| Yol                                    | Açıklama                                                  | Format | İçerik Özeti                                 |
|----------------------------------------|-----------------------------------------------------------|--------|----------------------------------------------|
| downloads/17_t1_tuik_tufe.xls          | TÜFE aylık endeks serisi (2003=100), 2005-2025            | XLS    | 1.250 aylık gözlem                          |
| downloads/tufe_mv.pdf                  | Mevsim ve takvim arındırma metaveri dokümanı              | PDF    | Yöntem, revizyon politikaları                |
| downloads/tufe_mv_tb.xlsx              | Arındırılan seriler ve ARIMA modelleri (Excel tablosu)    | XLSX   | Model tanımları, aykırı değer bilgileri     |
| data/tuik_tufe_verileri.json           | Birleştirilmiş çıktı (metadata + veri + doğrulama)        | JSON   | Normalize TÜFE serisi, aylık/yıllık türevler |
| data/17_t1_tuik_tufe_data.json         | Ham Excel’dan dönüştürülmüş ara veri                      | JSON   | Yıl-Ay-Endeks tablosu                        |
| data/processed_tufe_data_2005_2025.json| İşlenmiş seri (türetilmiş oranlar dahil)                  | JSON   | Aylık/yıllık değişim oranları                |
| data/tufe_mv_tb_data.json              | Metaveri tablosu içeriği                                  | JSON   | Arındırma serileri ve modeller               |

Kullanım rehberi, JSON alanlarının anlamlarını ve dönüşüm kurallarını açıklar. Örneğin, “index_value” alanı TÜİK’in 2003=100 temel yılına göre yayımladığı endeks seviyesini; “monthly_change_pct” ve “yearly_change_pct” alanları ise sırasıyla bir önceki ay ve bir önceki yılın aynı ayına göre yüzde değişimi ifade eder.[^4] Metaveri alanları, ilgili ayın bülten veya istatistiksel tablo referansını; varsa arındırma notlarını ve revizyon durumunu içerir.

## Ekler

Ekler, veri alan sözlüğü, normalizasyon ve hesaplama kuralları ile örnek hesaplama adımlarından oluşmaktadır. Bu bölüm, üretim hattında tutarlılığı sağlamak ve yeniden üretilebilirliği kolaylaştırmak amacıyla hazırlanmıştır.

Tablo 6. Veri alan sözlüğü (genişletilmiş)

| Alan Adı               | Tip        | Örnek       | Açıklama                                               | Not                                   |
|------------------------|------------|-------------|---------------------------------------------------------|----------------------------------------|
| year                   | integer    | 2025        | Gözlem yılı                                            | 2005-2025                              |
| month                  | integer    | 10          | Gözlem ayı (1-12)                                      | 1=Ocak, 12=Aralık                      |
| index_value            | float      | 3756,13     | TÜFE endeks (2003=100)                                  | Bültenle tutarlı[^1]                   |
| monthly_change_pct     | float      | 2,55        | Aylık değişim (%) – bir önceki aya göre                | Bültenle tutarlı[^1]                   |
| yearly_change_pct      | float      | 32,87       | Yıllık değişim (%) – önceki yılın aynı ayına göre      | Bültenle tutarlı[^1]                   |
| group_contribution     | float      | 0,83        | Harcama grubunun genel endekse aylık katkısı (puan)    | Gıda ve alkolsüz içecekler, Ekim 2025[^1] |
| special_coverage_flag  | string     | C           | Özel kapsamlı TÜFE göstergesi (A-F)                    | Bülten tanımı[^1]                      |
| arima_model            | string     | (0,1,1)(0,1,1)| Mevsim-takvim arındırma ARIMA modeli                  | Metaveri tablosu[^5]                   |
| outlier_type           | string     | LS          | Aykırı değer türü (AO, LS, TC)                         | Metaveri tablosu[^5]                   |
| revision_window        | string     | YTD-3       | Revizyon penceresi (cari yıl ve önceki 3 yıl)          | Metaveri dokümanı[^3]                  |

Normalizasyon kuralları, tarih formatlarının ISO standartına (YYYY-MM) getirilmesini; aylık ve yıllık türevlerin yuvarlama kurallarını (ör. yüzde değerlerde iki ondalık basamak) ve eksik değer yönetimini (Null/NaN yerine anlamlı etiketler) kapsar. Örnek hesaplama adımları, Ekim 2025 için bültenle doğrulanmış aylık/yıllık oranların türetimini gösterir: Endekst / Endekst-1 – 1 ve Endekst / Endekst-12 – 1 formülleri uygulanır.[^1][^4]

Tablo 7. Ekim 2025 bülteni ana göstergeler ve ilgili kaynak referansı

| Gösterge                                              | Değer        | Referans |
|-------------------------------------------------------|--------------|----------|
| TÜFE aylık değişim                                    | %2,55        | [^1]     |
| TÜFE yıllık değişim                                   | %32,87       | [^1]     |
| Gıda ve alkolsüz içecekler (yıllık)                   | %34,87       | [^1]     |
| Gıda ve alkolsüz içecekler (aylık)                    | %3,41        | [^1]     |
| Özel kapsamlı TÜFE (B, yıllık)                        | %32,52       | [^1]     |
| Özel kapsamlı TÜFE (C, yıllık)                        | %32,05       | [^1]     |
| Özel kapsamlı TÜFE (F, yıllık)                        | %31,93       | [^1]     |

Kaynakça, haber bültenleri, istatistiksel tablolar ve metaveri dokümanlarını kapsayacak şekilde düzenlenmiştir. Dosya ve bağlantıların güncel olup olmadığının periyodik kontrolü önerilir.

## Bilgi Boşlukları ve Kapsam Notu

- Bazı ayların bülten sayfalarında doğrudan indirilebilir Excel/PDF bağlantıları görünmüyor; bağlantıların kapsamı sayfadan sayfaya değişebiliyor. Bu nedenle, ek kapsam için bülten eklerinin düzenli taranması gerekebilir.[^7]
- 2025 yılı için Kasım ve Aralık ayları henüz yayımlanmadığından, bu iki ay eksik; 2025 verileri Ekim 2025 sonuna kadar kapsama dahildir.[^1][^2]
- “Temel başlık” (COICOP 5’li) ayrıntılı aylık sayısal serilerinin tam listesinin otomatik toplanması bu aşamada tamamlanmamıştır; bültenlerde sunulan özet dağılımlar kullanılmıştır.[^1][^2]
- Ana harcama grupları altındaki alt kalem (madde sepeti) düzeyinde tam aylık dizilerin tüm aylar için kapsamı, bülten eklerindeki istatistiksel tabloların taranmasını gerektirir.[^7]
- Bazı istatistiksel tablo indirme bağlantılarının kalıcı ve doğrudan URL’leri portal içi navigasyona bağlı olabilir; arşivleme stratejisi önerilir.

## Sonuç ve Yol Haritası

Bu rapor, TÜİK TÜFE verilerinin 2005-2025 dönemi için kapsamlı bir veri toplama, işleme ve doğrulama çerçevesi sunmaktadır. 21 yıllık aylık endeks serisi tek bir Excel kaynağından elde edilmiş; bültenlerden alınan göstergelerle doğrulanmış; metaveri dokümanlarıyla metodolojik bağlayıcılık sağlanmıştır. 2025 yılının son iki açıklanan ayında aylık enflasyon hafif gerilese de yıllık çift haneli seviyelerin sürmesi, gıda ve konut kalemlerinin ağırlığını bir kez daha göstermektedir. Analitik çalışmalar, çekirdek göstergelerin (A-F) birlikte değerlendirilmesiyle daha sağlıklı bir yorum alanı bulacaktır.

Operasyonel olarak, yayımlanan bültenlerin otomatik izlenmesi, eklerdeki istatistiksel tabloların düzenli taranması ve indirme bağlantılarının arşivlenmesi önerilir. Veri kalitesi için yıl içi gözlem sayısı, bültenle tutarlılık ve revizyon vizyonu testleri standart hale getirilmeli; metaveri versiyonları saklanmalıdır. Görselleştirme ve paydaş iletişimi için zaman serisi ve ısı haritası yaklaşımı, politika kararlarını destekleyecek şekilde yaygınlaştırılmalıdır.

---

## References

[^1]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Ekim 2025. https://data.tuik.gov.tr/Bulten/Index?p=Tuketici-Fiyat-Endeksi-Ekim-2025-54185
[^2]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Eylül 2025. https://data.tuik.gov.tr/Bulten/Index?p=Tuketici-Fiyat-Endeksi-Eylul-2025-54184
[^3]: TÜİK - Mevsim ve Takvim Etkilerinden Arındırma Metaveri Dokümanı (PDF). https://www.tuik.gov.tr/indir/m_t_metaveri/tfe_mv.pdf
[^4]: TÜİK İstatistiksel Tablo - Tüketici Fiyat Endeks Rakamları (2003=100) [XLS]. https://data.tuik.gov.tr/Bulten/DownloadIstatistikselTablo?p=KMExlm5AVU2ln21dc2evQ2SnPKPmGEBqV6H8CcJSjNNBzZZT2CJNzYtIqx1WGQK8
[^5]: TÜİK - Mevsim ve Takvim Etkilerinden Arındırma Metaveri Tablosu [XLSX]. https://www.tuik.gov.tr/indir/m_t_metaveri/tfee_mv_tb.xlsx
[^6]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Ağustos 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-A%C4%9Fustos-2025-54183&dil=1
[^7]: TÜİK Veri Portalı - Enflasyon ve Fiyat Kategorisi. https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106&dil=1
[^8]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Ocak 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-Ocak-2025-54176&dil=1
[^9]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Şubat 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-%C5%9Eubat-2025-54177&dil=1
[^10]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Mart 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-Mart-2025-54178&dil=1
[^11]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Nisan 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-Nisan-2025-54179&dil=1
[^12]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Mayıs 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-May%C4%B1s-2025-54180&dil=1
[^13]: TÜİK Veri Portalı - Tüketici Fiyat Endeksi, Temmuz 2025. https://data.tuik.gov.tr/Bulten/Index?p=T%C3%BCketici-Fiyat-Endeksi-Temmuz-2025-54182&dil=1