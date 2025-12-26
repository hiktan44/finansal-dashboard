import React, { useState, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'
import { Volume2, Play, Pause, VolumeX } from 'lucide-react'
import { usePreferencesContext } from '../context/UserPreferencesContext'

const GlobalAudioControl: React.FC = () => {
  const { preferences, updateAudioPreferences } = usePreferencesContext()
  const [showAudioPanel, setShowAudioPanel] = useState(false)

  // Apply volume changes to all audio elements
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      audio.volume = preferences.audio.volume / 100
      audio.muted = preferences.audio.globalMute
    })
  }, [preferences.audio.volume, preferences.audio.globalMute])

  const audioSections = [
    {
      id: 'market_summary',
      label: 'Piyasa Özeti',
      src: '/audio/market_summary.mp3',
      description: 'Genel piyasa performans özeti'
    },
    {
      id: 'stock_indices',
      label: 'Ana Endeksler',
      src: '/audio/stock_indices.mp3',
      description: 'Dow, S&P 500, Nasdaq performansı'
    },
    {
      id: 'tech_giants',
      label: 'Teknoloji Devleri',
      src: '/audio/tech_giants.mp3',
      description: 'Yedi büyük teknoloji hissesi analizi'
    },
    {
      id: 'sector_rotation',
      label: 'Sektör Performansı',
      src: '/audio/sector_rotation.mp3',
      description: 'Tüm sektörlerin yılbaşından bu yana performansı'
    },
    {
      id: 'commodities',
      label: 'Emtialar',
      src: '/audio/commodities.mp3',
      description: 'Altın, ham petrol, kripto para fiyatları'
    }
  ]

  const toggleGlobalMute = () => {
    updateAudioPreferences({ globalMute: !preferences.audio.globalMute })
  }

  const handleVolumeChange = (newVolume: number) => {
    updateAudioPreferences({ volume: newVolume })
  }

  return (
    <div className="relative">
      {/* Genel Ses Kontrolü Butonu */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowAudioPanel(!showAudioPanel)}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-2 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
        >
          <Volume2 className="h-5 w-5 text-yellow-500" />
        </button>
        
        <button
          onClick={toggleGlobalMute}
          className={`p-2 rounded-lg transition-colors ${
            preferences.audio.globalMute 
              ? 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30' 
              : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50'
          }`}
        >
          {preferences.audio.globalMute ? (
            <VolumeX className="h-4 w-4 text-red-500" />
          ) : (
            <Volume2 className="h-4 w-4 text-gray-400" />
          )}
        </button>
        
        <span className="text-gray-400 text-sm hidden md:block">
          Ses Oynatma Kontrolü
        </span>
      </div>

      {/* Ses Kontrol Paneli */}
      {showAudioPanel && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-yellow-500" />
                <span>Ses Oynatma Kontrolü</span>
              </h3>
              <button
                onClick={() => setShowAudioPanel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {audioSections.map(section => (
                <div key={section.id}>
                  <div className="mb-2">
                    <h4 className="text-white text-sm font-medium">{section.label}</h4>
                    <p className="text-gray-400 text-xs">{section.description}</p>
                  </div>
                  <AudioPlayer 
                    audioSrc={section.src}
                    label={section.label}
                    className="mb-2"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Genel Ses Seviyesi: %{preferences.audio.volume}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={preferences.audio.volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  disabled={preferences.audio.globalMute}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Genel Ses Kontrolü</span>
                  <button
                    onClick={toggleGlobalMute}
                    className={`px-2 py-1 rounded transition-colors ${
                      preferences.audio.globalMute 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {preferences.audio.globalMute ? 'Sesi Aç' : 'Tümünü Sessize Al'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalAudioControl
