import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TechnicalIndicators {
  rsi: number;
  rsi_signal: 'overbought' | 'oversold' | 'neutral';
  macd: {
    macd_line: number;
    signal_line: number;
    histogram: number;
    signal: 'bullish' | 'bearish' | 'neutral';
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    position: 'above' | 'below' | 'within';
  };
}

interface PricePredict {
  date: string;
  predicted_price: number;
  confidence_lower: number;
  confidence_upper: number;
}

interface AIInsight {
  id: string;
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  trend_strength: number;
  confidence_score: number;
  volatility: number;
  risk_level: 'low' | 'medium' | 'high';
  support_level?: number;
  resistance_level?: number;
  technical_indicators?: TechnicalIndicators;
  price_predictions?: PricePredict[];
  analysis_summary: string;
  recommendations: string[];
  generated_at: string;
}

interface AIAnalysisPanelProps {
  symbol: string;
}

export function AIAnalysisPanel({ symbol }: AIAnalysisPanelProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    loadAIInsight();
  }, [symbol]);

  const loadAIInsight = async () => {
    try {
      setLoading(true);
      
      // Fetch latest AI insight for symbol
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('symbol', symbol)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setInsight(data as AIInsight);
      } else {
        // Trigger AI analysis if no data exists
        await triggerAIAnalysis();
      }
    } catch (error) {
      console.error('Error loading AI insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { symbol }
      });

      if (error) throw error;

      // Reload after analysis
      await loadAIInsight();
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'bearish': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRSISignalColor = (signal: string) => {
    switch (signal) {
      case 'overbought': return 'text-red-600 bg-red-50';
      case 'oversold': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{t('noAIAnalysis') || 'AI analizi mevcut değil'}</p>
          <button
            onClick={triggerAIAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('runAIAnalysis') || 'AI Analizi Çalıştır'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {t('aiAnalysis') || 'AI Analizi'}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(insight.generated_at).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trend */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon(insight.trend)}
                <span className="text-sm font-medium text-gray-600">
                  {t('trend') || 'Trend'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {t(insight.trend) || insight.trend}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {t('strength') || 'Güç'}: {(insight.trend_strength * 100).toFixed(0)}%
              </div>
            </div>

            {/* Risk Level */}
            <div className={`rounded-lg p-4 ${getRiskColor(insight.risk_level)}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{t('risk') || 'Risk'}</span>
              </div>
              <div className="text-2xl font-bold capitalize">
                {t(insight.risk_level) || insight.risk_level}
              </div>
              <div className="text-sm mt-1">
                {t('volatility') || 'Volatilite'}: {(insight.volatility * 100).toFixed(2)}%
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {t('confidence') || 'Güven'}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {(insight.confidence_score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {t('analysisConfidence') || 'Analiz güveni'}
              </div>
            </div>
          </div>

          {/* Support & Resistance */}
          {(insight.support_level || insight.resistance_level) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('supportResistance') || 'Destek & Direnç Seviyeleri'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {insight.support_level && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t('support') || 'Destek'}</div>
                    <div className="text-xl font-bold text-green-600">
                      {insight.support_level.toLocaleString('tr-TR', { 
                        style: 'currency', 
                        currency: 'USD' 
                      })}
                    </div>
                  </div>
                )}
                {insight.resistance_level && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t('resistance') || 'Direnç'}</div>
                    <div className="text-xl font-bold text-red-600">
                      {insight.resistance_level.toLocaleString('tr-TR', { 
                        style: 'currency', 
                        currency: 'USD' 
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Indicators */}
          {insight.technical_indicators && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('technicalIndicators') || 'Teknik İndikatörler'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RSI */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">RSI (14)</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {insight.technical_indicators.rsi.toFixed(2)}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRSISignalColor(insight.technical_indicators.rsi_signal)}`}>
                    {t(insight.technical_indicators.rsi_signal) || insight.technical_indicators.rsi_signal}
                  </span>
                </div>

                {/* MACD */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">MACD</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {insight.technical_indicators.macd.histogram.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>MACD: {insight.technical_indicators.macd.macd_line.toFixed(2)}</div>
                    <div>Signal: {insight.technical_indicators.macd.signal_line.toFixed(2)}</div>
                  </div>
                  <span className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                    insight.technical_indicators.macd.signal === 'bullish' 
                      ? 'text-green-600 bg-green-50' 
                      : insight.technical_indicators.macd.signal === 'bearish'
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 bg-gray-50'
                  }`}>
                    {t(insight.technical_indicators.macd.signal) || insight.technical_indicators.macd.signal}
                  </span>
                </div>

                {/* Bollinger Bands */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Bollinger Bands</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Üst: {insight.technical_indicators.bollinger.upper.toFixed(2)}</div>
                    <div>Orta: {insight.technical_indicators.bollinger.middle.toFixed(2)}</div>
                    <div>Alt: {insight.technical_indicators.bollinger.lower.toFixed(2)}</div>
                  </div>
                  <span className="mt-2 inline-block px-2 py-1 rounded text-xs font-medium text-gray-600 bg-gray-100">
                    {t(insight.technical_indicators.bollinger.position) || insight.technical_indicators.bollinger.position}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Price Predictions */}
          {insight.price_predictions && insight.price_predictions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t('pricePredictions') || 'Fiyat Tahminleri'} ({insight.price_predictions.length} gün)
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <div className="flex gap-3 min-w-max">
                  {insight.price_predictions.slice(0, 10).map((prediction, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 min-w-[120px] text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {new Date(prediction.date).toLocaleDateString('tr-TR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ${prediction.predicted_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${prediction.confidence_lower.toFixed(2)} - ${prediction.confidence_upper.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              {t('analysisSummary') || 'Analiz Özeti'}
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {insight.analysis_summary}
            </p>
          </div>

          {/* Recommendations */}
          {insight.recommendations && insight.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {t('recommendations') || 'Öneriler'}
              </h4>
              <div className="space-y-2">
                {insight.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={triggerAIAnalysis}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Brain className="w-5 h-5" />
              {t('refreshAnalysis') || 'Analizi Yenile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
