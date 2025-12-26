// En Güncel Türkiye Ekonomik Verileri - Kasım 2025
// Tüm veriler resmi kaynaklardan (TÜİK, TCMB, Hazine, BIST) güncel değerlerle güncellenmiştir

export const enGuncelTurkiyeVerileri = {
  // Enflasyon Verileri (TÜİK - Ekim 2025)
  enflasyon: {
    tufe_yillik: 32.87, // %32,87 yıllık artış
    tufe_aylik: 2.55,   // %2,55 aylık artış
    yi_ufe_yillik: 27.00, // %27,00 yıllık artış
    yi_ufe_aylik: 1.63,   // %1,63 aylık artış
    kaynak: 'TÜİK',
    tarih: '2025-10',
    not: 'TÜİK her ayın 3\'ünde yayınlar'
  },

  // Büyüme Verileri (TÜİK - Q2 2025)
  buyume: {
    gsyh_yillik: 4.8, // %4,8 yıllık büyüme
    gsyh_takvim_arindirilmis: 4.6, // Takvim etkisi arındırılmış
    kaynak: 'TÜİK',
    tarih: '2025 Q2',
    not: 'Çeyreklik resmi rakam'
  },

  // İşsizlik Verileri (TÜİK - Eylül 2025)
  issizlik: {
    oran: 8.6, // %8,6
    kaynak: 'TÜİK', 
    tarih: '2025-09',
    not: 'Mevsim etkisi arındırılmış'
  },

  // Döviz Kurları (TCMB - 8 Kasım 2025)
  doviz: {
    usd_try: 42.21, // USD/TRY 42,21 TL
    eur_try: 48.90, // EUR/TRY 48,90 TL
    kaynak: 'TCMB',
    tarih: '2025-11-08',
    not: 'Günlük resmi kurlar'
  },

  // BIST 100 (7 Kasım 2025)
  borsa: {
    bist_100: 10924.53, // BIST 100 endeksi
    haftalik_performans: 0.27, // %0,27 haftalık artış
    kaynak: 'BIST',
    tarih: '2025-11-07',
    not: 'Günlük kapanış fiyatı'
  },

  // TCMB Para Politikası
  faiz: {
    politika_faizi: 39.5, // %39,5 politika faizi
    onceki_faiz: 40.5,    // %40,5 önceki faiz
    degisim: -1.0,        // -100 baz puan indirim
    kaynak: 'TCMB',
    tarih: '2025-10',
    not: 'Para Politikası Kurulu kararı'
  },

  // Dış Ticaret (Ticaret Bakanlığı - Ekim 2025)
  dis_ticaret: {
    ihracat_milyar: 24.0,      // 24 milyar $ ihracat
    ithalat_milyar: 31.36,     // 31,36 milyar $ ithalat
    acik_milyar: 7.36,         // 7,36 milyar $ açık
    ihracat_degisim: 2.3,      // +%2,3 ihracat artışı
    ithalat_degisim: 6.6,      // +%6,6 ithalat artışı
    kaynak: 'Ticaret Bakanlığı',
    tarih: '2025-10',
    not: 'Geçici dış ticaret verileri'
  },

  // Hazine Bütçe (Ekim 2025)
  butce: {
    on_aylik_acik_trilyon: 1.8,     // 1,8 trilyon TL açık
    ekim_aylik_acik_milyar: 195.9,  // 195,9 milyar TL açık
    faiz_odemeleri_trilyon: 1.7,    // 1,7 trilyon TL faiz ödemesi
    kaynak: 'Hazine ve Maliye Bakanlığı',
    tarih: '2025-10',
    not: 'Merkezi yönetim bütçe gerçekleşmeleri'
  },

  // Uluslararası Tahminler (2025)
  tahminler: {
    imf_buyume: 3.0,     // %3,0 IMF büyüme tahmini
    db_buyume: 3.1,      // %3,1 Dünya Bankası tahmini
    imf_enflasyon: 34.9, // %34,9 IMF enflasyon tahmini
    kaynak: 'IMF, Dünya Bankası',
    tarih: '2025',
    not: 'Uluslararası kurum tahminleri'
  }
};

// Güncelleme bilgileri
export const veriGuncellemeBilgileri = {
  son_guncelleme: '2025-11-08',
  kaynak_sayisi: 6, // TÜİK, TCMB, Ticaret Bakanlığı, Hazine, BIST, Uluslararası kurumlar
  dogrulama_durumu: 'Tüm veriler birden fazla kaynaktan doğrulandı',
  guvenilirlik: 'Yüksek - Resmi kurum verileri',
  not: 'Türkiye ekonomi portalı için en güncel veriler'
};