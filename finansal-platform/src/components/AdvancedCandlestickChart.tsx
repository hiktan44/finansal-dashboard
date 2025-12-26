// @ts-nocheck
import { useState, useEffect } from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, ZoomIn, ZoomOut } from 'lucide-react';

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  symbol: string;
  data: CandlestickData[];
  showMA?: boolean;
  showVolume?: boolean;
  showBollingerBands?: boolean;
}

export function AdvancedCandlestickChart({ 
  symbol, 
  data,
  showMA = true,
  showVolume = true,
  showBollingerBands = false
}: Props) {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [chartData, setChartData] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    processChartData();
  }, [data, timeframe, showMA, showBollingerBands]);

  const processChartData = () => {
    if (!data || data.length === 0) return;

    const processed = data.map((item, index) => {
      const isGreen = item.close >= item.open;
      
      // Moving Averages
      let ma10 = null;
      let ma20 = null;
      let ma50 = null;

      if (showMA) {
        if (index >= 9) {
          ma10 = data.slice(index - 9, index + 1).reduce((sum, d) => sum + d.close, 0) / 10;
        }
        if (index >= 19) {
          ma20 = data.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20;
        }
        if (index >= 49) {
          ma50 = data.slice(index - 49, index + 1).reduce((sum, d) => sum + d.close, 0) / 50;
        }
      }

      // Bollinger Bands
      let upperBand = null;
      let lowerBand = null;
      let middleBand = null;

      if (showBollingerBands && index >= 19) {
        const period = 20;
        const multiplier = 2;
        const slice = data.slice(index - period + 1, index + 1);
        const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
        const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - avg, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        middleBand = avg;
        upperBand = avg + stdDev * multiplier;
        lowerBand = avg - stdDev * multiplier;
      }

      return {
        date: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        candleColor: isGreen ? '#10B981' : '#EF4444',
        candleBody: [Math.min(item.open, item.close), Math.max(item.open, item.close)],
        wick: [item.low, item.high],
        ma10,
        ma20,
        ma50,
        upperBand,
        lowerBand,
        middleBand
      };
    });

    setChartData(processed);
  };

  const currentPrice = data[data.length - 1]?.close || 0;
  const previousPrice = data[data.length - 2]?.close || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props;
    
    if (!payload || payload.candleBody.length !== 2) return null;

    const [bodyLow, bodyHigh] = payload.candleBody;
    const [wickLow, wickHigh] = payload.wick;
    
    const yScale = height / (Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low)));
    const yOffset = Math.min(...data.map(d => d.low));

    const bodyY = y + height - (bodyHigh - yOffset) * yScale;
    const bodyHeight = (bodyHigh - bodyLow) * yScale;
    const wickY = y + height - (wickHigh - yOffset) * yScale;
    const wickHeight = (wickHigh - wickLow) * yScale;

    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={wickY}
          x2={x + width / 2}
          y2={wickY + wickHeight}
          stroke={payload.candleColor}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x}
          y={bodyY}
          width={width}
          height={Math.max(bodyHeight, 1)}
          fill={payload.candleColor}
          stroke={payload.candleColor}
          strokeWidth={1}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{data.date}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600">Açılış: <span className="font-medium">${data.open.toFixed(2)}</span></p>
            <p className="text-xs text-gray-600">Yüksek: <span className="font-medium">${data.high.toFixed(2)}</span></p>
            <p className="text-xs text-gray-600">Düşük: <span className="font-medium">${data.low.toFixed(2)}</span></p>
            <p className="text-xs text-gray-600">Kapanış: <span className="font-medium">${data.close.toFixed(2)}</span></p>
            {showVolume && (
              <p className="text-xs text-gray-600">Hacim: <span className="font-medium">{(data.volume / 1000000).toFixed(2)}M</span></p>
            )}
            {data.ma10 && <p className="text-xs text-blue-600">MA10: ${data.ma10.toFixed(2)}</p>}
            {data.ma20 && <p className="text-xs text-orange-600">MA20: ${data.ma20.toFixed(2)}</p>}
            {data.ma50 && <p className="text-xs text-purple-600">MA50: ${data.ma50.toFixed(2)}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{symbol}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
            <span className={`flex items-center text-sm font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-2">
          {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Bollinger Bands */}
          {showBollingerBands && (
            <>
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="upperBand" 
                stroke="#9333ea" 
                strokeWidth={1}
                dot={false}
                name="Upper Band"
              />
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="middleBand" 
                stroke="#6b7280" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Middle Band"
              />
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="lowerBand" 
                stroke="#9333ea" 
                strokeWidth={1}
                dot={false}
                name="Lower Band"
              />
            </>
          )}

          {/* Moving Averages */}
          {showMA && (
            <>
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="ma10" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="MA10"
              />
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="ma20" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                name="MA20"
              />
              {/* @ts-ignore */}
              <Line 
                type="monotone" 
                dataKey="ma50" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                name="MA50"
              />
            </>
          )}

          {/* Volume */}
          {showVolume && (
            // @ts-ignore
            <Bar 
              dataKey="volume" 
              fill="#9ca3af" 
              opacity={0.3}
              yAxisId="volume"
              name="Hacim"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Chart Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input 
              type="checkbox" 
              checked={showMA}
              onChange={(e) => setTimeframe(timeframe)}
              className="rounded"
            />
            <span>Moving Averages</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input 
              type="checkbox" 
              checked={showVolume}
              onChange={(e) => setTimeframe(timeframe)}
              className="rounded"
            />
            <span>Hacim</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input 
              type="checkbox" 
              checked={showBollingerBands}
              onChange={(e) => setTimeframe(timeframe)}
              className="rounded"
            />
            <span>Bollinger Bands</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 ml-2">{(zoomLevel * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
