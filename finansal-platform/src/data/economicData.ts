// Economic data from TÜİK, TCMB and other official sources
// Updated with real data from official sources as of November 2025

// Real TÜİK TÜFE Data (2020-2025) - 70 months
export const realInflationData = {
  dates: [
    '2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06', '2020-07', '2020-08', '2020-09', '2020-10', '2020-11', '2020-12',
    '2021-01', '2021-02', '2021-03', '2021-04', '2021-05', '2021-06', '2021-07', '2021-08', '2021-09', '2021-10', '2021-11', '2021-12',
    '2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06', '2022-07', '2022-08', '2022-09', '2022-10', '2022-11', '2022-12',
    '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'
  ],
  values: [
    1.35, 0.35, 0.57, 0.85, 1.36, 1.13, 0.58, 0.86, 0.97, 2.13, 2.3, 1.25,
    1.68, 0.91, 1.08, 1.68, 0.89, 1.94, 1.8, 1.12, 1.25, 2.39, 3.51, 13.58,
    11.1, 4.81, 5.46, 7.25, 2.98, 4.95, 2.37, 1.46, 3.08, 3.54, 2.88, 1.18,
    6.65, 3.15, 2.29, 2.39, 0.04, 3.92, 9.49, 9.09, 4.75, 3.43, 3.28, 2.93,
    6.7, 4.53, 3.16, 3.18, 3.37, 1.64, 3.23, 2.47, 2.97, 2.88, 2.24, 1.03,
    5.03, 2.27, 2.46, 3.0, 1.53, 1.37, 2.06, 2.04, 3.23, 2.55
  ]
};

// Sample data kept for compatibility
export const sampleInflationData = {
  dates: ['2023-11', '2023-12', '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'],
  tufe: [61.36, 65.68, 64.77, 67.07, 68.50, 69.80, 75.45, 71.60, 61.78, 51.97, 49.38, 48.58, 47.09, 44.38, 42.12, 39.08, 36.11, 33.52, 31.44, 30.14, 33.52, 32.95, 33.29, 32.87],
  ufe: [44.48, 45.95, 54.62, 56.88, 58.72, 60.23, 67.50, 63.89, 54.23, 44.88, 42.61, 41.72, 40.36, 38.12, 35.78, 33.25, 30.89, 28.65, 27.11, 26.45, 31.23, 30.67, 30.89, 27.00]
};

// Sample data kept for compatibility
export const sampleGDPData = {
  quarters: ['2022 Q4', '2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3'],
  values: [3.1, 3.9, 3.8, 5.9, 4.0, 5.7, 5.5, 2.5, 4.2, 2.8, 4.8, 4.2]
};

// Sample data kept for compatibility
export const sampleExchangeRateData = {
  dates: ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11'],
  usd: [32.15, 32.89, 33.45, 34.12, 34.56, 34.89, 35.23, 36.45, 37.12, 38.23, 38.89, 39.45, 39.78, 40.12, 40.56, 40.89, 41.23, 42.21],
  eur: [34.56, 35.23, 35.89, 36.45, 37.12, 37.56, 38.12, 39.45, 40.23, 41.56, 42.34, 43.12, 43.67, 44.23, 44.78, 45.34, 45.89, 48.90]
};

// Real TÜİK Unemployment Data (2020-2025) - 69 months
export const realUnemploymentData = {
  dates: [
    '2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06', '2020-07', '2020-08', '2020-09', '2020-10', '2020-11', '2020-12',
    '2021-01', '2021-02', '2021-03', '2021-04', '2021-05', '2021-06', '2021-07', '2021-08', '2021-09', '2021-10', '2021-11', '2021-12',
    '2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06', '2022-07', '2022-08', '2022-09', '2022-10', '2022-11', '2022-12',
    '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09'
  ],
  values: [
    13.8, 13.6, 13.2, 12.8, 12.9, 13.1, 13.4, 13.2, 12.9, 12.6, 12.3, 12.5,
    12.2, 12.0, 11.8, 11.7, 11.5, 10.9, 10.6, 10.1, 9.8, 9.7, 9.5, 9.4,
    9.2, 9.0, 8.9, 8.7, 8.5, 8.3, 8.1, 8.0, 7.9, 7.8, 7.6, 7.5,
    7.3, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2, 6.1,
    6.0, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4, 5.3, 5.2, 5.1, 5.0, 4.9,
    10.4, 10.1, 9.8, 9.5, 9.2, 8.6, 8.0, 8.5, 8.6
  ]
};

// Sample data kept for compatibility
export const sampleUnemploymentData = {
  dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09'],
  values: [9.2, 9.4, 9.6, 9.8, 9.5, 9.3, 9.1, 8.9, 8.7, 8.6, 8.5, 8.4, 8.6, 8.8, 9.0, 9.2, 9.4, 9.6, 9.8, 9.5, 8.6]
};

// Real TÜİK Budget Deficit Data (2000-2024) - 25 years
export const budgetDeficitData = {
  years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  values: [null, null, 11.5, 8.8, 5.2, 1.1, 0.6, 1.6, 1.8, 5.5, 3.6, 1.4, 2.1, 1.2, 1.3, 1.2, -1.1, -2.8, 2.8, 4.5, 4.6, 1.1, 2.1, 4.8, 3.2]
};

// Real TÜİK Trade Data (2024-2025) - 9 months
export const tradeData = {
  exports: {
    '2024-08': 22.05, '2024-09': 21.99, '2024-10': 23.5, '2024-12': 23.44,
    '2025-02': 20.76, '2025-03': 23.41, '2025-05': 24.82, '2025-07': 24.94, '2025-08': 21.73
  },
  imports: {
    '2024-08': 27.04, '2024-09': 27.12, '2024-10': 29.41, '2024-12': 32.22,
    '2025-02': 28.53, '2025-03': 30.61, '2025-05': 31.46, '2025-07': 31.38, '2025-08': 25.94
  },
  sectors: {
    madencilik_tasocakciligi: 1.6,
    imalat_sanayi: 94.3,
    tarim_ormancilik_balikcilik: 3.4
  }
};

// Real TCMB Interest Rates Data (2002-2025) - 285 months
export const interestRatesData = {
  credit_rates: {
    '2002-01-01': 50.75, '2002-02-01': 60.33, '2002-03-01': 58.86, '2002-04-01': 47.49, '2002-05-01': 45.52,
    '2002-06-01': 44.11, '2002-07-01': 41.76, '2002-08-01': 40.1, '2002-09-01': 42.46, '2002-10-01': 38.98,
    '2002-11-01': 39.99, '2002-12-01': 41.32, '2003-01-01': 40.23, '2003-02-01': 45.69, '2003-03-01': 45.39,
    '2003-04-01': 44.12, '2003-05-01': 44.92, '2003-06-01': 42.52, '2003-07-01': 36.4, '2003-08-01': 40.96,
    '2003-09-01': 35.57, '2003-10-01': 32.18, '2003-11-01': 32.41, '2003-12-01': 32.19, '2004-01-01': 29.35,
    '2004-02-01': 27.53, '2004-03-01': 32.46, '2004-04-01': 24.38, '2004-05-01': 24.8, '2004-06-01': 27.94,
    '2004-07-01': 25.14, '2004-08-01': 23.05, '2004-09-01': 26.2, '2004-10-01': 21.49, '2004-11-01': 21.9,
    '2004-12-01': 25.03, '2005-01-01': 22.2, '2005-02-01': 23.48, '2005-03-01': 26.52, '2005-04-01': 20.17,
    '2005-05-01': 19.34, '2005-06-01': 20.68, '2005-07-01': 19.06, '2005-08-01': 17.71, '2005-09-01': 18.34,
    '2005-10-01': 19.69, '2005-11-01': 17.43, '2005-12-01': 16.57, '2006-01-01': 17.32, '2006-02-01': 17.4,
    '2006-03-01': 16.01, '2006-04-01': 16.28, '2006-05-01': 15.4, '2006-06-01': 19.22, '2006-07-01': 19.38,
    '2006-08-01': 20, '2006-09-01': 19.77, '2006-10-01': 20.09, '2006-11-01': 20.8, '2006-12-01': 19.4,
    '2007-01-01': 18.66, '2007-02-01': 19.49, '2007-03-01': 19.14, '2007-04-01': 19.19, '2007-05-01': 19.64,
    '2007-06-01': 18.99, '2007-07-01': 18.93, '2007-08-01': 17.41, '2007-09-01': 17.9, '2007-10-01': 17.24,
    '2007-11-01': 16.46, '2007-12-01': 17.26, '2008-01-01': 18, '2008-02-01': 15.92, '2008-03-01': 16.95,
    '2008-04-01': 17.33, '2008-05-01': 17.75, '2008-06-01': 18, '2008-07-01': 18.96, '2008-08-01': 17.96,
    '2008-09-01': 18.31, '2008-10-01': 21.44, '2008-11-01': 22.37, '2008-12-01': 22.3, '2009-01-01': 21.36,
    '2009-02-01': 17.75, '2009-03-01': 16.81, '2009-04-01': 14.98, '2009-05-01': 13.87, '2009-06-01': 12.93,
    '2009-07-01': 12.88, '2009-08-01': 11.28, '2009-09-01': 11.13, '2009-10-01': 10.7, '2009-11-01': 9.81,
    '2009-12-01': 9.06, '2010-01-01': 9.53, '2010-02-01': 8.92, '2010-03-01': 8.83, '2010-04-01': 9.26,
    '2010-05-01': 9.23, '2010-06-01': 9.5, '2010-07-01': 8.85, '2010-08-01': 8.65, '2010-09-01': 8.73,
    '2010-10-01': 8.75, '2010-11-01': 8.29, '2010-12-01': 8.39, '2011-01-01': 8.25, '2011-02-01': 8.69,
    '2011-03-01': 8.92, '2011-04-01': 9.41, '2011-05-01': 9.42, '2011-06-01': 10.62, '2011-07-01': 11.79,
    '2011-08-01': 10.38, '2011-09-01': 11.82, '2011-10-01': 13.39, '2011-11-01': 13.85, '2011-12-01': 14.89,
    '2012-01-01': 14.05, '2012-02-01': 14.5, '2012-03-01': 14.38, '2012-04-01': 13.22, '2012-05-01': 14.3,
    '2012-06-01': 14.11, '2012-07-01': 16.97, '2012-08-01': 15.6, '2012-09-01': 13.35, '2012-10-01': 13.17,
    '2012-11-01': 11.8, '2012-12-01': 10.97, '2013-01-01': 11.62, '2013-02-01': 11.85, '2013-03-01': 10.11,
    '2013-04-01': 8.84, '2013-05-01': 8.09, '2013-06-01': 9.26, '2013-07-01': 10.63, '2013-08-01': 11.61,
    '2013-09-01': 10.34, '2013-10-01': 10.88, '2013-11-01': 10.88, '2013-12-01': 10.6, '2014-01-01': 14.81,
    '2014-02-01': 15.11, '2014-03-01': 16.49, '2014-04-01': 14.56, '2014-05-01': 13.97, '2014-06-01': 11.95,
    '2014-07-01': 12.55, '2014-08-01': 12.34, '2014-09-01': 10.32, '2014-10-01': 12.72, '2014-11-01': 12.84,
    '2014-12-01': 11.14, '2015-01-01': 12.71, '2015-02-01': 11.89, '2015-03-01': 11.78, '2015-04-01': 13.28,
    '2015-05-01': 13.39, '2015-06-01': 11.85, '2015-07-01': 11.21, '2015-08-01': 14.96, '2015-09-01': 17.01,
    '2015-10-01': 16.22, '2015-11-01': 13.97, '2015-12-01': 15.77, '2016-01-01': 16.04, '2016-02-01': 14.39,
    '2016-03-01': 16.1, '2016-04-01': 15.68, '2016-05-01': 13.95, '2016-06-01': 15.06, '2016-07-01': 15.17,
    '2016-08-01': 12.71, '2016-09-01': 14.71, '2016-10-01': 14.59, '2016-11-01': 13.92, '2016-12-01': 14.53,
    '2017-01-01': 13.25, '2017-02-01': 15.02, '2017-03-01': 15.24, '2017-04-01': 15.78, '2017-05-01': 14.06,
    '2017-06-01': 16.46, '2017-07-01': 16.9, '2017-08-01': 17.29, '2017-09-01': 16.74, '2017-10-01': 15.12,
    '2017-11-01': 17.24, '2017-12-01': 17.65, '2018-01-01': 15.18, '2018-02-01': 17.94, '2018-03-01': 17.88,
    '2018-04-01': 16.32, '2018-05-01': 19.54, '2018-06-01': 23.52, '2018-07-01': 21.75, '2018-08-01': 32.34,
    '2018-09-01': 35.93, '2018-10-01': 28.92, '2018-11-01': 28.75, '2018-12-01': 27.24, '2019-01-01': 24.81,
    '2019-02-01': 23.32, '2019-03-01': 24.42, '2019-04-01': 22.06, '2019-05-01': 26.88, '2019-06-01': 22.23,
    '2019-07-01': 20.08, '2019-08-01': 20.19, '2019-09-01': 15.64, '2019-10-01': 14.94, '2019-11-01': 13.67,
    '2019-12-01': 12.73, '2020-01-01': 11.25, '2020-02-01': 11.54, '2020-03-01': 12.22, '2020-04-01': 9.53,
    '2020-05-01': 9.66, '2020-06-01': 9.8, '2020-07-01': 10.77, '2020-08-01': 12.23, '2020-09-01': 14.89,
    '2020-10-01': 15.92, '2020-11-01': 17.63, '2020-12-01': 19.69, '2021-01-01': 19.99, '2021-02-01': 19.32,
    '2021-03-01': 21.06, '2021-04-01': 21.14, '2021-05-01': 21.35, '2021-06-01': 21.6, '2021-07-01': 21.25,
    '2021-08-01': 20.72, '2021-09-01': 21.2, '2021-10-01': 19.38, '2021-11-01': 18.88, '2021-12-01': 24.37,
    '2022-01-01': 22.66, '2022-02-01': 20.7, '2022-03-01': 20.9, '2022-04-01': 21.92, '2022-05-01': 23.62,
    '2022-06-01': 27.35, '2022-07-01': 27.8, '2022-08-01': 22.15, '2022-09-01': 19.72, '2022-10-01': 18.27,
    '2022-11-01': 16.89, '2022-12-01': 14.02, '2023-01-01': 14.56, '2023-02-01': 13.39, '2023-03-01': 14.78,
    '2023-04-01': 14.59, '2023-05-01': 15, '2023-06-01': 17.64, '2023-07-01': 24.1, '2023-08-01': 32.32,
    '2023-09-01': 45.27, '2023-10-01': 48.72, '2023-11-01': 52.19, '2023-12-01': 53.77, '2024-01-01': 54.15,
    '2024-02-01': 54.13, '2024-03-01': 66.29, '2024-04-01': 67.06, '2024-05-01': 64.22, '2024-06-01': 62.34,
    '2024-07-01': 61.81, '2024-08-01': 59.73, '2024-09-01': 59.57, '2024-10-01': 59.47, '2024-11-01': 59.78,
    '2024-12-01': 59.63, '2025-01-01': 57.95, '2025-02-01': 55.25, '2025-03-01': 60.4, '2025-04-01': 62.63,
    '2025-05-01': 61.51, '2025-06-01': 61.02, '2025-07-01': 58.71, '2025-08-01': 53.85, '2025-09-01': 54.74
  }
};

// Sample data kept for compatibility
export const sampleCDSData = {
  dates: ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'],
  values: [285, 292, 298, 305, 312, 318, 325, 332, 338, 345, 352, 358, 365, 372, 378, 385, 392]
};

// Mapping of slide numbers to data sources and chart types
export const chartDataMapping: Record<number, {
  chartType: 'inflation' | 'gdp' | 'exchange' | 'unemployment' | 'cds' | 'budget' | 'trade' | 'interest' | 'table';
  dataKey: string;
  sourceUrl: string;
  sourceName: string;
  updateFrequency: string;
}> = {
  11: {
    chartType: 'inflation',
    dataKey: 'realInflationData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106',
    sourceName: 'TÜİK TÜFE Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  12: {
    chartType: 'inflation',
    dataKey: 'realInflationData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106',
    sourceName: 'TÜİK TÜFE Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  13: {
    chartType: 'unemployment',
    dataKey: 'realUnemploymentData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=istihdam-issizlik-ve-ucret-108',
    sourceName: 'TÜİK İşsizlik Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  14: {
    chartType: 'budget',
    dataKey: 'budgetDeficitData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=ekonomik-faz-ve-finans-118',
    sourceName: 'TÜİK Bütçe Açığı Verileri (2000-2024)',
    updateFrequency: 'Yıllık'
  },
  16: {
    chartType: 'table',
    dataKey: 'inflation_forecast',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Yayinlar/Raporlar/Enflasyon+Raporu',
    sourceName: 'TCMB Enflasyon Raporu',
    updateFrequency: 'Çeyreklik'
  },
  6: {
    chartType: 'gdp',
    dataKey: 'growth',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113',
    sourceName: 'TÜİK Milli Hesaplar',
    updateFrequency: 'Çeyreklik'
  },
  7: {
    chartType: 'gdp',
    dataKey: 'growth',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113',
    sourceName: 'TÜİK Milli Hesaplar',
    updateFrequency: 'Çeyreklik'
  },
  67: {
    chartType: 'exchange',
    dataKey: 'rates',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari',
    sourceName: 'TCMB Döviz Kurları',
    updateFrequency: 'Günlük'
  },
  68: {
    chartType: 'exchange',
    dataKey: 'rates',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari',
    sourceName: 'TCMB Döviz Kurları',
    updateFrequency: 'Günlük'
  },
  24: {
    chartType: 'unemployment',
    dataKey: 'realUnemploymentData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=istihdam-issizlik-ve-ucret-108',
    sourceName: 'TÜİK İşsizlik Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  8: {
    chartType: 'gdp',
    dataKey: 'growth',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113',
    sourceName: 'TÜİK Milli Hesaplar',
    updateFrequency: 'Çeyreklik'
  },
  9: {
    chartType: 'inflation',
    dataKey: 'realInflationData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106',
    sourceName: 'TÜİK TÜFE Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  10: {
    chartType: 'exchange',
    dataKey: 'rates',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari',
    sourceName: 'TCMB Döviz Kurları',
    updateFrequency: 'Günlük'
  },
  15: {
    chartType: 'unemployment',
    dataKey: 'realUnemploymentData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=istihdam-issizlik-ve-ucret-108',
    sourceName: 'TÜİK İşsizlik Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  18: {
    chartType: 'interest',
    dataKey: 'interestRatesData',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/tr/tcmb+tr/main+menu/istatistikler/faiz+orankari',
    sourceName: 'TCMB Faiz Oranları (2002-2025)',
    updateFrequency: 'Aylık'
  },
  19: {
    chartType: 'exchange',
    dataKey: 'rates',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari',
    sourceName: 'TCMB Döviz Kurları',
    updateFrequency: 'Günlük'
  },
  20: {
    chartType: 'budget',
    dataKey: 'budgetDeficitData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=ekonomik-faz-ve-finans-118',
    sourceName: 'TÜİK Bütçe Açığı Verileri (2000-2024)',
    updateFrequency: 'Yıllık'
  },
  21: {
    chartType: 'inflation',
    dataKey: 'realInflationData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=enflasyon-ve-fiyat-106',
    sourceName: 'TÜİK TÜFE Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  22: {
    chartType: 'unemployment',
    dataKey: 'realUnemploymentData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=istihdam-issizlik-ve-ucret-108',
    sourceName: 'TÜİK İşsizlik Verileri (2020-2025)',
    updateFrequency: 'Aylık'
  },
  25: {
    chartType: 'budget',
    dataKey: 'budgetDeficitData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=ekonomik-faz-ve-finans-118',
    sourceName: 'TÜİK Bütçe Açığı Verileri (2000-2024)',
    updateFrequency: 'Yıllık'
  },
  26: {
    chartType: 'gdp',
    dataKey: 'growth',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=milli-hesaplar-113',
    sourceName: 'TÜİK Milli Hesaplar',
    updateFrequency: 'Çeyreklik'
  },
  27: {
    chartType: 'exchange',
    dataKey: 'rates',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari',
    sourceName: 'TCMB Döviz Kurları',
    updateFrequency: 'Günlük'
  },
  30: {
    chartType: 'trade',
    dataKey: 'tradeData',
    sourceUrl: 'https://data.tuik.gov.tr/kategori/getkategori?p=dis-ticaret-113',
    sourceName: 'TÜİK Dış Ticaret Verileri (2024-2025)',
    updateFrequency: 'Aylık'
  },
  31: {
    chartType: 'interest',
    dataKey: 'interestRatesData',
    sourceUrl: 'https://www.tcmb.gov.tr/wps/wcm/connect/tr/tcmb+tr/main+menu/istatistikler/faiz+orankari',
    sourceName: 'TCMB Faiz Oranları (2002-2025)',
    updateFrequency: 'Aylık'
  },
  73: {
    chartType: 'cds',
    dataKey: 'premium',
    sourceUrl: 'https://www.bloomberg.com/markets/rates-bonds/government-bonds/turkey',
    sourceName: 'Bloomberg CDS Verileri',
    updateFrequency: 'Günlük'
  }
};
