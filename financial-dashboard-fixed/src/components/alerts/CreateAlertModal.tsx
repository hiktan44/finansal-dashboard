import React, { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Activity, Volume2, Sparkles } from 'lucide-react'
import { createAlert, getAlertAnalysis } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { AlertType, AlertCondition, NotificationChannel, CreateAlertInput, AlertAnalysis } from '../../types/alerts'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultSymbol?: string
}

const CreateAlertModal: React.FC<CreateAlertModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultSymbol = ''
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AlertAnalysis | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  const [formData, setFormData] = useState<CreateAlertInput>({
    symbol: defaultSymbol,
    alert_type: 'price_target',
    condition: 'above',
    threshold: 0,
    notification_method: ['push'],
    notes: ''
  })

  useEffect(() => {
    if (defaultSymbol) {
      setFormData(prev => ({ ...prev, symbol: defaultSymbol }))
      loadAnalysis(defaultSymbol)
    }
  }, [defaultSymbol])

  const loadAnalysis = async (symbol: string) => {
    if (!symbol) return
    
    setLoadingAnalysis(true)
    try {
      const data = await getAlertAnalysis(symbol)
      setAnalysis(data)
      
      // Akıllı öneriden threshold otomatik doldur
      if (data && data.smartAlertSuggestions.length > 0) {
        const suggestion = data.smartAlertSuggestions[0]
        setFormData(prev => ({
          ...prev,
          threshold: Math.round(suggestion.suggestedThreshold * 100) / 100
        }))
      }
    } catch (error) {
      console.error('Analiz yüklenemedi:', error)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Alarm oluşturmak için giriş yapmalısınız')
      return
    }

    setLoading(true)
    try {
      await createAlert(user.id, formData)
      alert('Alarm başarıyla oluşturuldu! ✅')
      onSuccess()
      onClose()
      
      // Formu sıfırla
      setFormData({
        symbol: '',
        alert_type: 'price_target',
        condition: 'above',
        threshold: 0,
        notification_method: ['push'],
        notes: ''
      })
      setAnalysis(null)
    } catch (error) {
      console.error('Alarm oluşturma hatası:', error)
      alert('Alarm oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSymbolBlur = () => {
    if (formData.symbol && formData.symbol !== defaultSymbol) {
      loadAnalysis(formData.symbol)
    }
  }

  const alertTypeOptions = [
    { value: 'price_target', label: 'Fiyat Hedefi', icon: TrendingUp },
    { value: 'percentage_change', label: 'Yüzde Değişim', icon: Activity },
    { value: 'volume_spike', label: 'Hacim Artışı', icon: Volume2 },
    { value: 'volatility', label: 'Volatilite', icon: Sparkles }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Yeni Alarm Oluştur</h2>
            <p className="text-purple-100 text-sm mt-1">Fiyat hareketlerini takip edin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sembol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hisse Senedi Sembolü
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              onBlur={handleSymbolBlur}
              placeholder="AAPL, TSLA, NVDA..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Akıllı Analiz */}
          {loadingAnalysis && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-700 dark:text-blue-300 text-sm">Analiz ediliyor...</p>
            </div>
          )}

          {analysis && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                Akıllı Öneriler
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-600 dark:text-gray-400">Güncel Fiyat</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${analysis.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-600 dark:text-gray-400">Volatilite</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {analysis.volatility.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-600 dark:text-gray-400">Trend</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                    {analysis.trend === 'bullish' ? '🟢 Yükseliş' : analysis.trend === 'bearish' ? '🔴 Düşüş' : '⚪ Nötr'}
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-600 dark:text-gray-400">Direnç</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${analysis.supportResistance.resistance.toFixed(2)}
                  </p>
                </div>
              </div>

              {analysis.smartAlertSuggestions.length > 0 && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 {analysis.smartAlertSuggestions[0].message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {analysis.smartAlertSuggestions[0].reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Alarm Türü */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alarm Türü
            </label>
            <div className="grid grid-cols-2 gap-3">
              {alertTypeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, alert_type: value as AlertType })}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.alert_type === value
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Koşul ve Eşik */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Koşul
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as AlertCondition })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="above">Üstünde</option>
                <option value="below">Altında</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eşik Değeri
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Bildirim Kanalları */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bildirim Yöntemleri
            </label>
            <div className="space-y-2">
              {[
                { value: 'push', label: 'Push Notification' },
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS (yakında)' }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notification_method.includes(value as NotificationChannel)}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...formData.notification_method, value as NotificationChannel]
                        : formData.notification_method.filter(m => m !== value)
                      setFormData({ ...formData, notification_method: methods })
                    }}
                    disabled={value === 'sms'}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notlar (Opsiyonel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Bu alarm için notlarınız..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.symbol || !formData.threshold || formData.notification_method.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Oluşturuluyor...' : 'Alarm Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAlertModal
