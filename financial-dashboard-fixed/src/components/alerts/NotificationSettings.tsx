import React, { useState, useEffect } from 'react'
import { X, Bell, Mail, MessageSquare, Clock, Check } from 'lucide-react'
import { getAlertPreferences, updateAlertPreferences } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import type { AlertPreferences } from '../../types/alerts'

interface NotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { 
    isSupported, 
    permission, 
    subscription, 
    subscribeToPush, 
    sendTestNotification 
  } = usePushNotifications()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<Partial<AlertPreferences>>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    frequency_limit: 10
  })

  useEffect(() => {
    if (user && isOpen) {
      loadPreferences()
    }
  }, [user, isOpen])

  const loadPreferences = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await getAlertPreferences(user.id)
      if (data) {
        setPreferences(data)
      }
    } catch (error) {
      console.error('Tercihler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      await updateAlertPreferences(user.id, preferences)
      alert('Ayarlar başarıyla kaydedildi ✅')
      onClose()
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert('Ayarlar kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleEnablePush = async () => {
    const success = await subscribeToPush()
    if (success) {
      setPreferences({ ...preferences, push_enabled: true })
      alert('Push bildirimleri aktifleştirildi! ✅')
    } else {
      alert('Push bildirimleri aktifleştirilemedi. Tarayıcınız desteklemiyor olabilir veya izin vermediniz.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Bildirim Ayarları</h2>
            <p className="text-purple-100 text-sm mt-1">Bildirim tercihlerinizi yönetin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Yükleniyor...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Bildirim Kanalları */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bildirim Kanalları
              </h3>
              
              <div className="space-y-4">
                {/* Push Notifications */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Bell size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Push Notifications
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Tarayıcı bildirimleri (Gerçek zamanlı)
                        </p>
                        
                        {/* Push Status */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-gray-600 dark:text-gray-400">
                              {isSupported ? 'Destekleniyor' : 'Desteklenmiyor'}
                            </span>
                          </div>
                          
                          {isSupported && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${
                                  permission === 'granted' ? 'bg-green-500' : 
                                  permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />
                                <span className="text-gray-600 dark:text-gray-400">
                                  İzin: {permission === 'granted' ? 'Verildi' : permission === 'denied' ? 'Reddedildi' : 'Bekleniyor'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${subscription ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <span className="text-gray-600 dark:text-gray-400">
                                  Subscription: {subscription ? 'Aktif' : 'Pasif'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {isSupported && permission === 'granted' && (
                          <button
                            onClick={sendTestNotification}
                            className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Test bildirimi gönder
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {isSupported && permission !== 'granted' && (
                        <button
                          onClick={handleEnablePush}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                        >
                          Aktifleştir
                        </button>
                      )}
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.push_enabled ?? false}
                          onChange={(e) => setPreferences({ ...preferences, push_enabled: e.target.checked })}
                          disabled={!isSupported || permission !== 'granted'}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Email Bildirimleri
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Email ile bildirim alın
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.email_enabled ?? false}
                        onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* SMS (Disabled) */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 opacity-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MessageSquare size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          SMS Bildirimleri
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Yakında aktif olacak
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-not-allowed">
                      <input
                        type="checkbox"
                        checked={false}
                        disabled
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessiz Saatler */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Sessiz Saatler
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Bu saatler arasında bildirim almayacaksınız
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Frekans Limiti */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bildirim Limiti
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Günlük maksimum bildirim sayısı
              </p>

              <input
                type="number"
                min="1"
                max="100"
                value={preferences.frequency_limit || 10}
                onChange={(e) => setPreferences({ ...preferences, frequency_limit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationSettings
