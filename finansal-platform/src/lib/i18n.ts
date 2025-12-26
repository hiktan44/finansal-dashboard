import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      // Navigation
      dashboard: 'Gösterge Paneli',
      portfolio: 'Portföy',
      watchlist: 'İzleme Listesi',
      markets: 'Piyasalar',
      
      // Asset Types
      bist: 'BIST Hisseleri',
      tefas: 'TEFAS Fonları',
      crypto: 'Kripto Paralar',
      currency: 'Döviz',
      metal: 'Altın/Emtia',
      macro: 'Makroekonomik',
      
      // Common
      search: 'Ara',
      filter: 'Filtrele',
      add: 'Ekle',
      remove: 'Kaldır',
      save: 'Kaydet',
      cancel: 'İptal',
      edit: 'Düzenle',
      delete: 'Sil',
      close: 'Kapat',
      loading: 'Yükleniyor...',
      noData: 'Veri bulunamadı',
      
      // Asset Details
      price: 'Fiyat',
      change: 'Değişim',
      volume: 'Hacim',
      marketCap: 'Piyasa Değeri',
      lastUpdated: 'Son Güncelleme',
      addToWatchlist: 'İzleme Listesine Ekle',
      addToPortfolio: 'Portföye Ekle',
      
      // Portfolio
      totalValue: 'Toplam Değer',
      totalGainLoss: 'Toplam Kar/Zarar',
      holdings: 'Varlıklar',
      quantity: 'Miktar',
      purchasePrice: 'Alış Fiyatı',
      currentPrice: 'Güncel Fiyat',
      gainLoss: 'Kar/Zarar',
      
      // Auth
      signIn: 'Giriş Yap',
      signUp: 'Kayıt Ol',
      signOut: 'Çıkış Yap',
      email: 'E-posta',
      password: 'Şifre',
      signInDesc: 'Hesabınıza giriş yapın',
      signUpDesc: 'Portföyünüzü yönetmek için hesap oluşturun',
      signUpSuccess: 'Kayıt başarılı! Lütfen e-postanızı kontrol edin',
      alreadyHaveAccount: 'Zaten hesabınız var mı?',
      noAccount: 'Hesabınız yok mu?',
      signInRequired: 'Giriş Yapmanız Gerekiyor',
      signInToManagePortfolio: 'Portföyünüzü yönetmek için lütfen giriş yapın',
      signInToManageWatchlist: 'İzleme listesini kullanmak için lütfen giriş yapın',
      
      // Portfolio Management
      myPortfolio: 'Portföyüm',
      defaultPortfolioDesc: 'Ana portföy',
      noPortfolio: 'Henüz Portföyünüz Yok',
      createFirstPortfolio: 'İlk portföyünüzü oluşturarak başlayın',
      createPortfolio: 'Portföy Oluştur',
      manageYourInvestments: 'Yatırımlarınızı yönetin ve takip edin',
      percentage: 'Yüzde',
      addHolding: 'Varlık Ekle',
      noHoldings: 'Henüz varlık eklemediniz',
      symbol: 'Sembol',
      currentValue: 'Güncel Değer',
      
      // Watchlist
      trackYourFavorites: 'Favori varlıklarınızı takip edin',
      emptyWatchlist: 'İzleme Listeniz Boş',
      addAssetsToWatchlist: 'Piyasalar sayfasından varlık ekleyerek başlayın',
      
      // Common Actions
      refresh: 'Yenile',
      
      // Time periods
      today: 'Bugün',
      week: 'Hafta',
      month: 'Ay',
      year: 'Yıl',
      all: 'Tümü',
      
      // TEFAS Funds
      funds: 'Fonlar',
      fundType: 'Fon Türü',
      equityFund: 'Hisse Senedi Fonu',
      bondFund: 'Tahvil Fonu',
      mixedFund: 'Karma Fon',
      moneyMarketFund: 'Para Piyasası Fonu',
      preciousMetalFund: 'Altın Fonu',
      nav: 'Birim Fon Payı',
      aum: 'Fon Büyüklüğü',
      expenseRatio: 'Yönetim Ücreti',
      performance: 'Performans',
      riskScore: 'Risk Skoru',
      
      // Macro Data
      macroData: 'Makroekonomik Veriler',
      country: 'Ülke',
      indicator: 'Gösterge',
      interestRate: 'Faiz Oranı',
      inflation: 'Enflasyon',
      unemployment: 'İşsizlik',
      gdpGrowth: 'GDP Büyüme',
      
      // Analytics
      analytics: 'Analiz',
      riskMetrics: 'Risk Metrikleri',
      volatility: 'Volatilite',
      sharpeRatio: 'Sharpe Oranı',
      maxDrawdown: 'Maksimum Düşüş',
      diversification: 'Çeşitlendirme',
      diversificationScore: 'Çeşitlendirme Skoru',
      concentrationScore: 'Konsantrasyon Skoru',
      assetAllocation: 'Varlık Dağılımı',
      performanceReport: 'Performans Raporu',
      recommendations: 'Öneriler',
      
      // Modals
      addAsset: 'Varlık Ekle',
      removeAsset: 'Varlık Çıkar',
      editAsset: 'Varlık Düzenle',
      selectAsset: 'Varlık Seçin',
      enterQuantity: 'Miktar Girin',
      enterPrice: 'Fiyat Girin',
      purchaseDate: 'Alış Tarihi',
      notes: 'Notlar',
      confirmRemove: 'Çıkarmak İstediğinize Emin Misiniz?',
      
      // Asset Detail Page
      overview: 'Genel Bakış',
      charts: 'Grafikler',
      details: 'Detaylar',
      relatedAssets: 'İlgili Varlıklar',
      technicalAnalysis: 'Teknik Analiz',
      fundamentalAnalysis: 'Temel Analiz',
      
      // Advanced Filters
      filters: 'Filtreler',
      active: 'Aktif',
      clear: 'Temizle',
      searchAssets: 'Varlık ara (hisse, fon, kripto...)',
      searchHint: 'Harf yazarak filtreleme yapabilirsiniz (örn: T, BI, ETH)',
      assetType: 'Varlık Türü',
      priceRange: 'Fiyat Aralığı',
      performanceRange: 'Performans Aralığı (%)',
      riskLevel: 'Risk Seviyesi',
      marketCapRange: 'Piyasa Değeri Aralığı',
      sectors: 'Sektörler',
      min: 'Min',
      max: 'Max',
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      showing: 'Gösterilen',
      assets: 'varlık',
      
      // Sectors
      technology: 'Teknoloji',
      finance: 'Finans',
      energy: 'Enerji',
      healthcare: 'Sağlık',
      retail: 'Perakende',
      manufacturing: 'İmalat',
      telecom: 'Telekomünikasyon',
      real_estate: 'Gayrimenkul',
      
      // AI Analysis
      aiAnalysis: 'AI Analizi',
      noAIAnalysis: 'AI analizi mevcut değil',
      runAIAnalysis: 'AI Analizi Çalıştır',
      trend: 'Trend',
      strength: 'Güç',
      risk: 'Risk',
      confidence: 'Güven',
      analysisConfidence: 'Analiz güveni',
      supportResistance: 'Destek & Direnç Seviyeleri',
      support: 'Destek',
      resistance: 'Direnç',
      technicalIndicators: 'Teknik İndikatörler',
      pricePredictions: 'Fiyat Tahminleri',
      analysisSummary: 'Analiz Özeti',
      refreshAnalysis: 'Analizi Yenile',
      bullish: 'Yükseliş',
      bearish: 'Düşüş',
      neutral: 'Nötr',
      overbought: 'Aşırı Alım',
      oversold: 'Aşırı Satım',
      above: 'Üstünde',
      below: 'Altında',
      within: 'İçinde',
      
      // Alerts
      alerts: 'Alarmlar',
      createAlert: 'Yeni Alarm',
      manageYourAlerts: 'Fiyat alarmları ve bildirimlerinizi yönetin',
      totalAlerts: 'Toplam Alarm',
      activeAlerts: 'Aktif Alarm',
      triggeredAlerts: 'Tetiklenen',
      noAlertsYet: 'Henüz alarm oluşturmadınız',
      createFirstAlert: 'İlk Alarmınızı Oluşturun',
      signInToManageAlerts: 'Alarm yönetimi için giriş yapın',
      condition: 'Koşul',
      monitoring: 'İzleniyor',
      paused: 'Duraklatıldı',
      triggerHistory: 'Tetikleme Geçmişi',
      triggerValue: 'Tetik Değeri',
      triggeredAt: 'Tetiklenme',
      alertType: 'Alarm Türü',
      threshold: 'Değer',
      create: 'Oluştur',
      confirmDeleteAlert: 'Alarmı silmek istediğinize emin misiniz?',
      errorCreatingAlert: 'Alarm oluşturulurken hata oluştu',
    }
  },
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      portfolio: 'Portfolio',
      watchlist: 'Watchlist',
      markets: 'Markets',
      
      // Asset Types
      bist: 'BIST Stocks',
      tefas: 'TEFAS Funds',
      crypto: 'Cryptocurrencies',
      currency: 'Currencies',
      metal: 'Gold/Commodities',
      macro: 'Macroeconomic',
      
      // Common
      search: 'Search',
      filter: 'Filter',
      add: 'Add',
      remove: 'Remove',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      loading: 'Loading...',
      noData: 'No data found',
      
      // Asset Details
      price: 'Price',
      change: 'Change',
      volume: 'Volume',
      marketCap: 'Market Cap',
      lastUpdated: 'Last Updated',
      addToWatchlist: 'Add to Watchlist',
      addToPortfolio: 'Add to Portfolio',
      
      // Portfolio
      totalValue: 'Total Value',
      totalGainLoss: 'Total Gain/Loss',
      holdings: 'Holdings',
      quantity: 'Quantity',
      purchasePrice: 'Purchase Price',
      currentPrice: 'Current Price',
      gainLoss: 'Gain/Loss',
      
      // Time periods
      today: 'Today',
      week: 'Week',
      month: 'Month',
      year: 'Year',
      all: 'All',
      
      // TEFAS Funds
      funds: 'Funds',
      fundType: 'Fund Type',
      equityFund: 'Equity Fund',
      bondFund: 'Bond Fund',
      mixedFund: 'Mixed Fund',
      moneyMarketFund: 'Money Market Fund',
      preciousMetalFund: 'Precious Metal Fund',
      nav: 'Net Asset Value',
      aum: 'Assets Under Management',
      expenseRatio: 'Expense Ratio',
      performance: 'Performance',
      riskScore: 'Risk Score',
      
      // Macro Data
      macroData: 'Macroeconomic Data',
      country: 'Country',
      indicator: 'Indicator',
      interestRate: 'Interest Rate',
      inflation: 'Inflation',
      unemployment: 'Unemployment',
      gdpGrowth: 'GDP Growth',
      
      // Analytics
      analytics: 'Analytics',
      riskMetrics: 'Risk Metrics',
      volatility: 'Volatility',
      sharpeRatio: 'Sharpe Ratio',
      maxDrawdown: 'Max Drawdown',
      diversification: 'Diversification',
      diversificationScore: 'Diversification Score',
      concentrationScore: 'Concentration Score',
      assetAllocation: 'Asset Allocation',
      performanceReport: 'Performance Report',
      recommendations: 'Recommendations',
      
      // Modals
      addAsset: 'Add Asset',
      removeAsset: 'Remove Asset',
      editAsset: 'Edit Asset',
      selectAsset: 'Select Asset',
      enterQuantity: 'Enter Quantity',
      enterPrice: 'Enter Price',
      purchaseDate: 'Purchase Date',
      notes: 'Notes',
      confirmRemove: 'Are you sure you want to remove?',
      
      // Asset Detail Page
      overview: 'Overview',
      charts: 'Charts',
      details: 'Details',
      relatedAssets: 'Related Assets',
      technicalAnalysis: 'Technical Analysis',
      fundamentalAnalysis: 'Fundamental Analysis',
    }
  },
  de: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      portfolio: 'Portfolio',
      watchlist: 'Beobachtungsliste',
      markets: 'Märkte',
      
      // Asset Types
      bist: 'BIST-Aktien',
      tefas: 'TEFAS-Fonds',
      crypto: 'Kryptowährungen',
      currency: 'Währungen',
      metal: 'Gold/Rohstoffe',
      macro: 'Makroökonomisch',
      
      // Common
      search: 'Suchen',
      filter: 'Filter',
      add: 'Hinzufügen',
      remove: 'Entfernen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      close: 'Schließen',
      loading: 'Wird geladen...',
      noData: 'Keine Daten gefunden',
      
      // Asset Details
      price: 'Preis',
      change: 'Änderung',
      volume: 'Volumen',
      marketCap: 'Marktkapitalisierung',
      lastUpdated: 'Zuletzt aktualisiert',
      addToWatchlist: 'Zur Beobachtungsliste hinzufügen',
      addToPortfolio: 'Zum Portfolio hinzufügen',
      
      // Portfolio
      totalValue: 'Gesamtwert',
      totalGainLoss: 'Gesamtgewinn/-verlust',
      holdings: 'Bestände',
      quantity: 'Menge',
      purchasePrice: 'Kaufpreis',
      currentPrice: 'Aktueller Preis',
      gainLoss: 'Gewinn/Verlust',
      
      // Time periods
      today: 'Heute',
      week: 'Woche',
      month: 'Monat',
      year: 'Jahr',
      all: 'Alle',
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: 'Tableau de bord',
      portfolio: 'Portefeuille',
      watchlist: 'Liste de surveillance',
      markets: 'Marchés',
      
      // Asset Types
      bist: 'Actions BIST',
      tefas: 'Fonds TEFAS',
      crypto: 'Cryptomonnaies',
      currency: 'Devises',
      metal: 'Or/Matières premières',
      macro: 'Macroéconomique',
      
      // Common
      search: 'Rechercher',
      filter: 'Filtrer',
      add: 'Ajouter',
      remove: 'Retirer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      close: 'Fermer',
      loading: 'Chargement...',
      noData: 'Aucune donnée trouvée',
      
      // Asset Details
      price: 'Prix',
      change: 'Changement',
      volume: 'Volume',
      marketCap: 'Capitalisation boursière',
      lastUpdated: 'Dernière mise à jour',
      addToWatchlist: 'Ajouter à la liste de surveillance',
      addToPortfolio: 'Ajouter au portefeuille',
      
      // Portfolio
      totalValue: 'Valeur totale',
      totalGainLoss: 'Gain/Perte total',
      holdings: 'Avoirs',
      quantity: 'Quantité',
      purchasePrice: 'Prix d\'achat',
      currentPrice: 'Prix actuel',
      gainLoss: 'Gain/Perte',
      
      // Time periods
      today: 'Aujourd\'hui',
      week: 'Semaine',
      month: 'Mois',
      year: 'Année',
      all: 'Tout',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
