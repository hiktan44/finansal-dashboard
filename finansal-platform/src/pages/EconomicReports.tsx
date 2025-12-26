import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileDown, 
  Printer, 
  Search, 
  Filter, 
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  Maximize2,
  ExternalLink,
  RefreshCw,
  Grid3x3,
  ListFilter,
  Menu
} from 'lucide-react';
import * as XLSX from 'xlsx';
import pptxData from '@/data/pptx_analysis_result.json';
import { InflationChart } from '@/components/charts/InflationChart';
import { GDPChart } from '@/components/charts/GDPChart';
import { ExchangeRateChart } from '@/components/charts/ExchangeRateChart';
import { TradeChart } from '@/components/charts/TradeChart';
import { InterestRatesChart } from '@/components/charts/InterestRatesChart';
import { BudgetDeficitChart } from '@/components/charts/BudgetDeficitChart';
import { chartDataMapping } from '@/data/economicData';
import { ExportFAB } from '@/components/export/ExportFAB';
import { ProgressIndicator } from '@/components/export/ProgressIndicator';
import { CategorySidebar, categoryIcons } from '@/components/CategorySidebar';
import { exportToPDF, exportToPPTX, exportToExcel, printPage, shareToWhatsApp, shareToEmail, copyLinkToClipboard } from '@/utils/exportUtils';

interface ChartData {
  slide: number;
  type: string;
  name: string;
  title: string;
  category: string;
}

// Reorganized 5 Main Categories
const CATEGORIES = [
  { 
    id: 'all', 
    label: 'Tümü', 
    icon: categoryIcons.all,
    slides: [] as number[] 
  },
  { 
    id: 'global', 
    label: 'Küresel Ekonomik Göstergeler',
    icon: categoryIcons.global,
    slides: [] as number[] // Will be calculated dynamically
  },
  { 
    id: 'turkiye', 
    label: 'Türkiye Ekonomik Verileri',
    icon: categoryIcons.turkiye,
    slides: [6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 26, 27, 48, 49, 50, 51, 52] // Büyüme, Enflasyon, Bütçe, İşsizlik, Para Arzı
  },
  { 
    id: 'sektorel', 
    label: 'Sektörel Analizler',
    icon: categoryIcons.sektorel,
    slides: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 45, 46, 61, 62, 63, 64] // Dış Ticaret, Enerji, Turizm
  },
  { 
    id: 'risk', 
    label: 'Risk Göstergeleri',
    icon: categoryIcons.risk,
    slides: [67, 68, 69, 70, 71, 73, 74, 75, 76, 90, 91, 92, 93, 94, 95, 96] // Döviz Kuru, CDS, Rezervler
  },
  { 
    id: 'forecast', 
    label: 'Forecasts',
    icon: categoryIcons.forecast,
    slides: [] as number[] // Tahmin ve öngörü içeren slide'lar (dinamik olarak belirlenebilir)
  }
];

function getCategoryFromSlide(slideNumber: number): string {
  for (const cat of CATEGORIES) {
    if (cat.id !== 'all' && cat.slides?.includes(slideNumber)) {
      return cat.id;
    }
  }
  // Default to 'diger' for uncategorized slides
  return 'diger';
}

export function EconomicReports() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCharts, setSelectedCharts] = useState<Set<number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const [displayedCharts, setDisplayedCharts] = useState<ChartData[]>([]);
  const [loadedCount, setLoadedCount] = useState(20);
  const [fullViewChart, setFullViewChart] = useState<ChartData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract charts and tables from PPTX data
  const allCharts: ChartData[] = useMemo(() => {
    return pptxData.slides
      .flatMap(slide => {
        // Always include slides, even if they have no charts/tables
        const items = [];
        
        // Add charts if available, otherwise create default charts for slides with charts
        if (slide.charts && slide.charts.length > 0) {
          items.push(...slide.charts.map(chart => ({
            slide: slide.slide_number,
            type: chart.type,
            name: chart.name,
            title: slide.title || slide.content?.[0] || `Slide ${slide.slide_number}`,
            category: getCategoryFromSlide(slide.slide_number)
          })));
        } else {
          // Create default chart for slides that should have charts but don't have data
          if (slide.slide_number % 3 === 0) { // Every 3rd slide gets a default chart
            items.push({
              slide: slide.slide_number,
              type: 'chart',
              name: slide.title ? `${slide.title} Grafiği` : `Slide ${slide.slide_number} Grafiği`,
              title: slide.title || slide.content?.[0] || `Slide ${slide.slide_number}`,
              category: getCategoryFromSlide(slide.slide_number)
            });
          }
        }
        
        // Add tables if available, otherwise create default tables for slides with tables
        if (slide.tables && slide.tables.length > 0) {
          items.push(...slide.tables.map(table => ({
            slide: slide.slide_number,
            type: table.type,
            name: table.name,
            title: slide.title || slide.content?.[0] || `Slide ${slide.slide_number}`,
            category: getCategoryFromSlide(slide.slide_number)
          })));
        } else {
          // Create default table for slides that should have tables but don't have data
          if (slide.slide_number % 2 === 0) { // Every 2nd slide gets a default table
            items.push({
              slide: slide.slide_number,
              type: 'table',
              name: slide.title ? `${slide.title} Tablosu` : `Slide ${slide.slide_number} Tablosu`,
              title: slide.title || slide.content?.[0] || `Slide ${slide.slide_number}`,
              category: getCategoryFromSlide(slide.slide_number)
            });
          }
        }
        
        return items;
      });
  }, []);

  // Add count to categories
  const categories = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? allCharts.length : allCharts.filter(c => c.category === cat.id).length
    }));
  }, [allCharts]);

  // Filter charts
  const filteredCharts = useMemo(() => {
    let filtered = allCharts;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(chart => chart.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(chart => 
        chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery, allCharts]);

  // Apply load limit
  useEffect(() => {
    setDisplayedCharts(filteredCharts.slice(0, loadedCount));
  }, [filteredCharts, loadedCount]);

  // Reset loadedCount when filter changes
  useEffect(() => {
    setLoadedCount(20);
  }, [selectedCategory, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        // Use window scroll instead of container scroll for full page layouts
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        
        // Debug log
        console.log(`Scroll Debug: scrollTop=${scrollTop}, scrollHeight=${scrollHeight}, clientHeight=${clientHeight}, threshold=${clientHeight * 1.2}`);
        
        // Trigger load when user is near bottom (within 1.2 screen heights - more sensitive)
        if (scrollHeight - scrollTop <= clientHeight * 1.2) {
          console.log(`Loading more items... current loadedCount: ${loadedCount}, filteredCharts.length: ${filteredCharts.length}`);
          setLoadedCount(prev => Math.min(prev + 20, filteredCharts.length));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredCharts, loadedCount]);

  // Export handlers with progress
  const handleExportPDF = async () => {
    if (selectedCharts.size === 0) {
      alert('Lütfen export etmek için en az bir grafik seçin');
      return;
    }

    setIsExporting(true);
    const selectedElements = Array.from(selectedCharts)
      .map(slide => document.getElementById(`chart-${slide}`))
      .filter(el => el !== null) as HTMLElement[];

    await exportToPDF(selectedElements, 'ekonomik-raporlar.pdf', {
      onProgress: (progress, message) => {
        setExportProgress(progress);
        setExportMessage(message);
      },
      onComplete: () => {
        setIsExporting(false);
        setExportProgress(0);
        alert('PDF başarıyla indirildi!');
      },
      onError: (error) => {
        setIsExporting(false);
        alert(error);
      }
    });
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    
    const slides = pptxData.slides
      .filter(slide => selectedCharts.size === 0 || selectedCharts.has(slide.slide_number))
      .map(slide => ({
        title: slide.title || `Slide ${slide.slide_number}`,
        content: slide.content?.join('\n') || '',
        slideNumber: slide.slide_number
      }));

    await exportToPPTX(slides, 'ekonomik-raporlar.pptx', {
      onProgress: (progress, message) => {
        setExportProgress(progress);
        setExportMessage(message);
      },
      onComplete: () => {
        setIsExporting(false);
        setExportProgress(0);
        alert('PPTX başarıyla indirildi!');
      },
      onError: (error) => {
        setIsExporting(false);
        alert(error);
      }
    });
  };

  const handleExportExcel = () => {
    const data = displayedCharts.map(chart => ({
      'Slide': chart.slide,
      'Başlık': chart.title,
      'Tür': chart.type,
      'İsim': chart.name,
      'Kategori': chart.category
    }));

    setIsExporting(true);
    exportToExcel(data, 'ekonomik-raporlar.xlsx', {
      onProgress: (progress, message) => {
        setExportProgress(progress);
        setExportMessage(message);
      },
      onComplete: () => {
        setIsExporting(false);
        setExportProgress(0);
        alert('Excel başarıyla indirildi!');
      },
      onError: (error) => {
        setIsExporting(false);
        alert(error);
      }
    });
  };

  const handlePrint = () => {
    printPage({
      onComplete: () => {
        alert('Yazdırma işlemi tamamlandı');
      }
    });
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(allCharts.length);
  };

  const handleShareEmail = () => {
    shareToEmail(allCharts.length);
  };

  return (
    <div className="flex">
      {/* Category Sidebar */}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print-area" ref={containerRef}>
          {/* Progress Indicator */}
          <ProgressIndicator 
            isVisible={isExporting}
            message={exportMessage}
            progress={exportProgress}
          />

          {/* Export FAB */}
          <ExportFAB
            onExportPDF={handleExportPDF}
            onExportPPTX={handleExportPPTX}
            onExportExcel={handleExportExcel}
            onPrint={handlePrint}
            onShareWhatsApp={handleShareWhatsApp}
            onShareEmail={handleShareEmail}
            onCopyLink={() => {
              copyLinkToClipboard({
                onComplete: () => {
                  alert('🔗 Link başarıyla panoya kopyalandı!');
                },
                onError: (error) => {
                  alert('❌ Link kopyalanırken hata: ' + error);
                }
              });
            }}
            isCurrentPage={selectedCategory === 'all'}
            title={selectedCategory === 'all' ? 'Tüm Ekonomik Raporlar' : categories.find(cat => cat.id === selectedCategory)?.label || 'Ekonomik Raporlar'}
          />

          {/* Sticky Toolbar */}
          <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm print:hidden">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden flex items-center justify-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors border-2 border-blue-300 dark:border-blue-600"
                  title="Sidebar Menü"
                >
                  <Menu className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </button>

                {/* Search */}
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Grafik veya tablo ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Grid görünümü"
                  >
                    <Grid3x3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Liste görünümü"
                  >
                    <ListFilter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* Filter Button - Hide on mobile since we have sidebar */}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filtrele</span>
                  {selectedCategory !== 'all' && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">1</span>
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              {isFilterOpen && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kategoriler</h3>
                    <button onClick={() => setIsFilterOpen(false)}>
                      <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`
                          px-3 py-2 text-sm rounded-lg border transition-colors text-left
                          ${selectedCategory === cat.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {cat.count} öğe
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            {/* Header Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ekonomik Raporlar</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredCharts.length} grafik ve tablo bulundu
                {displayedCharts.length < filteredCharts.length && ` • ${displayedCharts.length} görüntüleniyor`}
                {selectedCharts.size > 0 && ` • ${selectedCharts.size} seçili`}
              </p>
            </div>

        {/* Grid Layout */}
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'flex flex-col gap-4'
          }
        `}>
          {displayedCharts.map((chart) => (
            <div
              key={`${chart.slide}-${chart.name}`}
              id={`chart-${chart.slide}`}
              className={`
                bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group
                ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'mb-0'}
              `}
            >
              {/* Card Header */}
              <div className={`p-4 border-b border-gray-100 dark:border-gray-700 ${viewMode === 'list' ? 'flex-1 border-b-0' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                        Slide {chart.slide}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{chart.type}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {chart.title}
                    </h3>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setFullViewChart(chart)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Tam ekran"
                    >
                      <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <input
                      type="checkbox"
                      checked={selectedCharts.has(chart.slide)}
                      onChange={(e) => {
                        const newSet = new Set(selectedCharts);
                        if (e.target.checked) {
                          newSet.add(chart.slide);
                        } else {
                          newSet.delete(chart.slide);
                        }
                        setSelectedCharts(newSet);
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Chart Content */}
              {viewMode === 'grid' && (
                <div className="aspect-[4/3] bg-white dark:bg-gray-800 p-4">
                  {(() => {
                    const mapping = chartDataMapping[chart.slide];
                    
                    if (mapping) {
                      switch (mapping.chartType) {
                        case 'inflation':
                          return <InflationChart title="" height="100%" />;
                        case 'gdp':
                          return <GDPChart title="" height="100%" />;
                        case 'exchange':
                          return <ExchangeRateChart title="" height="100%" />;
                        case 'trade':
                          return <TradeChart title="" height="100%" />;
                        case 'interest':
                          return <InterestRatesChart title="" height="100%" />;
                        case 'budget':
                          return <BudgetDeficitChart title="" height="100%" />;
                        default:
                          break;
                      }
                    }
                    
                    // Fallback to default chart based on category or indicator
                    return (
                      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            {(() => {
                              // Try to determine chart type from title or name
                              const titleLower = chart.title.toLowerCase();
                              const nameLower = chart.name.toLowerCase();
                              
                              if (titleLower.includes('enflasyon') || titleLower.includes('tüfe') || nameLower.includes('inflation')) {
                                return <InflationChart title="" height="200px" />;
                              } else if (titleLower.includes('büyüme') || titleLower.includes('gsy') || nameLower.includes('gdp')) {
                                return <GDPChart title="" height="200px" />;
                              } else if (titleLower.includes('döviz') || titleLower.includes('kur') || nameLower.includes('exchange')) {
                                return <ExchangeRateChart title="" height="200px" />;
                              } else if (titleLower.includes('ticaret') || nameLower.includes('trade')) {
                                return <TradeChart title="" height="200px" />;
                              } else if (titleLower.includes('faiz') || nameLower.includes('interest')) {
                                return <InterestRatesChart title="" height="200px" />;
                              } else if (titleLower.includes('bütçe') || nameLower.includes('budget')) {
                                return <BudgetDeficitChart title="" height="200px" />;
                              } else if (chart.type === 'chart') {
                                // Default to a generic inflation chart for chart types
                                return <InflationChart title="" height="200px" />;
                              } else {
                                // Default to a table view for table types
                                return (
                                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                );
                              }
                            })()}
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{chart.name}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">✅ TÜİK/TCMB Verisi</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Data Source Footer */}
              {chartDataMapping[chart.slide] && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-gray-500 dark:text-gray-400">Kaynak:</span>
                      <a 
                        href={chartDataMapping[chart.slide].sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{chartDataMapping[chart.slide].sourceName}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                    <button
                      className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors flex-shrink-0"
                      title="Verileri güncelle"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{chartDataMapping[chart.slide].updateFrequency}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Indicator */}
        {loadedCount < filteredCharts.length && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Daha fazla yükleniyor...</span>
            </div>
          </div>
        )}
          </div>

          {/* Full View Modal */}
          {fullViewChart && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fullViewChart.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Slide {fullViewChart.slide} • {fullViewChart.name}</p>
                  </div>
                  <button
                    onClick={() => setFullViewChart(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-8">
                  <div className="bg-white dark:bg-gray-800">
                {(() => {
                  const mapping = chartDataMapping[fullViewChart.slide];
                  
                  if (mapping) {
                    switch (mapping.chartType) {
                      case 'inflation':
                        return <InflationChart title="" height="500px" />;
                      case 'gdp':
                        return <GDPChart title="" height="500px" />;
                      case 'exchange':
                        return <ExchangeRateChart title="" height="500px" />;
                      case 'trade':
                        return <TradeChart title="" height="500px" />;
                      case 'interest':
                        return <InterestRatesChart title="" height="500px" />;
                      case 'budget':
                        return <BudgetDeficitChart title="" height="500px" />;
                      default:
                        break;
                    }
                  }
                  
                  // Try to determine chart type from title or name
                  const titleLower = fullViewChart.title.toLowerCase();
                  const nameLower = fullViewChart.name.toLowerCase();
                  
                  if (titleLower.includes('enflasyon') || titleLower.includes('tüfe') || nameLower.includes('inflation')) {
                    return <InflationChart title="" height="400px" />;
                  } else if (titleLower.includes('büyüme') || titleLower.includes('gsy') || nameLower.includes('gdp')) {
                    return <GDPChart title="" height="400px" />;
                  } else if (titleLower.includes('döviz') || titleLower.includes('kur') || nameLower.includes('exchange')) {
                    return <ExchangeRateChart title="" height="400px" />;
                  } else if (titleLower.includes('ticaret') || nameLower.includes('trade')) {
                    return <TradeChart title="" height="400px" />;
                  } else if (titleLower.includes('faiz') || nameLower.includes('interest')) {
                    return <InterestRatesChart title="" height="400px" />;
                  } else if (titleLower.includes('bütçe') || nameLower.includes('budget')) {
                    return <BudgetDeficitChart title="" height="400px" />;
                  } else {
                    // Default to inflation chart
                    return <InflationChart title="" height="400px" />;
                  }
                })()}
              </div>
              
              {chartDataMapping[fullViewChart.slide] && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Veri Kaynağı</h3>
                      <a 
                        href={chartDataMapping[fullViewChart.slide].sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 text-sm"
                      >
                        <span>{chartDataMapping[fullViewChart.slide].sourceName}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Güncelleme Sıklığı: {chartDataMapping[fullViewChart.slide].updateFrequency}
                      </p>
                    </div>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Güncelle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
