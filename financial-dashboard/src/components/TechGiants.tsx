import React, { useRef, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { TrendingUp, TrendingDown, Cpu, Maximize2 } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import ChartControls, { ChartType, ValueRange } from './ChartControls'
import ChartExport from './ChartExport'

interface TechGiantsProps {
  data: {
    date: string
    companies: Array<{
      name: string
      symbol: string
      close: number
      changePercent: number
      dayHigh: number
      dayLow: number
      note?: string
    }>
  }
}

const TechGiants: React.FC<TechGiantsProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [showGrid, setShowGrid] = useState(true)
  const [valueRange, setValueRange] = useState<ValueRange>({ min: -10, max: 10 })
  const [zoomLevel, setZoomLevel] = useState(1)

  const chartData = data.companies.map(company => ({
    name: company.symbol,
    value: company.changePercent,
    close: company.close,
    fullName: company.name,
    dayHigh: company.dayHigh,
    dayLow: company.dayLow,
    range: ((company.dayHigh - company.dayLow) / company.close * 100).toFixed(2)
  }))

  // Filter data based on value range
  const filteredData = chartData.filter(
    item => item.value >= valueRange.min && item.value <= valueRange.max
  )

  const getColor = (value: number) => {
    return value >= 0 ? '#10B981' : '#EF4444'
  }

  const getBgColor = (value: number) => {
    return value >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white mb-2">{data.fullName} ({data.name})</p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Fiyat:</span>{' '}
            <span className="font-medium">${data.close?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Değişim:</span>{' '}
            <span className={`font-medium ${data.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.value >= 0 ? '+' : ''}{data.value?.toFixed(2)}%
            </span>
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Gün Yüksek:</span>{' '}
            <span className="font-medium">${data.dayHigh?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Gün Düşük:</span>{' '}
            <span className="font-medium">${data.dayLow?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-300 border-t border-gray-700 mt-2 pt-2">
            <span className="text-gray-400">Volatilite:</span>{' '}
            <span className="font-medium text-yellow-400">{data.range}%</span>
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
                domain={['auto', 'auto']}
                stroke="#4B5563"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
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
                domain={['auto', 'auto']}
                stroke="#4B5563"
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#4B5563"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis
                dataKey="name"
                domain={['auto', 'auto']}
                stroke="#4B5563"
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#4B5563"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0] as any}>
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
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
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Cpu className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Teknoloji Devleri</h2>
            <p className="text-gray-400 text-sm">Yedi büyük teknoloji hissesi gerçek zamanlı performansı</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-1">
          <AudioPlayer
            text={`Teknoloji Devleri Özeti. ${data.companies.map(c => `${c.symbol} hissesi ${c.close} dolar seviyesinden kapanmış, günlük yüzde ${Math.abs(c.changePercent).toFixed(2)} ${c.changePercent >= 0 ? 'değer kazanmıştır' : 'değer kaybetmiştir'}. ${c.note || ''}`).join('. ')}`}
            label="Teknoloji Devleri Oynat"
          />
        </div>
      </div>

      {/* Company Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {data.companies.map((company) => (
          <div
            key={company.symbol}
            className={`rounded-lg p-4 border transition-all hover:scale-105 ${getBgColor(company.changePercent)
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold">{company.symbol}</h3>
              {company.changePercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>

            <p className="text-gray-400 text-xs mb-2">{company.name}</p>

            <div className="space-y-2">
              <p className="text-xl font-bold text-white">
                ${company.close.toFixed(2)}
              </p>

              <div className="flex items-center space-x-2">
                <span className={`font-bold text-sm ${company.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {company.changePercent >= 0 ? '+' : ''}{company.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Yüksek: ${company.dayHigh.toFixed(2)}</span>
                  <span>Düşük: ${company.dayLow.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full ${company.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    style={{
                      width: `${Math.min(Math.abs(company.changePercent) * 10, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {company.note && (
              <p className="text-xs text-yellow-400 mt-2 bg-yellow-500/10 rounded p-2">
                {company.note}
              </p>
            )}
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
          <h3 className="text-white font-semibold">Günlük Performans Karşılaştırması</h3>
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
              fileName="teknoloji-devleri"
              title="Teknoloji Devleri - Günlük Performans"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {renderChart()}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700/20 rounded-lg p-3">
          <p className="text-gray-400 text-sm">En İyi Performans</p>
          <p className="text-green-500 font-bold">
            {(data.companies || []).length > 0 ? data.companies.reduce((best, company) =>
              company.changePercent > best.changePercent ? company : best
            ).symbol + ' ' : ''}{(data.companies || []).length > 0 ? '+' : ''}{(data.companies || []).length > 0 ? data.companies.reduce((best, company) =>
              company.changePercent > best.changePercent ? company : best
            ).changePercent.toFixed(2) : '0.00'}%
          </p>
        </div>

        <div className="bg-gray-700/20 rounded-lg p-3">
          <p className="text-gray-400 text-sm">En Kötü Performans</p>
          <p className="text-red-500 font-bold">
            {(data.companies || []).length > 0 ? data.companies.reduce((worst, company) =>
              company.changePercent < worst.changePercent ? company : worst
            ).symbol : 'N/A'} {(data.companies || []).length > 0 ? data.companies.reduce((worst, company) =>
              company.changePercent < worst.changePercent ? company : worst
            ).changePercent.toFixed(2) : '0.00'}%
          </p>
        </div>

        <div className="bg-gray-700/20 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Ortalama Değişim Oranı</p>
          <p className="text-white font-bold">
            {((data.companies || []).length > 0 ? (data.companies || []).reduce((sum, company) => sum + company.changePercent, 0) / (data.companies || []).length : 0).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default TechGiants
