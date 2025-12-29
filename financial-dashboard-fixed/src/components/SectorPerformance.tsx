import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Activity, Volume2, Building } from 'lucide-react'
import AudioPlayer from './AudioPlayer'

interface SectorPerformanceProps {
  data: {
    date: string
    sectors: Array<{
      name: string
      symbol: string
      spWeight: number
      forwardPE: number
      expectedGrowth: number
      ytdReturn: number
      note: string
    }>
  }
}

const SectorPerformance: React.FC<SectorPerformanceProps> = ({ data }) => {
  const chartData = data.sectors.map(sector => ({
    name: sector.name,
    symbol: sector.symbol,
    return: sector.ytdReturn,
    weight: sector.spWeight,
    pe: sector.forwardPE,
    growth: sector.expectedGrowth
  }))

  // Yıl başından bu yana getiri oranına göre sırala
  const sortedData = [...chartData].sort((a, b) => b.return - a.return)

  const getReturnColor = (value: number) => {
    if (value >= 15) return '#10B981' // Yüksek artış - yeşil
    if (value >= 5) return '#F59E0B' // Orta artış - sarı
    if (value >= 0) return '#8B5CF6' // Düşük artış - mor
    return '#EF4444' // Düşüş - kırmızı
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // %5'ten küçük etiketleri gösterme
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Building className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sektör Performansı</h2>
            <p className="text-gray-400 text-sm">Yıl başından bu yana getiri karşılaştırması</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-1">
          <AudioPlayer 
            audioSrc="/audio/sector_rotation.mp3"
            label="Sektör Performansı Oynat"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S&P 500 Weight Distribution */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">S&P 500 Ağırlık Dağılımı</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel as any}
                outerRadius={80}
                fill="#8884d8"
                dataKey="weight"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getReturnColor(entry.return)} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Ağırlık']}
                labelFormatter={(label: any) => `${label} Sektörü`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* YTD Returns */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">Yıl Başından Bu Yana Getiri</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sortedData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number"
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: '#9CA3AF', fontSize: 10 } as any}
                stroke="#4B5563"
                width={60}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Getiri Oranı']}
              />
              <Bar dataKey="return" radius={[0, 2, 2, 0] as any}>
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getReturnColor(entry.return)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Details */}
      <div className="mt-6">
        <h3 className="text-white font-semibold mb-4">Sektör Detayları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.sectors.slice(0, 6).map((sector) => (
            <div 
              key={sector.symbol} 
              className="bg-gray-700/20 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{sector.name}</h4>
                <span className="text-gray-400 text-sm">{sector.symbol}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Yıl Başından Bu Yana Getiri</p>
                  <p className={`font-bold ${
                    sector.ytdReturn >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {sector.ytdReturn >= 0 ? '+' : ''}{sector.ytdReturn.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Ağırlık</p>
                  <p className="text-white font-bold">{sector.spWeight.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">İleriye Dönük F/K</p>
                  <p className="text-blue-400 font-bold">{sector.forwardPE.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Beklenen Büyüme</p>
                  <p className="text-purple-400 font-bold">{sector.expectedGrowth.toFixed(1)}%</p>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-3 bg-gray-800/50 rounded p-2">
                {sector.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-sm">En İyi Performans</p>
          <p className="text-white font-bold">
            {sortedData[0].name} +{sortedData[0].return.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">En Kötü Performans</p>
          <p className="text-white font-bold">
            {sortedData[sortedData.length - 1].name} {sortedData[sortedData.length - 1].return.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-400 text-sm">Ortalama Getiri</p>
          <p className="text-white font-bold">
            +{(sortedData.reduce((sum, sector) => sum + sector.return, 0) / sortedData.length).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-400 text-sm">Yükselen Sektörler</p>
          <p className="text-white font-bold">
            {sortedData.filter(s => s.return > 0).length}/{sortedData.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SectorPerformance
