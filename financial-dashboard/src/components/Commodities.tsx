import React, { useRef, useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Coins, Fuel, Zap, Maximize2 } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import ChartControls, { ChartType } from './ChartControls'
import ChartExport from './ChartExport'

interface CommoditiesProps {
  data: {
    date: string
    commodities: Array<{
      name: string
      symbol: string
      price: number
      unit: string
      changePercent: number
      intradayHigh?: number
      monthlyReturn?: number
      note: string
    }>
  }
}

const Commodities: React.FC<CommoditiesProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartType, setChartType] = useState<ChartType>('line')
  const [showGrid, setShowGrid] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)

  const getIcon = (symbol: string) => {
    switch (symbol) {
      case 'GOLD':
      case 'GC=F':
        return <Coins className="h-5 w-5 text-yellow-500" />
      case 'WTI':
      case 'BRENT':
      case 'CL=F':
        return <Fuel className="h-5 w-5 text-orange-500" />
      case 'BTC':
        return <Zap className="h-5 w-5 text-orange-400" />
      default:
        return <TrendingUp className="h-5 w-5 text-blue-500" />
    }
  }

  const getColorClass = (changePercent: number) => {
    return changePercent >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const getBgColorClass = (changePercent: number) => {
    return changePercent >= 0 
      ? 'bg-green-500/10 border-green-500/30' 
      : 'bg-red-500/10 border-red-500/30'
  }

  const getBarColor = (value: number) => {
    return value >= 0 ? '#10B981' : '#EF4444'
  }

  // Generate trend data for simulation (24-hour trend)
  const generateTrendData = (basePrice: number, changePercent: number) => {
    const points = 24
    const data = []
    const volatility = Math.abs(changePercent) * 0.3
    
    for (let i = 0; i < points; i++) {
      const trend = (changePercent / 100) * (i / points)
      const noise = (Math.random() - 0.5) * volatility / 100
      const price = basePrice * (1 + trend + noise)
      data.push({
        time: `${String(i).padStart(2, '0')}:00`,
        price: price,
        hour: i
      })
    }
    return data
  }

  const goldCommodity = data.commodities.find(c => c.symbol === 'GC=F' || c.symbol === 'GOLD')
  console.log('Debug Commodities:', { 
    availableSymbols: data.commodities.map(c => c.symbol), 
    goldCommodity,
    dataLength: data.commodities.length 
  })
  
  const trendData = goldCommodity 
    ? generateTrendData(goldCommodity.price, goldCommodity.changePercent)
    : []
  
  console.log('Debug Trend Data:', { trendDataLength: trendData.length, goldPrice: goldCommodity?.price })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Saat:</span>{' '}
            <span className="font-medium">{payload[0].payload.time}</span>
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Fiyat:</span>{' '}
            <span className="font-medium text-yellow-400">${payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const renderTrendChart = () => {
    console.log('Rendering trend chart with data:', { 
      dataLength: trendData.length, 
      hasData: trendData.length > 0,
      sampleData: trendData.slice(0, 3)
    })
    
    const commonProps = {
      width: '100%',
      height: 200 * zoomLevel,
      data: trendData
    }

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
                interval={3 as any}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
                domain={['dataMin - 10', 'dataMax + 10'] as any}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#F59E0B" 
                fill="#F59E0B"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
                interval={3 as any}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="price" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
                interval={3 as any}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
                domain={['dataMin - 10', 'dataMax + 10'] as any}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#F59E0B' } as any}
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Emtialar</h2>
            <p className="text-gray-400 text-sm">Gerçek zamanlı fiyat performansı</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-1">
          <AudioPlayer 
            audioSrc="/audio/commodities.mp3"
            label="Emtialar Oynat"
          />
        </div>
      </div>

      {/* Commodities Cards */}
      <div className="space-y-4 mb-6">
        {data.commodities.map((commodity) => (
          <div 
            key={commodity.symbol} 
            className={`rounded-lg p-4 border transition-all hover:scale-[1.02] ${
              getBgColorClass(commodity.changePercent)
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-700/50 p-2 rounded-lg">
                  {getIcon(commodity.symbol)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{commodity.name}</h3>
                  <p className="text-gray-400 text-sm">{commodity.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {(commodity.price || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                </p>
                <p className="text-gray-400 text-sm">{commodity.unit || 'USD'}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                {commodity.changePercent >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-bold ${getColorClass(commodity.changePercent)}`}>
                  {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(1)}%
                </span>
                
                {commodity.monthlyReturn && (
                  <span className="text-yellow-400 text-sm">
                    Aylık {commodity.monthlyReturn >= 0 ? '+' : ''}{commodity.monthlyReturn}%
                  </span>
                )}
                
                {commodity.intradayHigh && (
                  <span className="text-blue-400 text-sm">
                    Günlük Yüksek: {(commodity.intradayHigh || 0).toLocaleString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-400 text-xs mt-3 bg-gray-700/30 rounded p-2">
              {commodity.note}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="mb-4">
        <ChartControls
          chartType={chartType}
          onChartTypeChange={setChartType}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
        />
      </div>

      {/* Trend Chart */}
      <div ref={chartRef} className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center space-x-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span>Altın Fiyat Trendi (24 saat simülasyon)</span>
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                className="px-2 py-1 bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                -
              </button>
              <Maximize2 className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                className="px-2 py-1 bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                +
              </button>
              <span className="text-xs text-gray-400">{(zoomLevel * 100).toFixed(0)}%</span>
            </div>
            <ChartExport
              chartRef={chartRef}
              data={trendData}
              fileName="emtialar-trend"
              title="Emtialar - Fiyat Trendi"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {renderTrendChart()}
        </div>
      </div>

      {/* Commodities Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700/20 rounded-lg p-3">
          <p className="text-gray-400 text-sm">En İyi Performans</p>
          <p className="text-green-500 font-bold">
            {(data.commodities || []).length > 0 ? data.commodities.reduce((best, commodity) => 
              commodity.changePercent > best.changePercent ? commodity : best
            ).name + ' ' : ''}{(data.commodities || []).length > 0 ? '+' : ''}{(data.commodities || []).length > 0 ? data.commodities.reduce((best, commodity) => 
              commodity.changePercent > best.changePercent ? commodity : best
            ).changePercent.toFixed(1) : '0'}%
          </p>
        </div>
        
        <div className="bg-gray-700/20 rounded-lg p-3">
          <p className="text-gray-400 text-sm">En Kötü Performans</p>
          <p className="text-red-500 font-bold">
            {(data.commodities || []).length > 0 ? data.commodities.reduce((worst, commodity) => 
              commodity.changePercent < worst.changePercent ? commodity : worst
            ).name : 'N/A'} {(data.commodities || []).length > 0 ? data.commodities.reduce((worst, commodity) => 
              commodity.changePercent < worst.changePercent ? commodity : worst
            ).changePercent.toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default Commodities
