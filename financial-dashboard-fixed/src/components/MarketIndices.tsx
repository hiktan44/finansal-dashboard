import React, { useRef, useState } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import ChartControls, { ChartType, DateRange, ValueRange } from './ChartControls'
import ChartExport from './ChartExport'

interface MarketIndicesProps {
  data: {
    date: string
    indices: Array<{
      name: string
      symbol: string
      close: number
      change: number
      changePercent: number
      isNewHigh: boolean
      monthlyChange: number
      quarterlyChange?: number
      note: string
    }>
  }
}

const MarketIndices: React.FC<MarketIndicesProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [showGrid, setShowGrid] = useState(true)
  const [valueRange, setValueRange] = useState<ValueRange>({ min: -5, max: 5 })
  const [zoomLevel, setZoomLevel] = useState(1)

  const chartData = data.indices.map(index => ({
    name: index.symbol,
    value: index.changePercent,
    close: index.close,
    change: index.change,
    fullName: index.name,
    monthlyChange: index.monthlyChange
  }))

  // Filter data based on value range
  const filteredData = chartData.filter(
    item => item.value >= valueRange.min && item.value <= valueRange.max
  )

  const getBarColor = (value: number) => {
    return value >= 0 ? '#10B981' : '#EF4444'
  }

  const getPieData = () => {
    return chartData.map(item => ({
      name: item.name,
      value: Math.abs(item.value),
      color: getBarColor(item.value)
    }))
  }

  // Custom Tooltip with enhanced information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Kapanış:</span>{' '}
            <span className="font-medium">{data.close?.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Değişim:</span>{' '}
            <span className={`font-medium ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Değişim %:</span>{' '}
            <span className={`font-medium ${data.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.value >= 0 ? '+' : ''}{data.value?.toFixed(2)}%
            </span>
          </p>
          <p className="text-sm text-gray-300 border-t border-gray-700 mt-2 pt-2">
            <span className="text-gray-400">Aylık:</span>{' '}
            <span className="font-medium text-green-400">+{data.monthlyChange}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 300 * zoomLevel,
      data: filteredData
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9CA3AF', fontSize: 12 } as any}
                stroke="#4B5563"
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 } as any}
                stroke="#4B5563"
                label={{ value: 'Değişim (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Günlük Değişim %"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9CA3AF', fontSize: 12 } as any}
                stroke="#4B5563"
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 } as any}
                stroke="#4B5563"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
                name="Günlük Değişim %"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={getPieData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}%`}
                outerRadius={100 * zoomLevel}
                fill="#8884d8"
                dataKey="value"
              >
                {getPieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'bar':
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9CA3AF', fontSize: 12 } as any}
                stroke="#4B5563"
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 } as any}
                stroke="#4B5563"
                label={{ value: 'Değişim (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" radius={[4, 4, 0, 0] as any} name="Günlük Değişim %">
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500/20 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ana Endeksler</h2>
            <p className="text-gray-400 text-sm">Gerçek zamanlı endeks verileri</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <AudioPlayer 
            audioSrc="/audio/stock_indices.mp3"
            label="Ana Endeksler Oynat"
          />
        </div>
      </div>

      {/* Stock Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {data.indices.map((index, i) => (
          <div key={index.symbol} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-semibold">{index.symbol}</h3>
                <p className="text-gray-400 text-xs">{index.name}</p>
              </div>
              {index.isNewHigh && (
                <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  Yeni Tepe
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {index.close.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
              </p>
              
              <div className="flex items-center space-x-2">
                {index.changePercent >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-medium ${
                  index.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                </span>
                <span className={`font-medium ${
                  index.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </span>
              </div>
              
              <p className="text-gray-400 text-xs mt-2">
                Aylık: <span className="text-green-400">+{index.monthlyChange}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="mb-4">
        <ChartControls
          chartType={chartType}
          onChartTypeChange={setChartType}
          valueRange={valueRange}
          onValueRangeChange={setValueRange}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
        />
      </div>

      {/* Performance Chart */}
      <div ref={chartRef} className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Günlük Değişim Oranı Karşılaştırması</h3>
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
              data={chartData}
              fileName="ana-endeksler"
              title="Ana Endeksler - Günlük Değişim"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {renderChart()}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4 space-y-2">
        {data.indices.map((index) => (
          <div key={index.symbol} className="text-gray-400 text-sm bg-gray-700/20 rounded p-3">
            <span className="text-yellow-400 font-medium">{index.symbol}:</span> {index.note}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarketIndices
