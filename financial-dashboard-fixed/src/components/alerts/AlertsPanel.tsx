import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Plus, Trash2, Edit2, TrendingUp, TrendingDown, Activity, Volume2, Sparkles, RefreshCw } from 'lucide-react'
import { getUserAlerts, deleteAlert, updateAlert, getAlertTriggers } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import CreateAlertModal from './CreateAlertModal'
import NotificationSettings from './NotificationSettings'
import type { UserAlert, AlertTrigger } from '../../types/alerts'

const AlertsPanel: React.FC = () => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<UserAlert[]>([])
  const [triggers, setTriggers] = useState<AlertTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [alertsData, triggersData] = await Promise.all([
        getUserAlerts(user.id),
        getAlertTriggers(user.id, 50)
      ])
      setAlerts(alertsData)
      setTriggers(triggersData)
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await updateAlert(alertId, { is_active: !isActive })
      await loadData()
    } catch (error) {
      console.error('Alarm güncelleme hatası:', error)
      alert('Alarm güncellenirken hata oluştu')
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Bu alarmı silmek istediğinizden emin misiniz?')) return

    try {
      await deleteAlert(alertId)
      await loadData()
    } catch (error) {
      console.error('Alarm silme hatası:', error)
      alert('Alarm silinirken hata oluştu')
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_target': return <TrendingUp size={18} />
      case 'percentage_change': return <Activity size={18} />
      case 'volume_spike': return <Volume2 size={18} />
      case 'volatility': return <Sparkles size={18} />
      default: return <Bell size={18} />
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_target': return 'Fiyat Hedefi'
      case 'percentage_change': return 'Yüzde Değişim'
      case 'volume_spike': return 'Hacim Artışı'
      case 'volatility': return 'Volatilite'
      default: return type
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <Bell size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Alarm Sistemi
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Alarmları kullanmak için giriş yapmalısınız
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Alarm Sistemi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Fiyat hareketlerini takip edin ve bildirim alın
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Bell size={18} />
                <span>Bildirim Ayarları</span>
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                <span>Yenile</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                <span>Yeni Alarm</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Aktif Alarmlar ({alerts.filter(a => a.is_active).length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tetikleme Geçmişi ({triggers.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Yükleniyor...</p>
          </div>
        ) : activeTab === 'active' ? (
          /* Aktif Alarmlar */
          <div className="grid gap-4">
            {alerts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <Bell size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Henüz alarm oluşturmadınız
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  İlk alarmınızı oluşturun ve fiyat hareketlerini takip edin
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>İlk Alarmımı Oluştur</span>
                </button>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all ${
                    alert.is_active ? 'border-l-4 border-green-500' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          {getAlertTypeIcon(alert.alert_type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {alert.symbol}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getAlertTypeLabel(alert.alert_type)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Koşul</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.condition === 'above' ? '🔼 Üstünde' : '🔽 Altında'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Eşik</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.threshold}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Bildirim</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.notification_method.join(', ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Durum</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.is_active ? '✅ Aktif' : '⏸️ Duraklatıldı'}
                          </p>
                        </div>
                      </div>

                      {alert.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                          "{alert.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={alert.is_active ? 'Duraklat' : 'Aktifleştir'}
                      >
                        {alert.is_active ? <BellOff size={18} /> : <Bell size={18} />}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Tetikleme Geçmişi */
          <div className="grid gap-4">
            {triggers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <Activity size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Henüz tetiklenen alarm yok
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Alarmlarınız koşulları karşıladığında burada görünecek
                </p>
              </div>
            ) : (
              triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {trigger.symbol}
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Tetiklenme Değeri</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {trigger.trigger_value.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Güncel Fiyat</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ${trigger.current_price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Tarih</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(trigger.triggered_at).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAlertModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadData}
        />
      )}

      {showSettings && (
        <NotificationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default AlertsPanel
