import React from 'react'
import { TrendingUp, TrendingDown, Volume2, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import AudioPlayer from './AudioPlayer'

interface MarketSummaryProps {
  data: {
    date: string
    marketSummary: {
      headline: string
      keyPoints: string[]
      marketConcerns: string[]
      upcomingEvents: Array<{
        event: string
        date: string
        note: string
      }>
    }
    topPerformers: Array<{
      symbol: string
      name: string
      changePercent: number
      reason: string
    }>
    worstPerformers: Array<{
      symbol: string
      name: string
      changePercent: number
      reason: string
    }>
  }
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ data }) => {
  // Safety check for data structure
  if (!data || !data.marketSummary) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-center text-gray-400">
          <p>Piyasa özeti yükleniyor...</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventIcon = (event: string) => {
    if (event.includes('toplantı') || event.includes('FOMC')) {
      return <Calendar className="h-4 w-4 text-blue-400" />
    }
    if (event.includes('durdurma') || event.includes('risk')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    }
    return <Calendar className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Market Summary Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Piyasa Özeti</h2>
              <p className="text-gray-400 text-sm">Bugünün piyasa özeti</p>
            </div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-1">
            <AudioPlayer 
              audioSrc="/audio/market_summary.mp3"
              label="Piyasa Özeti Oynat"
            />
          </div>
        </div>

        {/* Headline */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-bold text-white mb-2">{data.marketSummary.headline}</h3>
        </div>

        {/* Key Points */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Anahtar Noktalar</span>
          </h4>
          <div className="space-y-2">
            {data.marketSummary.keyPoints?.map((point, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-3 flex items-start space-x-3">
                <div className="bg-green-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">{point}</p>
              </div>
            )) || <p className="text-gray-400 text-sm">Veri yükleniyor...</p>}
          </div>
        </div>

        {/* Market Concerns */}
        {data.marketSummary.marketConcerns && data.marketSummary.marketConcerns.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Piyasa Endişeleri</span>
            </h4>
            <div className="space-y-2">
              {data.marketSummary.marketConcerns.map((concern, index) => (
                <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-3">
                  <div className="bg-yellow-500 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">{concern}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      {data.marketSummary.upcomingEvents && data.marketSummary.upcomingEvents.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yaklaşan Etkinlikler</h3>
              <p className="text-gray-400 text-sm">Önemli takvim hatırlatmaları</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.marketSummary.upcomingEvents.map((event, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getEventIcon(event.event)}
                    <h4 className="text-white font-medium">{event.event}</h4>
                  </div>
                  <span className="text-blue-400 text-sm font-mono">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{event.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top/Worst Performers */}
      {((data.topPerformers && data.topPerformers.length > 0) || (data.worstPerformers && data.worstPerformers.length > 0)) && (
        <div className="grid grid-cols-1 gap-6">
          {/* Top Performers */}
          {data.topPerformers && data.topPerformers.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Bugün En İyi Performans Gösterenler</h3>
              </div>
              
              <div className="space-y-3">
                {data.topPerformers.map((performer, index) => (
                  <div key={performer.symbol} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{performer.symbol}</span>
                        <span className="text-gray-400 text-sm">{performer.name}</span>
                      </div>
                      <span className="text-green-500 font-bold">
                        +{performer.changePercent.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs">{performer.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worst Performers */}
          {data.worstPerformers && data.worstPerformers.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Bugün En Kötü Performans Gösterenler</h3>
              </div>
              
              <div className="space-y-3">
                {data.worstPerformers.map((performer, index) => (
                  <div key={performer.symbol} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{performer.symbol}</span>
                        <span className="text-gray-400 text-sm">{performer.name}</span>
                      </div>
                      <span className="text-red-500 font-bold">
                        {performer.changePercent.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs">{performer.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MarketSummary
