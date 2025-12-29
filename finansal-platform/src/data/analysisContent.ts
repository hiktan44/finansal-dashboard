// Güncel Analiz İçerik Yapısı - 12 Ana Bölüm
// PPTX analiz sonuçlarından organize edilmiş içerik

export interface AnalysisSection {
  id: string;
  title: string;
  icon: string;
  slideRange: [number, number];
  subsections: AnalysisSubsection[];
  lastUpdate: string;
  updateFrequency: string;
  description: string;
}

export interface AnalysisSubsection {
  id: string;
  title: string;
  slides: number[];
  content: string;
  dataPoints: DataPoint[];
  sourceUrl?: string;
}

export interface DataPoint {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  note?: string;
}

export const analysisSections: AnalysisSection[] = [
  {
    id: 'growth',
    title: 'Büyüme ve Milli Gelir Verileri',
    icon: 'TrendingUp',
    slideRange: [5, 9],
    lastUpdate: '2025-11-03',
    updateFrequency: 'Çeyreklik',
    description: 'Türkiye ekonomisinin büyüme performansı, GSYİH verileri ve çeyreklik büyüme oranları',
    subsections: [
      {
        id: 'growth-1',
        title: 'Türkiye Büyüme Oranları (1998-2024)',
        slides: [6],
        content: 'Türkiye ekonomisinin yıllık bazda büyüme performansını gösteren tarihsel veriler. 1998-2024 dönemini kapsayan detaylı analiz.',
        dataPoints: [
          { label: '2024 Büyüme', value: '%3.2', trend: 'up' },
          { label: '2023 Büyüme', value: '%4.5', trend: 'stable' },
          { label: 'Ortalama (20 yıl)', value: '%5.1', trend: 'stable' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113'
      },
      {
        id: 'growth-2',
        title: 'GDP Annual Growth Rate (2000-2026)',
        slides: [7],
        content: 'Milyon USD cinsinden yıllık GSYİH büyüme oranları ve projeksiyonlar.',
        dataPoints: [
          { label: '2025 Tahmini', value: '$1.12T', trend: 'up' },
          { label: '2024 Gerçekleşen', value: '$1.09T', trend: 'up' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113'
      },
      {
        id: 'growth-3',
        title: 'Çeyreklik Büyüme Oranları (2000-2025)',
        slides: [8, 9],
        content: 'Üç aylık dönemler bazında detaylı büyüme analizi ve sezonsal etkiler.',
        dataPoints: [
          { label: '2025 Q3', value: '%3.2', trend: 'up' },
          { label: '2025 Q2', value: '%3.5', trend: 'up' },
          { label: '2025 Q1', value: '%2.8', trend: 'stable' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113'
      }
    ]
  },
  {
    id: 'inflation',
    title: 'Enflasyon Verileri',
    icon: 'Activity',
    slideRange: [10, 16],
    lastUpdate: '2025-11-03',
    updateFrequency: 'Aylık',
    description: 'TÜFE, ÜFE ve TCMB enflasyon tahminleri ile fiyat hareketlerinin kapsamlı analizi',
    subsections: [
      {
        id: 'inflation-1',
        title: 'TÜFE Manşet Enflasyon Oranı',
        slides: [11, 12],
        content: 'Tüketici Fiyat Endeksi (TÜFE) aylık ve yıllık değişim oranları. Önceki ve revize edilmiş veriler karşılaştırması.',
        dataPoints: [
          { label: 'Ekim 2025 Yıllık', value: '%32.87', trend: 'down' },
          { label: 'Ekim 2025 Aylık', value: '%2.55', trend: 'stable' },
          { label: '12 Aylık Ortalama', value: '%35.12', trend: 'down', note: 'Düşüş trendi' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106'
      },
      {
        id: 'inflation-2',
        title: 'Üretici Fiyat Endeksi (ÜFE)',
        slides: [13, 14, 15],
        content: 'Yurt İçi Üretici Fiyat Endeksi (Yİ-ÜFE) verileri ve sektörel dağılım analizi.',
        dataPoints: [
          { label: 'Ekim 2025 Yıllık', value: '%27.00', trend: 'down' },
          { label: 'Ekim 2025 Aylık', value: '%1.89', trend: 'stable' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106'
      },
      {
        id: 'inflation-3',
        title: 'TCMB Enflasyon Tahmin ve Revizyonları',
        slides: [16],
        content: 'T.C. Merkez Bankası tarafından yapılan enflasyon tahminleri ve revizyon analizleri.',
        dataPoints: [
          { label: '2025 Yıl Sonu Tahmini', value: '%28.0', trend: 'stable' },
          { label: '2026 Tahmini', value: '%22.0', trend: 'down' }
        ],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Yayinlar/Raporlar/Enflasyon+Raporu'
      }
    ]
  },
  {
    id: 'budget',
    title: 'Bütçe Verileri',
    icon: 'DollarSign',
    slideRange: [17, 22],
    lastUpdate: '2025-11-01',
    updateFrequency: 'Aylık',
    description: 'Merkezi yönetim bütçe dengesi, bütçe açığı ve gelir-gider analizleri',
    subsections: [
      {
        id: 'budget-1',
        title: 'Merkezi Yönetim Bütçe Dengesi (2000-2025)',
        slides: [18, 19],
        content: 'Tarihsel bütçe dengesi verileri ve trend analizi.',
        dataPoints: [
          { label: '2025 Bütçe Açığı', value: '₺892 Milyar', trend: 'up' },
          { label: 'GSYİH Oranı', value: '%3.8', trend: 'stable' }
        ],
        sourceUrl: 'https://www.hmb.gov.tr/butce-buyuklukler'
      },
      {
        id: 'budget-2',
        title: '2025 Bütçe Denge Tablosu',
        slides: [20],
        content: 'Detaylı gelir-gider kalemleri ve bütçe performansı.',
        dataPoints: [],
        sourceUrl: 'https://www.hmb.gov.tr/butce-buyuklukler'
      },
      {
        id: 'budget-3',
        title: 'Bütçe Açığının Milli Gelire Oranı (2000-2026)',
        slides: [21, 22],
        content: 'Bütçe açığının GSYİH içindeki payının tarihsel gelişimi ve projeksiyonlar.',
        dataPoints: [
          { label: '2025 Oran', value: '%3.8', trend: 'stable' },
          { label: '2026 Hedef', value: '%3.2', trend: 'down' }
        ],
        sourceUrl: 'https://www.hmb.gov.tr/butce-buyuklukler'
      }
    ]
  },
  {
    id: 'unemployment',
    title: 'İşsizlik Verileri',
    icon: 'Users',
    slideRange: [23, 27],
    lastUpdate: '2025-10-15',
    updateFrequency: 'Aylık',
    description: 'İşgücü piyasası verileri, işsizlik oranları ve istihdam analizleri',
    subsections: [
      {
        id: 'unemployment-1',
        title: 'Aylık İşsizlik Oranları',
        slides: [24, 25, 26, 27],
        content: 'Mevsimsellikten arındırılmış ve ham işsizlik oranları, tarihsel karşılaştırmalar.',
        dataPoints: [
          { label: 'Ağustos 2025', value: '%9.5', trend: 'stable' },
          { label: 'Genç İşsizlik', value: '%16.8', trend: 'down' },
          { label: 'İstihdam Oranı', value: '%49.2', trend: 'up' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=istihdam-issizlik-ve-ucret-108'
      }
    ]
  },
  {
    id: 'foreign-trade',
    title: 'Dış Ticaret ve Cari Açık',
    icon: 'Globe',
    slideRange: [33, 46],
    lastUpdate: '2025-11-01',
    updateFrequency: 'Aylık',
    description: 'İhracat-ithalat verileri, dış ticaret dengesi ve cari işlemler hesabı analizleri',
    subsections: [
      {
        id: 'trade-1',
        title: 'İhracat-İthalat Rakamları (2010-2025)',
        slides: [34, 35, 36],
        content: 'Aylık ve yıllık dış ticaret verileri, trend analizleri.',
        dataPoints: [
          { label: 'Ekim 2025 İhracat', value: '$23.4 Milyar', trend: 'up' },
          { label: 'Ekim 2025 İthalat', value: '$31.2 Milyar', trend: 'up' },
          { label: 'Dış Ticaret Açığı', value: '$7.8 Milyar', trend: 'stable' }
        ],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=dis-ticaret-104'
      },
      {
        id: 'trade-2',
        title: 'Sektörlere Göre İhracatın Dağılımı',
        slides: [37, 38],
        content: 'Sanayi, tarım ve hizmet sektörlerinin ihracat performansı.',
        dataPoints: [],
        sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=dis-ticaret-104'
      },
      {
        id: 'trade-3',
        title: 'Cari İşlemler Dengesi',
        slides: [39, 40, 41, 42, 43],
        content: 'Cari açık/fazla verileri, finansman yapısı ve sürdürülebilirlik analizleri.',
        dataPoints: [
          { label: 'Eylül 2025 Cari Denge', value: '-$2.8 Milyar', trend: 'stable' },
          { label: '12 Aylık Kümülatif', value: '-$18.2 Milyar', trend: 'down', note: 'İyileşme' }
        ],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Odemeler+Dengesi+ve+Ilgili+Istatistikler'
      }
    ]
  },
  {
    id: 'energy',
    title: 'Enerji İthalatı',
    icon: 'Zap',
    slideRange: [44, 46],
    lastUpdate: '2025-10-20',
    updateFrequency: 'Aylık',
    description: 'Ham petrol, doğalgaz ve enerji ithalatı verileri, projeksiyonlar',
    subsections: [
      {
        id: 'energy-1',
        title: 'Türkiye Enerji İthalatı (2012-2025)',
        slides: [45, 46],
        content: 'Enerji ithalatı tutarları, kaynak ülkeler ve gelecek projeksiyonları.',
        dataPoints: [
          { label: '2025 Enerji İthalatı', value: '$62 Milyar', trend: 'up' },
          { label: 'Toplam İthalattaki Pay', value: '%19.8', trend: 'stable' }
        ],
        sourceUrl: 'https://enerji.gov.tr/'
      }
    ]
  },
  {
    id: 'money-supply',
    title: 'Para Arzları M1-M2-M3',
    icon: 'Banknote',
    slideRange: [47, 52],
    lastUpdate: '2025-10-31',
    updateFrequency: 'Haftalık',
    description: 'Parasal büyüklükler, M1-M2-M3 verileri ve likidite analizleri',
    subsections: [
      {
        id: 'money-1',
        title: 'M3 Para Arzı Verileri',
        slides: [48, 49, 50],
        content: 'Geniş tanımlı para arzı (M3) ve bileşenleri.',
        dataPoints: [
          { label: 'M3 (Ekim 2025)', value: '₺19.8 Trilyon', trend: 'up' },
          { label: 'Yıllık Artış', value: '%45.2', trend: 'down' }
        ],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Parasal+ve+Finansal+Istatistikler'
      },
      {
        id: 'money-2',
        title: 'Net Hata ve Noksan (2010-2025)',
        slides: [51, 52],
        content: 'Ödemeler dengesi net hata ve noksan kalemi analizi.',
        dataPoints: [],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Odemeler+Dengesi+ve+Ilgili+Istatistikler'
      }
    ]
  },
  {
    id: 'tourism',
    title: 'Turizm Geliri ve Turist Sayısı',
    icon: 'Plane',
    slideRange: [60, 64],
    lastUpdate: '2025-10-25',
    updateFrequency: 'Aylık',
    description: 'Turizm sektörü verileri, gelir analizleri ve turist sayısı istatistikleri',
    subsections: [
      {
        id: 'tourism-1',
        title: 'Türkiye Turizm Geliri (2015-2025)',
        slides: [61, 62],
        content: 'Yıllık turizm geliri verileri ve projeksiyonlar.',
        dataPoints: [
          { label: '2025 Tahmini', value: '$56 Milyar', trend: 'up' },
          { label: '2024 Gerçekleşen', value: '$54.3 Milyar', trend: 'up' }
        ],
        sourceUrl: 'https://www.ktb.gov.tr/'
      },
      {
        id: 'tourism-2',
        title: 'Yabancı Turist Sayısı',
        slides: [63, 64],
        content: 'Ülke bazında turist sayıları ve trend analizleri.',
        dataPoints: [
          { label: '2025 Turist Sayısı', value: '58.2 Milyon', trend: 'up' },
          { label: 'Kişi Başı Harcama', value: '$962', trend: 'stable' }
        ],
        sourceUrl: 'https://www.ktb.gov.tr/'
      }
    ]
  },
  {
    id: 'exchange-rate',
    title: 'Reel Efektif Döviz Kuru',
    icon: 'TrendingDown',
    slideRange: [65, 71],
    lastUpdate: '2025-11-01',
    updateFrequency: 'Günlük',
    description: 'TÜFE bazlı reel efektif döviz kuru, nominal kur ve rekabetçilik analizleri',
    subsections: [
      {
        id: 'exchange-1',
        title: 'NEK (Nominal Efektif Döviz Kuru)',
        slides: [67],
        content: 'Nominal efektif döviz kuru tanımı ve hesaplama metodolojisi.',
        dataPoints: [],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari'
      },
      {
        id: 'exchange-2',
        title: 'TÜFE Bazlı Reel Efektif Döviz Kuru',
        slides: [68, 69, 70, 71],
        content: 'Reel efektif döviz kuru endeksi ve rekabetçilik göstergesi.',
        dataPoints: [
          { label: 'TÜFE Bazlı REDK', value: '48.2', trend: 'down', note: 'Düşük seviye' }
        ],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari'
      }
    ]
  },
  {
    id: 'cds',
    title: 'Türkiye Kredi Risk Primi (CDS)',
    icon: 'Shield',
    slideRange: [72, 76],
    lastUpdate: '2025-11-06',
    updateFrequency: 'Günlük',
    description: 'CDS primleri, ülke risk değerlendirmesi ve uluslararası karşılaştırmalar',
    subsections: [
      {
        id: 'cds-1',
        title: 'Günlük CDS Verileri',
        slides: [73, 74],
        content: '5 yıllık CDS spreadleri ve günlük değişimler.',
        dataPoints: [
          { label: '5 Yıllık CDS', value: '392 bp', trend: 'stable' },
          { label: 'Günlük Değişim', value: '+2 bp', trend: 'stable' }
        ],
        sourceUrl: 'https://www.bloomberg.com/markets/rates-bonds'
      },
      {
        id: 'cds-2',
        title: 'Haftalık CDS Grafiği (2008-2025)',
        slides: [75, 76],
        content: 'Tarihsel CDS trend analizi ve kriz dönemleri karşılaştırması.',
        dataPoints: [],
        sourceUrl: 'https://www.bloomberg.com/markets/rates-bonds'
      }
    ]
  },
  {
    id: 'reserves',
    title: 'Merkez Bankası Rezervleri',
    icon: 'PiggyBank',
    slideRange: [89, 96],
    lastUpdate: '2025-10-31',
    updateFrequency: 'Haftalık',
    description: 'Altın ve döviz rezervleri, net rezerv pozisyonu ve swap analizleri',
    subsections: [
      {
        id: 'reserves-1',
        title: 'Net Rezerv (2010-2025)',
        slides: [90, 91, 92],
        content: 'Brüt ve net uluslararası rezervler, tarihsel gelişim.',
        dataPoints: [
          { label: 'Brüt Rezerv', value: '$147.8 Milyar', trend: 'up' },
          { label: 'Net Rezerv', value: '$48.2 Milyar', trend: 'up' }
        ],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Rezervler'
      },
      {
        id: 'reserves-2',
        title: 'Swap Tutarları',
        slides: [93, 94],
        content: 'TCMB swap işlemleri ve tutarları.',
        dataPoints: [
          { label: 'Swap Tutarı', value: '$62.5 Milyar', trend: 'stable' }
        ],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Rezervler'
      },
      {
        id: 'reserves-3',
        title: 'Yabancıların DİBS ve Hisse Alış-Satışları',
        slides: [95, 96],
        content: 'Portföy yatırımları ve yabancı sermaye akımları.',
        dataPoints: [],
        sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler'
      }
    ]
  },
  {
    id: 'forecasts',
    title: 'Ekonomik Öngörüler ve Tavsiyeler',
    icon: 'Target',
    slideRange: [110, 259],
    lastUpdate: '2025-11-06',
    updateFrequency: 'Çeyreklik',
    description: '2025-2027 ekonomik senaryolar, döviz kuru, faiz, enflasyon öngörüleri ve yatırım tavsiyeleri',
    subsections: [
      {
        id: 'forecast-1',
        title: '2 Senaryo Analizi',
        slides: [111],
        content: 'Toparlanma Senaryosu (%80 ihtimal) vs Şiddetli Kriz Senaryosu (%20 ihtimal)',
        dataPoints: [
          { label: 'Toparlanma İhtimali', value: '%80', trend: 'stable' },
          { label: 'Kriz İhtimali', value: '%20', trend: 'stable' }
        ]
      },
      {
        id: 'forecast-2',
        title: 'Döviz Kuru Öngörüleri',
        slides: [112, 113, 114],
        content: 'Dolar/TL ve Euro/TL paritesi için 2025-2027 projeksiyonları.',
        dataPoints: [
          { label: '2025 Yıl Sonu USD/TL', value: '₺42-44', trend: 'up' },
          { label: '2026 Yıl Sonu USD/TL', value: '₺47-49', trend: 'up' }
        ]
      },
      {
        id: 'forecast-3',
        title: 'Politika Faizi Seyri',
        slides: [115, 116],
        content: 'TCMB politika faizi öngörüleri ve para politikası analizi.',
        dataPoints: [
          { label: 'Mevcut Politika Faizi', value: '%50', trend: 'stable' },
          { label: '2025 Yıl Sonu Beklenti', value: '%42-45', trend: 'down' }
        ]
      },
      {
        id: 'forecast-4',
        title: 'Enflasyon Öngörüleri (2025-27)',
        slides: [117, 118],
        content: 'Orta Vadeli Program çerçevesinde enflasyon hedefleri ve gerçekleşme beklentileri.',
        dataPoints: []
      },
      {
        id: 'forecast-5',
        title: 'Konut Satışları ve Fiyat Endeksi',
        slides: [119, 120],
        content: 'Emlak piyasası öngörüleri ve fiyat hareketleri.',
        dataPoints: []
      },
      {
        id: 'forecast-6',
        title: 'İstanbul Borsası (BIST 100)',
        slides: [121, 122],
        content: 'BIST 100 endeksi için teknik ve temel analiz projeksiyonları.',
        dataPoints: []
      },
      {
        id: 'forecast-7',
        title: 'Emtia Piyasaları',
        slides: [123, 124, 125],
        content: 'Brent petrol, ons altın, bakır, alüminyum, çinko gibi sanayi metalleri öngörüleri.',
        dataPoints: []
      },
      {
        id: 'forecast-8',
        title: 'Sepet Yatırım Önerisi',
        slides: [126, 127],
        content: 'Portföy dağılımı ve varlık sınıfı tavsiyeleri.',
        dataPoints: []
      },
      {
        id: 'forecast-9',
        title: 'İşverenlere Öneriler (2025-26)',
        slides: [128, 150],
        content: 'İşletmeler için operasyonel, finansal ve stratejik öneriler.',
        dataPoints: []
      },
      {
        id: 'forecast-10',
        title: 'Yeni Dünya Düzeni Analizi',
        slides: [151, 259],
        content: 'Küresel ekonomi, jeopolitik riskler ve yapısal değişim analizleri.',
        dataPoints: []
      }
    ]
  }
];

// Son güncelleme tarihleri için yardımcı fonksiyon
export function getLatestUpdateDate(sectionId: string): Date {
  const section = analysisSections.find(s => s.id === sectionId);
  return section ? new Date(section.lastUpdate) : new Date();
}

// Güncelleme sıklığı badge renkleri
export function getUpdateFrequencyColor(frequency: string): string {
  const colors: Record<string, string> = {
    'Günlük': 'green',
    'Haftalık': 'blue',
    'Aylık': 'purple',
    'Çeyreklik': 'orange',
    'Yıllık': 'gray'
  };
  return colors[frequency] || 'gray';
}
