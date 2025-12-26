import React from 'react'
import { BarChart3, LineChart, PieChart, TrendingUp, Calendar, SlidersHorizontal } from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export type ChartType = 'line' | 'bar' | 'area' | 'pie'

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface ValueRange {
  min: number
  max: number
}

interface ChartControlsProps {
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  valueRange?: ValueRange
  onValueRangeChange?: (range: ValueRange) => void
  showGrid: boolean
  onShowGridChange: (show: boolean) => void
  enableZoom?: boolean
  onEnableZoomChange?: (enable: boolean) => void
}

const ChartControls: React.FC<ChartControlsProps> = ({
  chartType,
  onChartTypeChange,
  dateRange,
  onDateRangeChange,
  valueRange,
  onValueRangeChange,
  showGrid,
  onShowGridChange,
  enableZoom = true,
  onEnableZoomChange
}) => {
  const [showFilters, setShowFilters] = React.useState(false)

  const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
    { value: 'line', label: 'Çizgi', icon: <LineChart className="h-4 w-4" /> },
    { value: 'bar', label: 'Çubuk', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'area', label: 'Alan', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'pie', label: 'Pasta', icon: <PieChart className="h-4 w-4" /> }
  ]

  const quickDatePresets = [
    { label: 'Son 1 Ay', days: 30 },
    { label: 'Son 3 Ay', days: 90 },
    { label: 'Son 6 Ay', days: 180 },
    { label: 'Son 1 Yıl', days: 365 }
  ]

  const applyDatePreset = (days: number) => {
    if (onDateRangeChange) {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      onDateRangeChange({ start, end })
    }
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm font-medium">Grafik Türü:</span>
          <div className="flex space-x-1 bg-gray-700/30 rounded-lg p-1">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onChartTypeChange(type.value)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
                  chartType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title={type.label}
              >
                {type.icon}
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            showFilters
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-700/30 text-gray-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm">Filtreler</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-700/30 rounded-lg p-4 space-y-4 border border-gray-600">
          {/* Date Range Filter */}
          {onDateRangeChange && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Tarih Aralığı</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickDatePresets.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => applyDatePreset(preset.days)}
                    className="px-3 py-1.5 bg-gray-600/50 hover:bg-gray-600 text-gray-300 text-sm rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {dateRange && dateRange.start && dateRange.end && (
                <div className="mt-2 text-xs text-gray-400">
                  Seçili: {format(dateRange.start, 'dd MMMM yyyy', { locale: tr })} - {format(dateRange.end, 'dd MMMM yyyy', { locale: tr })}
                </div>
              )}
            </div>
          )}

          {/* Value Range Filter */}
          {onValueRangeChange && valueRange && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-3 block">
                Değer Aralığı: {valueRange.min.toFixed(0)} - {valueRange.max.toFixed(0)}
              </label>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[valueRange.min, valueRange.max]}
                onValueChange={(values) => {
                  onValueRangeChange({ min: values[0], max: values[1] })
                }}
                min={-100}
                max={100}
                step={1}
                minStepsBetweenThumbs={1}
              >
                <Slider.Track className="bg-gray-600 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-white shadow-md rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Minimum değer"
                />
                <Slider.Thumb
                  className="block w-4 h-4 bg-white shadow-md rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Maximum değer"
                />
              </Slider.Root>
            </div>
          )}

          {/* Display Options */}
          <div className="flex items-center justify-between border-t border-gray-600 pt-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => onShowGridChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300 text-sm">Grid Çizgilerini Göster</span>
            </label>

            {onEnableZoomChange && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableZoom}
                  onChange={(e) => onEnableZoomChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300 text-sm">Zoom Etkin</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartControls
