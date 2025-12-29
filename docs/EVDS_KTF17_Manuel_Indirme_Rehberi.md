# EVDS Portalından KTF17 Serileri Manuel İndirme Rehberi

## Genel Bakış

Bu rehber, Türkiye Cumhuriyet Merkez Bankası (TCMB) Elektronik Veri Dağıtım Sistemi (EVDS) portalından **TP.KTF17.USD** ve **TP.KTF17.EUR** (Kredi Faiz Oranları) serilerini manuel olarak indirme sürecini detaylandırmaktadır.

## Hedef Seriler

- **TP.KTF17.USD**: Ticari Krediler USD Faiz Oranları
- **TP.KTF17.EUR**: Ticari Krediler EUR Faiz Oranları

## Gerekli Tarih Aralığı

- **Başlangıç**: 3 Ocak 2008 (03-01-2008)
- **Bitiş**: 30 Ekim 2025 (30-10-2025)

## Erişim Bilgileri

- **Portal URL**: https://evds2.tcmb.gov.tr/
- **SeriMarket Arayüzü**: https://evds2.tcmb.gov.tr/index.php?/evds/serieMarket
- **Login Gerekli Mi**: Hayır, halka açık veri
- **API Anahtarı Gerekli Mi**: Hayır, manuel indirme mevcut

## Manuel İndirme Süreci

### 1. Portala Erişim

1. **EVDS ana sayfasına gidin**: https://evds2.tcmb.gov.tr/
2. **"Tüm Seriler" sekmesine tıklayın** (varsayılan olarak açık)
3. SeriMarket arayüzü yüklenecek

### 2. SerieMarket Arayüzü Yapısı

Arayüz üç ana bölümden oluşur:

#### Sol Panel: Veri Kategorileri
- Hiyerarşik veri kategorileri listesi
- **"FAİZ VE KÂR PAYI İSTATİSTİKLERİ (TCMB)"** bölümü
- Alt kategoriler genişletilmiş durumda

#### Orta Panel: Veri Grubu Seçimi
- **"Veri Grubu Seçiniz"** başlığı altında
- Gözlem tipi seçimi (Orijinal Gözlem önerilir)
- Formül seçimi
- **Veri adı arama alanı** (seri kodu girişi için)

#### Sağ Panel: Seçimler ve Rapor Seçenekleri
- **"SEÇTİKLERİM"** bölümü: Seçilen serilerin listesi
- **"RAPOR SEÇENEKLERİ"** bölümü: İndirme ayarları

### 3. Serileri Arama ve Seçme

#### USD Serisi İçin:
1. **Veri adı arama alanına** tıklayın
2. `TP.KTF17.USD` yazın
3. **Onay kutusu** işaretleyin
4. **Plus (+) butonuna** tıklayarak "SEÇTİKLERİM" paneline ekleyin

#### EUR Serisi İçin:
1. **Veri adı arama alanını** temizleyin
2. `TP.KTF17.EUR` yazın
3. **Onay kutusu** işaretleyin
4. **Plus (+) butonuna** tıklayarak "SEÇTİKLERİM" paneline ekleyin

### 4. Tarih Aralığı Ayarlama

#### Başlangıç Tarihi:
1. **"Başlangıç Tarihi"** alanına tıklayın
2. `03-01-2008` yazın (GG-MM-YYYY formatında)

#### Bitiş Tarihi:
1. **"Bitiş Tarihi"** alanına tıklayın
2. `30-10-2025` yazın (GG-MM-YYYY formatında)

### 5. İndirme Formatı Seçimi

Mevcut format seçenekleri:
- **Grafik görünümü** (chart)
- **Tablo görünümü** (table)
- **PDF** formatı
- **Excel** formatı

**Önerilen**: Excel formatı (en kapsamlı veri analizi için)

### 6. İndirme İşlemi

1. **Excel ikonuna** tıklayın
2. Dosya otomatik olarak indirilecektir
3. İndirilen dosya veri tablosu formatında olacaktır

## Önemli Notlar

### SeriMarket Arayüzü Özellikleri

- **Multi-step seçim süreci**: Arama → Onay → Ekle
- **Otomatik kaydetme**: Seriler "SEÇTİKLERİM" paneline eklenir
- **Sınırsız aralık**: Tarih aralığı kısıtlaması yok
- **Çoklu seri**: Birden fazla seri aynı anda seçilebilir

### Potansiel Zorluklar

1. **Seçim paneli görünürlüğü**: "SEÇTİKLERİM" paneli bazen boş görünebilir
2. **Arama alanı değişimi**: Her aramada önceki seçimler kaybolabilir
3. **Interface yenileme**: Arama sonucunda sayfa yenilenebilir

### Alternatif Yöntemler

#### Rapor Sayfaları:
- https://evds2.tcmb.gov.tr/index.php?/evds/publicDa
- Hazır rapor formatları
- Otomatik tarih aralıkları

#### Sık Kullanılan Seriler:
- https://evds2.tcmb.gov.tr/index.php?/evds/commonSe
- Popüler seriler önceden tanımlı
- Hızlı erişim

## Teknik Detaylar

### Veri Yapısı
- **Frekans**: Günlük (varsayılan)
- **Gözlem Türü**: Ağırlıklı ortalama faiz oranı
- **Para Birimi**: USD ve EUR
- **Seri Kodu**: TP.KTF17.XXX formatı

### Dosya Formatları
- **Excel**: .xlsx uzantılı, çoklu sayfa desteği
- **PDF**: Tek sayfa, görsel format
- **CSV**: Noktalı virgül ayrılmış değerler
- **XML**: Yapılandırılmış veri formatı

## Örnek Kullanım Senaryoları

### Akademik Araştırma
1. 2008-2025 tarih aralığında USD/EUR kredi faiz karşılaştırması
2. Türk bankacılık sektörü analizi
3. Uluslararası finans piyasası etkileri

### Finansal Analiz
1. Portföy performans analizi
2. Risk değerlendirmesi
3. Zaman serisi modelleme

## Sonuç

EVDS portalı, TCMB'nin resmi veri dağıtım platformu olup, KTF17 serileri için güvenilir ve ücretsiz erişim sağlar. Manuel indirme süreci kullanıcı dostu arayüzü ile kolaydır, ancak multi-step seçim süreci nedeni dikkat gerektirir.

## Ekran Görüntüleri

Araştırma sürecinde alınan ekran görüntüleri:
- SeriMarket ana arayüzü
- KTF17 arama sonuçları
- USD ve EUR seri seçimi
- Tarih aralığı ayarları
- İndirme format seçenekleri

---

**Tarih**: 9 Kasım 2025  
**Araştırmacı**: MiniMax Agent  
**Portal**: EVDS (Elektronik Veri Dağıtım Sistemi)  
**TCMB**: Türkiye Cumhuriyet Merkez Bankası