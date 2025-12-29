import { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ExternalLink, 
  Calendar, 
  Clock,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Globe,
  Zap,
  Banknote,
  Plane,
  TrendingDown,
  Shield,
  PiggyBank,
  Target,
  AlertCircle
} from 'lucide-react';
import { analysisSections, getUpdateFrequencyColor, type AnalysisSection } from '@/data/analysisContent';

const iconMap: Record<string, any> = {
  TrendingUp, Activity, DollarSign, Users, Globe, Zap, Banknote, 
  Plane, TrendingDown, Shield, PiggyBank, Target
};

export function CurrentAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['growth']));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Kategoriler
  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'indicators', label: 'Göstergeler' },
    { id: 'forecasts', label: 'Öngörüler' },
    { id: 'markets', label: 'Piyasalar' }
  ];

  // Kategori mapping
  const categoryMapping: Record<string, string> = {
    'growth': 'indicators',
    'inflation': 'indicators',
    'budget': 'indicators',
    'unemployment': 'indicators',
    'foreign-trade': 'indicators',
    'energy': 'indicators',
    'money-supply': 'indicators',
    'tourism': 'indicators',
    'exchange-rate': 'markets',
    'cds': 'markets',
    'reserves': 'markets',
    'forecasts': 'forecasts'
  };

  // Filtreleme
  const filteredSections = useMemo(() => {
    let filtered = analysisSections;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(section => 
        categoryMapping[section.id] === selectedCategory
      );
    }

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.subsections.some(sub => 
          sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getFrequencyBadgeColor = (frequency: string) => {
    const color = getUpdateFrequencyColor(frequency);
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      gray: 'bg-gray-100 text-gray-700'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Güncel Analiz</h1>
          <p className="text-blue-100">
            Türkiye ekonomisinin kapsamlı analizi - 12 ana bölüm, 259 slide detaylı içerik
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Bölüm, konu veya anahtar kelime ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            {filteredSections.length} bölüm gösteriliyor
            {searchQuery && ` • "${searchQuery}" için sonuçlar`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sonuç bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSections.map((section) => {
              const Icon = iconMap[section.icon] || Target;
              const isExpanded = expandedSections.has(section.id);

              return (
                <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-5 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h2>
                        <ChevronDown 
                          className={`
                            w-5 h-5 text-gray-400 transition-transform flex-shrink-0
                            ${isExpanded ? 'rotate-180' : ''}
                          `}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {section.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Son güncelleme: {new Date(section.lastUpdate).toLocaleDateString('tr-TR')}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getFrequencyBadgeColor(section.updateFrequency)}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {section.updateFrequency}
                        </span>
                        <span className="text-gray-400">
                          Slide {section.slideRange[0]}-{section.slideRange[1]} • {section.subsections.length} alt bölüm
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6 space-y-6">
                        {section.subsections.map((subsection) => (
                          <div key={subsection.id} className="bg-white rounded-lg p-5 border border-gray-200">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <h3 className="text-base font-semibold text-gray-900">
                                {subsection.title}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                Slide {subsection.slides.join(', ')}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                              {subsection.content}
                            </p>

                            {/* Data Points */}
                            {subsection.dataPoints && subsection.dataPoints.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                {subsection.dataPoints.map((dp, idx) => (
                                  <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-gray-600 mb-1">{dp.label}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-gray-900">{dp.value}</span>
                                      {dp.trend && (
                                        <span className={`
                                          text-xs px-1.5 py-0.5 rounded
                                          ${dp.trend === 'up' ? 'bg-green-100 text-green-700' : ''}
                                          ${dp.trend === 'down' ? 'bg-red-100 text-red-700' : ''}
                                          ${dp.trend === 'stable' ? 'bg-gray-100 text-gray-700' : ''}
                                        `}>
                                          {dp.trend === 'up' && '↑'}
                                          {dp.trend === 'down' && '↓'}
                                          {dp.trend === 'stable' && '→'}
                                        </span>
                                      )}
                                    </div>
                                    {dp.note && (
                                      <div className="text-xs text-gray-500 mt-1">{dp.note}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Source Link */}
                            {subsection.sourceUrl && (
                              <a
                                href={subsection.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <span>Veri Kaynağı</span>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
