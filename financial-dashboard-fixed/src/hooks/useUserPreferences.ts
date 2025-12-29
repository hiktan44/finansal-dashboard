import { useState, useEffect, useCallback } from 'react'
import { UserPreferences, DEFAULT_PREFERENCES, SyncStatus } from '../types/preferences'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'financial-dashboard-preferences'
const DEBOUNCE_DELAY = 1000 // 1 saniye

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    hasPendingChanges: false
  })
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // LocalStorage'dan tercihleri yükle
  const loadFromLocalStorage = useCallback((): UserPreferences | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_PREFERENCES, ...parsed }
      }
    } catch (error) {
      console.error('LocalStorage okuma hatası:', error)
    }
    return null
  }, [])

  // LocalStorage'a tercihleri kaydet
  const saveToLocalStorage = useCallback((prefs: UserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
      return true
    } catch (error) {
      console.error('LocalStorage yazma hatası:', error)
      return false
    }
  }, [])

  // Supabase'den tercihleri yükle
  const loadFromSupabase = useCallback(async (userId?: string): Promise<UserPreferences | null> => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Kayıt bulunamadı, default preferences döndür
          return null
        }
        throw error
      }

      if (data && data.preferences) {
        return {
          ...DEFAULT_PREFERENCES,
          ...data.preferences,
          userId: data.user_id,
          lastUpdated: data.updated_at
        }
      }
    } catch (error) {
      console.error('Supabase okuma hatası:', error)
      setSyncStatus(prev => ({
        ...prev,
        syncError: 'Cloud tercihleri yüklenemedi'
      }))
    }
    return null
  }, [])

  // Supabase'e tercihleri kaydet
  const saveToSupabase = useCallback(async (prefs: UserPreferences): Promise<boolean> => {
    if (!prefs.userId) return false

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }))

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: prefs.userId,
          preferences: prefs,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date(),
        syncError: null,
        hasPendingChanges: false
      })

      return true
    } catch (error) {
      console.error('Supabase yazma hatası:', error)
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: 'Cloud senkronizasyonu başarısız'
      }))
      return false
    }
  }, [])

  // İlk yükleme
  useEffect(() => {
    const initialize = async () => {
      // Önce localStorage'dan yükle
      const localPrefs = loadFromLocalStorage()
      if (localPrefs) {
        setPreferences(localPrefs)
      }

      // Eğer userId varsa Supabase'den yükle
      if (localPrefs?.userId) {
        const cloudPrefs = await loadFromSupabase(localPrefs.userId)
        if (cloudPrefs) {
          // Cloud verisi daha yeniyse onu kullan
          const localDate = new Date(localPrefs.lastUpdated)
          const cloudDate = new Date(cloudPrefs.lastUpdated)
          
          if (cloudDate > localDate) {
            setPreferences(cloudPrefs)
            saveToLocalStorage(cloudPrefs)
          }
        }
      }
    }

    initialize()
  }, [loadFromLocalStorage, loadFromSupabase, saveToLocalStorage])

  // Tercihleri güncelle (debounced otomatik kayıt)
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated: UserPreferences = {
        ...prev,
        ...updates,
        lastUpdated: new Date().toISOString()
      }

      // LocalStorage'a hemen kaydet
      saveToLocalStorage(updated)

      // Supabase'e debounced kayıt
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }

      const timeout = setTimeout(() => {
        saveToSupabase(updated)
      }, DEBOUNCE_DELAY)

      setSaveTimeout(timeout)
      setSyncStatus(prev => ({ ...prev, hasPendingChanges: true }))

      return updated
    })
  }, [saveToLocalStorage, saveToSupabase, saveTimeout])

  // Manuel kaydetme
  const savePreferences = useCallback(async () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      setSaveTimeout(null)
    }

    saveToLocalStorage(preferences)
    
    if (preferences.userId) {
      return await saveToSupabase(preferences)
    }
    
    return true
  }, [preferences, saveToLocalStorage, saveToSupabase, saveTimeout])

  // Tercihleri sıfırla
  const resetPreferences = useCallback(() => {
    const reset = {
      ...DEFAULT_PREFERENCES,
      userId: preferences.userId,
      lastUpdated: new Date().toISOString()
    }
    
    setPreferences(reset)
    saveToLocalStorage(reset)
    
    if (preferences.userId) {
      saveToSupabase(reset)
    }
  }, [preferences.userId, saveToLocalStorage, saveToSupabase])

  // Tercihleri dışa aktar
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `financial-dashboard-preferences-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [preferences])

  // Tercihleri içe aktar
  const importPreferences = useCallback((file: File) => {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          const validated = { ...DEFAULT_PREFERENCES, ...imported }
          
          setPreferences(validated)
          saveToLocalStorage(validated)
          
          if (validated.userId) {
            saveToSupabase(validated).then(resolve).catch(reject)
          } else {
            resolve(true)
          }
        } catch (error) {
          reject(new Error('Geçersiz ayar dosyası'))
        }
      }
      
      reader.onerror = () => reject(new Error('Dosya okuma hatası'))
      reader.readAsText(file)
    })
  }, [saveToLocalStorage, saveToSupabase])

  // Spesifik tercih güncellemeleri için yardımcı fonksiyonlar
  const updateChartPreferences = useCallback((updates: Partial<UserPreferences['chart']>) => {
    updatePreferences({
      chart: { ...preferences.chart, ...updates }
    })
  }, [preferences.chart, updatePreferences])

  const updateAudioPreferences = useCallback((updates: Partial<UserPreferences['audio']>) => {
    updatePreferences({
      audio: { ...preferences.audio, ...updates }
    })
  }, [preferences.audio, updatePreferences])

  const updateVisualPreferences = useCallback((updates: Partial<UserPreferences['visual']>) => {
    updatePreferences({
      visual: { ...preferences.visual, ...updates }
    })
  }, [preferences.visual, updatePreferences])

  const updateLayoutPreferences = useCallback((updates: Partial<UserPreferences['layout']>) => {
    updatePreferences({
      layout: { ...preferences.layout, ...updates }
    })
  }, [preferences.layout, updatePreferences])

  const updateDataPreferences = useCallback((updates: Partial<UserPreferences['data']>) => {
    updatePreferences({
      data: { ...preferences.data, ...updates }
    })
  }, [preferences.data, updatePreferences])

  const updateWidgetPreferences = useCallback((widgetId: string, updates: Partial<UserPreferences['widgets'][0]>) => {
    const updatedWidgets = preferences.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    )
    updatePreferences({ widgets: updatedWidgets })
  }, [preferences.widgets, updatePreferences])

  return {
    preferences,
    syncStatus,
    updatePreferences,
    savePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,
    updateChartPreferences,
    updateAudioPreferences,
    updateVisualPreferences,
    updateLayoutPreferences,
    updateDataPreferences,
    updateWidgetPreferences
  }
}
