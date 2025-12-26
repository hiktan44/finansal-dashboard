import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  Target,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SentimentData {
  sentiment_score: number;
  sentiment_category: string;
  sentiment_label: string;
  fear_greed_index: number;
  rsi_value: number;
  volatility_percent: number;
}

interface PredictionData {
  predicted_price: number;
  trend_direction: string;
  confidence_score: number;
  predictions_json: Array<{
    day: number;
    date: string;
    predicted_price: number;
    confidence: number;
  }>;
  ma10: number;
  ma20: number;
  ma50: number;
}

interface RiskData {
  risk_score: number;
  risk_category: string;
  risk_label: string;
  volatility_percent: number;
  sharpe_ratio: number;
  max_drawdown_percent: number;
  recommendations: string[];
}

interface AnomalyData {
  anomaly_score: number;
  anomaly_level: string;
  anomalies_json: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  recommendations: string[];
}

interface Props {
  symbol: string;
}

export function AIInsightsPanel({ symbol }: Props) {
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyData | null>(null);
  const [activeTab, setActiveTab] = useState<'sentiment' | 'prediction' | 'risk' | 'anomaly'>('sentiment');

  useEffect(() => {
    if (symbol) {
      loadAIInsights();
    }
  }, [symbol]);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      // Fetch all AI analyses in parallel
      const [sentimentRes, predictionRes, riskRes, anomalyRes] = await Promise.all([
        supabase.functions.invoke('ai-sentiment-analysis', { body: { symbol } }),
        supabase.functions.invoke('ai-market-prediction', { body: { symbol, days: 10 } }),
        supabase.functions.invoke('ai-risk-assessment', { body: { symbol } }),
        supabase.functions.invoke('ai-anomaly-detection', { body: { symbol } })
      ]);

      if (sentimentRes.data?.data?.sentiment) {
        setSentiment(sentimentRes.data.data.sentiment);
      }

      if (predictionRes.data?.data) {
        setPrediction(predictionRes.data.data);
      }

      if (riskRes.data?.data?.risk_assessment) {
        setRisk(riskRes.data.data.risk_assessment);
      }

      if (anomalyRes.data?.data) {
        setAnomaly(anomalyRes.data.data);
      }
    } catch (error) {
      console.error('AI insights error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 60) return 'bg-green-400';
    if (score >= 40) return 'bg-yellow-400';
    if (score >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getRiskColor = (category: string) => {
    if (category === 'VERY_LOW' || category === 'LOW') return 'text-green-600';
    if (category === 'MEDIUM') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Analiz Paneli</h3>
        </div>
        <button
          onClick={loadAIInsights}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'sentiment'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sentiment</span>
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'prediction'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Tahmin</span>
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'risk'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Risk</span>
        </button>
        <button
          onClick={() => setActiveTab('anomaly')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'anomaly'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Anomali</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Sentiment Tab */}
            {activeTab === 'sentiment' && sentiment && (
              <div className="space-y-6">
                {/* Fear & Greed Index */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Korku & Açgözlülük Endeksi</h4>
                    <span className="text-3xl font-bold text-purple-600">{sentiment.fear_greed_index}</span>
                  </div>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getSentimentColor(sentiment.sentiment_score)} transition-all duration-500`}
                      style={{ width: `${sentiment.sentiment_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>Aşırı Korku</span>
                    <span>Nötr</span>
                    <span>Aşırı Açgözlülük</span>
                  </div>
                </div>

                {/* Sentiment Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">RSI</div>
                    <div className="text-2xl font-bold">{sentiment.rsi_value.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sentiment.rsi_value > 70 ? 'Aşırı Alım' : sentiment.rsi_value < 30 ? 'Aşırı Satım' : 'Normal'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Volatilite</div>
                    <div className="text-2xl font-bold">{sentiment.volatility_percent.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Yıllık</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Kategori</div>
                    <div className="text-lg font-bold">{sentiment.sentiment_label}</div>
                    <div className="text-xs text-gray-500 mt-1">{sentiment.sentiment_category}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Prediction Tab */}
            {activeTab === 'prediction' && prediction && (
              <div className="space-y-6">
                {/* Trend Info */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Trend Yönü</div>
                    <div className="flex items-center space-x-2">
                      {prediction.trend_direction === 'UPTREND' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                      <span className="text-xl font-bold">
                        {prediction.trend_direction === 'UPTREND' ? 'Yükseliş' : 'Düşüş'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">10 Gün Tahmini</div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${prediction.predicted_price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Moving Averages */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 mb-1">MA10</div>
                    <div className="text-xl font-bold">${prediction.ma10.toFixed(2)}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 mb-1">MA20</div>
                    <div className="text-xl font-bold">${prediction.ma20.toFixed(2)}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 mb-1">MA50</div>
                    <div className="text-xl font-bold">${prediction.ma50.toFixed(2)}</div>
                  </div>
                </div>

                {/* Predictions List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Günlük Tahminler</h4>
                  <div className="space-y-2">
                    {prediction.predictions_json.slice(0, 5).map((pred) => (
                      <div key={pred.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Gün {pred.day}</div>
                          <div className="text-xs text-gray-500">{pred.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${pred.predicted_price.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Güven: {pred.confidence.toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Risk Tab */}
            {activeTab === 'risk' && risk && (
              <div className="space-y-6">
                {/* Risk Score */}
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Risk Skoru</div>
                  <div className={`text-5xl font-bold ${getRiskColor(risk.risk_category)}`}>
                    {risk.risk_score.toFixed(0)}
                  </div>
                  <div className="text-lg font-medium mt-2">{risk.risk_label}</div>
                </div>

                {/* Risk Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Sharpe Ratio</div>
                    <div className="text-2xl font-bold">{risk.sharpe_ratio.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {risk.sharpe_ratio > 1 ? 'İyi' : 'Düşük'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Max Drawdown</div>
                    <div className="text-2xl font-bold text-red-600">{risk.max_drawdown_percent.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Maksimum Kayıp</div>
                  </div>
                </div>

                {/* Recommendations */}
                {risk.recommendations && risk.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Öneriler</h4>
                    <div className="space-y-2">
                      {risk.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Anomaly Tab */}
            {activeTab === 'anomaly' && anomaly && (
              <div className="space-y-6">
                {/* Anomaly Score */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Anomali Skoru</div>
                  <div className="text-5xl font-bold text-purple-600">
                    {anomaly.anomaly_score.toFixed(0)}
                  </div>
                  <div className="text-lg font-medium mt-2">{anomaly.anomaly_level}</div>
                </div>

                {/* Detected Anomalies */}
                {anomaly.anomalies_json && anomaly.anomalies_json.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tespit Edilen Anomaliler</h4>
                    <div className="space-y-3">
                      {anomaly.anomalies_json.map((anom, index) => (
                        <div key={index} className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-purple-900">{anom.type}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              anom.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                              anom.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {anom.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{anom.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {anomaly.recommendations && anomaly.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Öneriler</h4>
                    <div className="space-y-2">
                      {anomaly.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
