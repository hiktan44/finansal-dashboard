
# Finansal Veri Görselleştirme ve Sesli Anlatım Uygulaması Dokümantasyonu

Bu doküman, Finansal Piyasalar Panosu uygulamasının genel bakışını, teknik altyapısını, özelliklerini ve kullanıcı deneyimini detaylandırmaktadır.

## 1. UYGULAMA GENEL BAKIŞI

### 1.1 Amaç ve Kullanım Alanı
Bu uygulama, 30 Eylül 2025 tarihli piyasa verilerini interaktif bir arayüzle sunarak, karmaşık finansal bilgileri anlaşılır ve erişilebilir hale getirmeyi amaçlamaktadır. Kullanıcılar, ana borsa endekslerini, önde gelen teknoloji şirketlerinin hisse senedi performanslarını, sektör analizlerini ve emtia fiyatlarını tek bir merkezi `dashboard` üzerinden takip edebilirler. Uygulama, finansal verileri hem görsel grafiklerle hem de sesli anlatımlarla sunarak farklı kullanıcı ihtiyaçlarına hitap eder.

### 1.2 Hedef Kullanıcı Kitlesi
Uygulama, finans piyasalarına ilgi duyan geniş bir kitleye yöneliktir:
- **Bireysel Yatırımcılar**: Kendi portföylerini yöneten ve piyasa trendlerini yakından takip etmek isteyen kullanıcılar.
- **Finans Profesyonelleri**: Analistler, portföy yöneticileri ve danışmanlar için hızlı bir piyasa özeti sunan bir araç.
- **Finans Öğrencileri ve Akademisyenler**: Piyasa verilerini ve sektörler arası ilişkileri anlamak için eğitici bir kaynak.
- **Konuyla İlgili Meraklılar**: Karmaşık finansal dünyayı anlamak isteyen ancak teknik detaylarda boğulmak istemeyen genel kullanıcılar.

### 1.3 Ana Özellikler ve Faydalar
- **Merkezi Veri Paneli**: Tüm kritik piyasa verilerini tek bir ekranda birleştirir.
- **Görsel ve Etkileşimli Grafikler**: Verilerin kolayca anlaşılmasını sağlayan modern ve dinamik grafikler (çubuk, çizgi, mum ve treemap).
- **Sesli Anlatım Desteği**: Her bir veri bölümü için profesyonelce hazırlanmış sesli özetler sunar. Bu özellik, kullanıcılara ekranı okumadan bilgi alma imkanı tanır.
- **Resposive Tasarım**: Masaüstü, tablet ve mobil cihazlarda sorunsuz bir kullanıcı deneyimi sağlar.
- **Anlık Veri Güncelleme**: Tek bir tuşla en son piyasa verilerini simüle ederek paneli yenileme imkanı.

![Figure 1: Finansal Piyasalar Panosu Arayüzü](apple-stock-chart-visualization-financial-data-display.jpg)
*Figür 1: Uygulamanın ana paneli, çeşitli finansal modülleri ve modern arayüzü göstermektedir.*


## 2. TEKNİK ALTYAPI

Uygulamanın geliştirilmesinde modern ve performans odaklı teknolojiler tercih edilmiştir. Bu seçimler, projenin esnekliğini, ölçeklenebilirliğini ve bakım kolaylığını artırmayı hedeflemiştir.

### 2.1 Kullanılan Teknolojiler ve Nedenleri
- **React**: Kullanıcı arayüzü (UI) oluşturmak için kullanılan popüler bir JavaScript kütüphanesidir. Bileşen tabanlı mimarisi sayesinde, yeniden kullanılabilir ve yönetimi kolay UI elemanları oluşturmayı sağlar.
- **TypeScript**: JavaScript'e statik tip denetimi ekler. Bu sayede kod tabanında daha az hata yapılır, kodun okunabilirliği ve bakımı kolaylaşır.
- **Vite**: Modern ve son derece hızlı bir `build` aracıdır. Geliştirme sürecinde anında `hot-reloading` ve hızlı başlangıç süreleri sunarak geliştirici verimliliğini artırır.
- **Tailwind CSS**: Hızla modern ve `responsive` tasarımlar oluşturmayı sağlayan bir `utility-first` CSS `framework`'üdür. Stil dosyaları arasında geçiş yapmadan doğrudan HTML içinde stil tanımlamalarına olanak tanır.
- **Recharts**: React için geliştirilmiş, D3.js tabanlı, modüler bir grafik kütüphanesidir. Finansal verileri görselleştirmek için zengin ve özelleştirilebilir grafik bileşenleri sunar.
- **Lucide React**: Hafif ve tutarlı ikonlar sunan bir kütüphanedir. Uygulama arayüzünün estetiğini ve kullanılabilirliğini artırır.

### 2.2 Frontend Mimarisi
Uygulama, `FinancialDashboard.tsx` ana bileşeni etrafında şekillenen bileşen tabanlı bir mimariye sahiptir. Bu ana bileşen, veri getirme (data fetching), `state` yönetimi ve alt bileşenlerin düzeninden (layout) sorumludur.

- **Ana Bileşen (`FinancialDashboard.tsx`)**: Tüm alt bileşenleri (`MarketIndices`, `TechGiants`, `SectorPerformance` vb.) render eder ve bu bileşenlere gerekli verileri `props` aracılığıyla iletir.
- **Alt Bileşenler**: Her bir finansal modül (örneğin, "Ana Endeksler") kendi React bileşenine sahiptir. Bu modüler yapı, kodun daha organize ve yönetilebilir olmasını sağlar.
- **Veri Akışı**: Veriler, ana bileşende `useEffect` `hook`'u kullanılarak asenkron olarak yerel JSON dosyalarından `fetch` edilir ve bir `state` içinde saklanır. Bu `state`, daha sonra alt bileşenlere dağıtılır.

![Figure 2: Finansal Veri Görselleştirme İkonları](modern_minimalist_financial_dashboard_icons_charts_stocks.jpg)
*Figür 2: Uygulamada kullanılan modern ve minimalist ikon seti, kullanıcı arayüzünün estetik ve işlevsel tasarımını destekler.*

### 2.3 UI Framework ve Stil Sistemleri
Stil sistemi, **Tailwind CSS** üzerine kurulmuştur. Bu yaklaşım, `clsx` ve `tailwind-merge` gibi yardımcı kütüphanelerle desteklenerek dinamik ve koşullu stil sınıflarının verimli bir şekilde yönetilmesini sağlar. Radix UI gibi `headless` UI bileşen kütüphanelerinden alınan temel yapılar, Tailwind CSS ile özelleştirilerek erişilebilirlik standartlarına uygun ve estetik arayüz elemanları oluşturulmuştur.

### 2.4 Veri Yönetimi ve State Yönetimi
Uygulamanın `state` yönetimi, React'in yerleşik `useState` ve `useEffect` `hook`'ları ile gerçekleştirilir. Global bir `state` yönetimi kütüphanesine (Redux, Zustand vb.) ihtiyaç duyulmamıştır, çünkü veri akışı tek yönlü ve basittir:
- `loading` state'i, veri yükleme durumunu takip ederek kullanıcıya bir yükleme animasyonu gösterir.
- `marketData` state'i, tüm finansal verileri tek bir `object` içinde tutar.
- `lastUpdate` state'i, verilerin en son ne zaman güncellendiğini kullanıcıya bildirir.

## 3. VERİ GÖRSELLEŞTİRME ÖZELLİKLERİ

Uygulama, farklı finansal veri setlerini sunmak için çeşitli görselleştirme teknikleri kullanır. Her modül, verinin doğasına en uygun grafik veya tablo türü ile tasarlanmıştır.

### 3.1 Ana Endeksler (Dow Jones, S&P 500, NASDAQ)
Bu bölümde, üç ana ABD borsa endeksinin günlük performansı sunulur. Her endeks için aşağıdaki bilgiler kartlar halinde gösterilir:
- Kapanış değeri
- Günlük değişim (puan ve yüzde olarak)
- Yeni rekor kırıp kırmadığına dair bir gösterge
- Aylık ve çeyreklik getiri gibi ek notlar.

### 3.2 Teknoloji Devleri Performansı
"Yedi Büyükler" olarak bilinen (Tesla, Apple, Microsoft, Google, Amazon, Meta, NVIDIA) teknoloji şirketlerinin hisse senedi performansları bu bölümde analiz edilir. Her şirket için günlük kapanış fiyatı ve yüzdelik değişim bir liste formatında sunulur. Özellikle NVIDIA gibi o günün öne çıkan hisseleri notlarla vurgulanır.

![Figure 3: Hisse Senedi Grafik Anatomisi](anatomy_stock_chart_financial_data_visualization.jpg)
*Figür 3: Uygulamada kullanılan mum grafikleri, bir hisse senedinin gün içindeki açılış, en yüksek, en düşük ve kapanış fiyatlarını bu görseldeki gibi etkili bir şekilde özetler.*

### 3.3 Sektör Analizi ve Rotasyon
Bu modül, S&P 500 içindeki 11 ana sektörün yılbaşından bugüne (YTD) getirilerini karşılaştıran bir çubuk grafik içerir. Bu görselleştirme, yatırımcılara hangi sektörlerin daha iyi veya daha kötü performans gösterdiğini (sektör rotasyonu) hızlıca anlama imkanı sunar. Sanayi, İletişim Hizmetleri ve Finans gibi öne çıkan sektörler grafikte belirgin bir şekilde gösterilir.

### 3.4 Emtia Fiyatları
Altın, ham petrol (WTI ve Brent) ve Bitcoin gibi önemli emtiaların fiyatları bu bölümde listelenir. Her emtia için anlık fiyat, birim ve günlük yüzdelik değişim bilgisi verilir. Özellikle altında yaşanan rekor artış gibi önemli gelişmeler notlarla belirtilir.

### 3.5 Grafik ve Tablo Türleri
- **Kartlar (Cards)**: Ana endeksler ve piyasa özeti gibi kilit bilgileri vurgulamak için kullanılır.
- **Listeler**: Teknoloji devleri ve emtia fiyatları gibi birden çok öğenin karşılaştırıldığı veri setleri için idealdir.
- **Çubuk Grafikler (Bar Charts)**: Sektör performanslarını karşılaştırmak için kullanılır ve `Recharts` kütüphanesi ile oluşturulur.
- **Göstergeler (Indicators)**: Yüzdelik değişimler, renk kodlarıyla (yeşil/pozitif, kırmızı/negatif) anında görsel geri bildirim sağlar.

![Figure 4: Ham Petrol Fiyat Endeksi Grafiği](crude_oil_price_index_candlestick_chart_2022_financial_data_visualization.jpg)
*Figür 4: Emtia fiyatlarını göstermek için kullanılabilecek detaylı bir mum grafiği örneği.*


## 4. SESLİ ANLATIM SİSTEMİ

Uygulamanın en yenilikçi özelliklerinden biri, finansal verileri sesli olarak özetleyen entegre ses sistemidir. Bu sistem, kullanıcılara ekranı aktif olarak takip etmedikleri durumlarda bile bilgi alma esnekliği sunar.

### 4.1 Çoklu Ses Bölümü Desteği
`GlobalAudioControl.tsx` bileşeni, her bir finansal modül için ayrı bir ses oynatıcısı sunar. Kullanıcılar, ilgilendikleri bölümü seçerek dinleyebilirler. Desteklenen sesli anlatım bölümleri şunlardır:
- Piyasa Özeti
- Ana Endeksler
- Teknoloji Devleri
- Sektör Performansı
- Emtialar

Her bölüm, kendi `AudioPlayer` bileşenine sahiptir ve bu bileşenler, `/audio/` klasöründeki ilgili MP3 dosyalarını (`market_summary.mp3`, `stock_indices.mp3` vb.) kullanır.

### 4.2 Global Ses Kontrolü
Arayüzün sağ üst köşesinde bulunan bir kontrol paneli, tüm ses oynatıcıları üzerinde merkezi bir kontrol sağlar:
- **Ana Kontrol Paneli**: `Volume2` ikonu ile açılıp kapanan bu panel, tüm sesli anlatım seçeneklerini listeler.
- **Global Sessize Alma (Mute)**: Tek bir tuşla (`VolumeX` ikonu) tüm sesleri anında sessize alma veya sesi geri açma imkanı sunar. Bu özellik, `document.querySelectorAll('audio')` metodu ile sayfadaki tüm `audio` elementlerine erişerek `muted` özelliğini dinamik olarak değiştirir.

### 4.3 Ses Kalitesi ve İçerik
Ses dosyaları, `docs/voice_scripts.md` dosyasında yer alan metinlere dayanarak profesyonel bir kalitede kaydedilmiştir. Metinler, finansal verileri net, anlaşılır ve hikaye anlatımı formatında sunar. Örneğin, "*Dow Jones Sanayi Ortalaması... tarihi zirvesini yeniledi*" gibi ifadeler, kuru verileri daha ilgi çekici bir anlatıma dönüştürür.

### 4.4 Kullanıcı Etkileşimi
Kullanıcı, her bir ses oynatıcısı üzerinde ayrı ayrı oynatma/durdurma kontrolüne sahiptir. Oynatıcılar, sesin ilerlemesini gösteren bir zaman çubuğu ve mevcut durumu belirten bir ikon (Play/Pause) içerir. Bu sayede kullanıcı, dinleme deneyimi üzerinde tam kontrole sahiptir.

## 5. KULLANICI DENEYİMİ

Kullanıcı deneyimi (UX), uygulamanın tasarım felsefesinin merkezinde yer alır. Amaç, karmaşık verileri sezgisel ve keyifli bir arayüzle sunmaktır.

### 5.1 Responsive Tasarım ve Mobil Uyumluluk
Uygulama, Tailwind CSS'in `responsive` tasarım yetenekleri sayesinde farklı ekran boyutlarına uyum sağlar. `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` gibi `utility` sınıfları kullanılarak `layout`, mobil, tablet ve masaüstü cihazlar için optimize edilmiştir. Bu sayede kullanıcılar, diledikleri cihazdan tutarlı bir deneyim elde eder.

### 5.2 Navigasyon ve Erişilebilirlik
- **Tek Sayfa Arayüzü (Single Page Application)**: Tüm bilgiler tek bir sayfada sunulduğu için karmaşık menüler veya sayfa geçişleri yoktur. Kullanıcılar, `scroll` yaparak tüm veri modüllerine erişebilir.
- **Görsel Hiyerarşi**: Başlıklar, kartlar ve renk kodları, en önemli bilgilerin ilk bakışta fark edilmesini sağlar.
- **Erişilebilirlik**: `label`'lar, `hover` efektleri ve net ikonlar, arayüzün daha anlaşılır olmasına katkıda bulunur. Radix UI gibi `headless` bileşenlerin kullanılması, temel erişilebilirlik standartlarını (örneğin klavye navigasyonu) destekler.

### 5.3 Performans Optimizasyonu
- **Hızlı Yükleme**: Vite'in sunduğu modern `bundling` teknikleri sayesinde uygulama hızlı bir şekilde yüklenir.
- **Yükleme Durumu Göstergesi**: Veriler `fetch` edilirken gösterilen `animate-spin` animasyonu, kullanıcının bir işlem yapıldığını anlamasını sağlar ve bekleme süresini daha tolere edilebilir kılar.
- **Veri Yenileme Simülasasyonu**: `refreshData` fonksiyonu, sayfanın tamamını yeniden yüklemeden sadece veri `state`'ini güncelleyerek (simüle ederek) hızlı bir yenileme hissi yaratır.

![Figure 5: Finansal Dashboard Arka Planı](dark_financial_candlestick_chart_background_3d.jpg)
*Figür 5: Uygulamanın koyu teması ve modern estetiği, bu tür profesyonel ve odaklanmış bir arka planla tamamlanabilir.*

## 6. VERİ KAYNAKLARI VE İŞLEME

### 6.1 Veri Formatları ve Yapı
Uygulama, veri kaynağı olarak `/data/` klasöründe bulunan statik JSON dosyalarını kullanır. Bu yaklaşım, bir backend veya veritabanı gereksinimini ortadan kaldırarak projenin kolayca çalıştırılmasını sağlar. Veriler, 30 Eylül 2025 tarihli piyasa kapanışını yansıtmaktadır.

### 6.2 JSON Veri Yapısı Analizi
Her bir JSON dosyası, belirli bir veri modülüne karşılık gelen temiz ve yapılandırılmış bir formatta sunulmuştur:
- **`market_indices_20250930.json`**: Ana borsa endekslerinin kapanış, değişim ve önemli notlarını içeren bir `array` barındırır.
- **`tech_giants_20250930.json`**: Teknoloji şirketlerinin sembol, kapanış fiyatı ve yüzdelik değişim bilgilerini içerir.
- **`sector_performance_20250930.json`**: Her sektörün S&P 500 ağırlığı, F/K oranı (Forward P/E), beklenen büyüme ve YTD getirisi gibi detaylı metriklerini sunar.
- **`commodities_20250930.json`**: Emtiaların fiyat, birim ve değişim yüzdelerini listeler.
- **`market_summary_20250930.json`**: Piyasanın genel özeti, önemli başlıklar, endişeler ve yaklaşan ekonomik takvim gibi anlatısal veriler içerir.

### 6.3 Gerçek Zamanlı Güncelleme İmkanları
Mevcut mimari, statik JSON dosyaları yerine gerçek zamanlı bir API'ye kolayca adapte edilebilir. `FinancialDashboard.tsx` bileşenindeki `fetch` çağrılarının URL'lerini dinamik bir API `endpoint`'i ile değiştirmek, uygulamayı canlı veri akışıyla çalışır hale getirmek için yeterli olacaktır. `refreshData` fonksiyonu da bu durumda gerçek bir API isteği tetikleyecek şekilde güncellenebilir.

## 7. GÜÇLÜ YANLAR

- **Modern ve Çekici Arayüz**: Koyu tema, `gradient` renk geçişleri ve akıcı animasyonlar, profesyonel ve estetik bir görünüm sunar.
- **Yenilikçi Sesli Anlatım**: Veri sunumuna getirdiği sesli boyut, uygulamayı rakiplerinden ayırır ve erişilebilirliği artırır.
- **Modüler ve Ölçeklenebilir Kod Yapısı**: React bileşenleri sayesinde yeni veri modülleri eklemek veya mevcutları güncellemek oldukça basittir.
- **Yüksek Performans**: Vite ve React `hook`'larının verimli kullanımı sayesinde hızlı ve akıcı bir kullanıcı deneyimi sağlanır.
- **Kolay Kurulum ve Dağıtım**: Harici bir `backend` veya veritabanı gerektirmediği için projenin yerel ortamda çalıştırılması veya `deploy` edilmesi son derece kolaydır.

---

Bu dokümantasyon, projenin mevcut durumunu ve potansiyelini yansıtmaktadır. Gelecekteki geliştirmeler için sağlam bir temel oluşturmaktadır.
