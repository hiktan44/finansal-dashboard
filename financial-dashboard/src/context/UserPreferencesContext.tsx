import React, { createContext, useContext, ReactNode } from 'react'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { UserPreferences, SyncStatus } from '../types/preferences'

interface UserPreferencesContextType {
  preferences: UserPreferences
  syncStatus: SyncStatus
  updatePreferences: (updates: Partial<UserPreferences>) => void
  savePreferences: () => Promise<boolean>
  resetPreferences: () => void
  exportPreferences: () => void
  importPreferences: (file: File) => Promise<boolean>
  updateChartPreferences: (updates: Partial<UserPreferences['chart']>) => void
  updateAudioPreferences: (updates: Partial<UserPreferences['audio']>) => void
  updateVisualPreferences: (updates: Partial<UserPreferences['visual']>) => void
  updateLayoutPreferences: (updates: Partial<UserPreferences['layout']>) => void
  updateDataPreferences: (updates: Partial<UserPreferences['data']>) => void
  updateWidgetPreferences: (widgetId: string, updates: Partial<UserPreferences['widgets'][0]>) => void
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

interface UserPreferencesProviderProps {
  children: ReactNode
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const preferencesHook = useUserPreferences()

  return (
    <UserPreferencesContext.Provider value={preferencesHook}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export const usePreferencesContext = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('usePreferencesContext must be used within UserPreferencesProvider')
  }
  return context
}
