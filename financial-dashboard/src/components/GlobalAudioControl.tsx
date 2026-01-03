import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Volume2, Play, Pause, Settings, Mic2, User, Loader2, Radio } from 'lucide-react'
import { usePreferencesContext } from '../context/UserPreferencesContext'

interface GlobalAudioControlProps {
  summaryData?: any
  allData?: any
}

interface Voice {
  id: string
  name: string
  gender: string
  description?: string
}

const GlobalAudioControl: React.FC<GlobalAudioControlProps> = ({ summaryData, allData }) => {
  const { preferences, updateAudioPreferences } = usePreferencesContext()
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])

  // Use global preference for selected voice
  const selectedVoiceId = preferences.audio.activeVoiceId || 'analist_erkek'
  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || voices[0]

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorV, setErrorV] = useState<string | null>(null)

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Refs for positioning
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, right: 0 })

  // Calculate position when opening
  useEffect(() => {
    if (showSettingsPanel && settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect()
      // Position bottom-right aligned with button
      setPopupPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [showSettingsPanel])

  // Fallback voices if backend fails
  const fallbackVoices: Voice[] = [
    { id: 'analist_erkek', name: 'Baş Analist (Erkek)', gender: 'male', description: 'Otoriter ve net (Varsayılan)' },
    { id: 'analist_kadin', name: 'Baş Analist (Kadın)', gender: 'female', description: 'Enerjik ve akıcı' },
    { id: 'gazeteci', name: 'Haber Spikeri', gender: 'neutral', description: 'Tarafsız ve net' },
    { id: 'tv_muhabiri_erkek', name: 'TV Muhabiri (Erkek)', gender: 'male', description: 'Sahadan bildiren' },
    { id: 'tv_muhabiri_kadin', name: 'TV Muhabiri (Kadın)', gender: 'female', description: 'Sahadan bildiren' },
    { id: 'google_analist_erkek', name: 'Gemini - Analist (Erkek)', gender: 'male', description: 'Google Wavenet Teknolojisi' },
    { id: 'google_analist_kadin', name: 'Gemini - Analist (Kadın)', gender: 'female', description: 'Google Wavenet Teknolojisi' }
  ]

  useEffect(() => {
    // Backend'den profesyonel sesleri çek
    const loadVoices = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/tts/voices')
        if (!res.ok) throw new Error('Backend error')
        const data = await res.json()
        if (data.voices && data.voices.length > 0) {
          setVoices(data.voices)
        } else {
          // Use fallback if response empty
          setVoices(fallbackVoices)
        }
      } catch (error) {
        console.error('Sesler yüklenemedi, varsayılanlar kullanılıyor:', error)
        setVoices(fallbackVoices)
      }
    }
    loadVoices()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const generateSpeechText = (): string => {
    if (!allData && !summaryData) return "Veri yükleniyor veya özet bulunamadı."

    // Priority 1: Use specific summaryData note if available (legacy support)
    let text = summaryData?.market_note || "";

    // Priority 2: Construct comprehensive summary from allData if available
    if (allData) {
      const parts = [];

      // Market Summary Headline
      if (allData.summary?.marketSummary?.headline) {
        parts.push(`Piyasa Özeti: ${allData.summary.marketSummary.headline}.`);
      }

      // Indices
      if (allData.indices?.indices?.length > 0) {
        const indexSummary = allData.indices.indices.slice(0, 3).map((idx: any) =>
          `${idx.name} ${idx.changePercent >= 0 ? 'yüzde ' + idx.changePercent + ' artışla' : 'yüzde ' + Math.abs(idx.changePercent) + ' düşüşle'} işlem görüyor`
        ).join(', ');
        parts.push(`Ana Endekslerde son durum: ${indexSummary}.`);
      }

      // Tech Giants Summary (Top mover)
      if (allData.techGiants?.companies?.length > 0) {
        const topMover = allData.techGiants.companies.reduce((max: any, curr: any) =>
          Math.abs(curr.changePercent) > Math.abs(max.changePercent) ? curr : max
          , allData.techGiants.companies[0]);
        parts.push(`Teknoloji tarafında, ${topMover.name} hissesi yüzde ${topMover.changePercent.toFixed(2)} ile günün en hareketli hisselerinden biri.`);
      }

      // Commodities (Gold/Oil)
      if (allData.commodities?.commodities?.length > 0) {
        const gold = allData.commodities.commodities.find((c: any) => c.symbol === 'GC=F' || c.symbol === 'GOLD');
        if (gold) {
          parts.push(`Emtia piyasasında Altın, ${gold.price} dolar seviyesindedir.`);
        }
      }

      // If we have constructed new parts, use them. Otherwise fallback to existing text.
      if (parts.length > 0) {
        text = parts.join(' ');
      }
    }

    return text || "Piyasa özeti verisi mevcut değil.";
  }

  const speakWithBrowser = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'tr-TR'
      utterance.volume = preferences.audio.globalMute ? 0 : preferences.audio.volume / 100

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsLoading(false)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setIsLoading(false)
      }
      utterance.onerror = (e) => {
        console.error("Browser TTS Error", e)
        setErrorV("Tarayıcı sesi hatası")
        setIsSpeaking(false)
        setIsLoading(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      setErrorV("Tarayıcı ses desteği yok")
      setIsLoading(false)
    }
  }

  const togglePlayback = async () => {
    // Stop if playing
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      return
    }

    // Start playing
    setIsLoading(true)
    setErrorV(null)
    const text = generateSpeechText()

    try {
      const res = await fetch('http://localhost:3001/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: selectedVoiceId // Use global preference ID
        })
      })

      if (!res.ok) throw new Error('Backend failed')

      const data = await res.json()

      if (data.url) {
        if (audioRef.current) {
          audioRef.current.pause()
        }

        const audio = new Audio(data.url)
        audioRef.current = audio
        audio.volume = preferences.audio.globalMute ? 0 : preferences.audio.volume / 100

        audio.onended = () => {
          setIsSpeaking(false)
          setIsLoading(false)
        }

        audio.onerror = (e) => {
          console.error("Audio Playback Error", e)
          // Fallback to browser on audio load error if logical
          setErrorV("Oynatma hatası")
          setIsLoading(false)
          setIsSpeaking(false)
        }

        await audio.play()
        setIsSpeaking(true)
        setIsLoading(false)
      } else {
        throw new Error('Ses URL alınamadı')
      }

    } catch (error) {
      console.warn('TTS Backend Hatası, tarayıcı sesi kullanılıyor:', error)
      // Fallback to browser TTS
      speakWithBrowser(text)
    }
  }

  const handleVoiceSelect = (voice: Voice) => {
    updateAudioPreferences({ activeVoiceId: voice.id }) // Update global preference
    setShowSettingsPanel(false) // Close popup on selection

    // Optional: Stop current playback if voice changes
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="relative z-[1000] flex items-center gap-2">
      {/* Play/Pause Button - Fixed on Bar */}
      <button
        onClick={togglePlayback}
        disabled={isLoading}
        className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg border transition - all ${isSpeaking
            ? 'bg-green-500/20 border-green-500/50 text-green-400'
            : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-200'
          } `}
        title="Piyasa Özetini Oku"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
        ) : isSpeaking ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
        <span className="text-sm font-medium hidden md:block">
          {isSpeaking ? 'Durdur' : 'Dinle'}
        </span>
      </button>

      {/* Settings Toggle - Opens Popup */}
      <button
        ref={settingsButtonRef}
        onClick={() => setShowSettingsPanel(!showSettingsPanel)}
        className={`p - 2 rounded - lg border transition - colors ${showSettingsPanel
            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
            : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700'
          } `}
        title="Ses Ayarları"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Voice Selection Popup - Portal to Body to avoid clipping */}
      {showSettingsPanel && createPortal(
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-[99998] cursor-default bg-transparent"
            onClick={() => setShowSettingsPanel(false)}
          />
          <div
            className="fixed z-[99999] w-80 bg-gray-900 shadow-2xl rounded-xl border border-gray-700 overflow-hidden flex flex-col max-h-[80vh]"
            style={{
              top: popupPosition.top,
              right: popupPosition.right
            }}
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Mic2 className="h-4 w-4 text-indigo-400" />
                Asistan Sesi Seçimi
              </h3>
              <button
                onClick={() => setShowSettingsPanel(false)}
                className="text-gray-500 hover:text-white"
              >
                <span className="sr-only">Kapat</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar">
              {voices.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice)}
                  className={`w - full text - left px - 4 py - 3 rounded - lg flex items - center justify - between group transition - colors ${selectedVoiceId === voice.id
                      ? 'bg-indigo-600/20 border border-indigo-500/30'
                      : 'hover:bg-gray-800 border border-transparent'
                    } `}
                >
                  <div>
                    <div className={`font - medium ${selectedVoiceId === voice.id ? 'text-indigo-400' : 'text-gray-200'} `}>
                      {voice.name}
                    </div>
                    {voice.description && (
                      <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400">
                        {voice.description}
                      </div>
                    )}
                  </div>
                  {selectedVoiceId === voice.id && (
                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-800/50 text-xs text-center text-gray-500 border-t border-gray-800">
              Seçim yapıldığında pencere otomatik kapanır.
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

export default GlobalAudioControl
