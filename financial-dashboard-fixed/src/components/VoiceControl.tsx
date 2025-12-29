import React from 'react'
import { Volume2, Play, Pause } from 'lucide-react'
import { useState } from 'react'

interface VoiceControlProps {
  sections?: { id: string; name: string; description: string }[]
  onSectionChange?: (section: string) => void
}

const VoiceControl: React.FC<VoiceControlProps> = ({ 
  sections = [{ id: 'general', name: 'Genel Bakış', description: 'Genel bakış bilgileri' }],
  onSectionChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState<string | null>(null)

  const playSection = (section: { id: string; name: string; description: string }) => {
    // Mevcut ses dosyası varsa durdur
    const currentAudio = document.querySelector('audio#fred-voice') as HTMLAudioElement
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    if (isPlaying && currentSection === section.id) {
      // Oynatmayı durdur
      setIsPlaying(false)
      setCurrentSection(null)
      console.log(`${section.name} oynatmayı durdur`)
    } else {
      // Yeni ses dosyasını oluştur
      const audio = document.createElement('audio')
      audio.id = 'fred-voice'
      audio.style.display = 'none'
      
      // Audio file mapping - FRED ve Turkish Economy
      const audioFiles: { [key: string]: string } = {
        // FRED Audio Files
        'genel-bakis': '/audio/fred_genel_bakis.mp3',
        'faiz-orani': '/audio/fred_faiz_orani.mp3', 
        'gdp': '/audio/fred_gdp.mp3',
        'enflasyon': '/audio/fred_enflasyon.mp3',
        'issizlik': '/audio/fred_issizlik.mp3',
        'tahvil': '/audio/fred_tahvil.mp3',
        
        // Turkish Economy Audio Files
        'turkiye-genel-bakis': '/audio/turkiye_genel_bakis.mp3',
        'turkiye-tcmb_policy_rate': '/audio/turkiye_politika_faizi.mp3',
        'turkiye-tuik_inflation': '/audio/turkiye_enflasyon.mp3',
        'turkiye-tuik_unemployment': '/audio/turkiye_issizlik.mp3',
        'turkiye-usd_try': '/audio/turkiye_doviz_kuru.mp3',
        'turkiye-bist100': '/audio/turkiye_bist100.mp3',
        'turkiye-tuik_gdp_growth': '/audio/turkiye_gsyih.mp3',
        'turkiye-tcmb_reserves': '/audio/turkiye_rezervler.mp3',
        'turkiye-current_account': '/audio/turkiye_cari_acik.mp3',
        
        // Comparison Audio Files
        'karsilastirma-genel-bakis': '/audio/karsilastirma_genel_bakis.mp3',
        'karsilastirma-interest-rate': '/audio/karsilastirma_faiz_orani.mp3',
        'karsilastirma-inflation-rate': '/audio/karsilastirma_enflasyon.mp3',
        'karsilastirma-unemployment-rate': '/audio/karsilastirma_issizlik.mp3',
        'karsilastirma-gdp-growth': '/audio/karsilastirma_gsyih.mp3',
        'karsilastirma-stock-market-index': '/audio/karsilastirma_borsa.mp3',
        'karsilastirma-currency-vs-usd': '/audio/karsilastirma_doviz.mp3'
      }

      // Oynatmaya başla
      setIsPlaying(true)
      setCurrentSection(section.id)
      console.log(`${section.name} sesli açıklaması oynatılıyor: ${section.description}`)
      
      // Section değişikliğini bildir
      if (onSectionChange) {
        onSectionChange(section.id)
      }
      
      // Ses dosyasını yükle ve oynat
      if (audioFiles[section.id]) {
        audio.src = audioFiles[section.id]
        audio.play().catch(console.error)
        
        // Ses bitince durdur
        audio.onended = () => {
          setIsPlaying(false)
          setCurrentSection(null)
        }
        
        // Oynatma hatası durumunda
        audio.onerror = (error) => {
          console.error('Ses oynatma hatası:', error)
          setIsPlaying(false)
          setCurrentSection(null)
        }
      } else {
        // Ses dosyası yoksa sadece simülasyon
        const duration = Math.max(5000, section.description.length * 50)
        setTimeout(() => {
          setIsPlaying(false)
          setCurrentSection(null)
        }, duration)
      }
    }
  }

  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-2 border border-yellow-500/30">
        <Volume2 className={`h-5 w-5 ${
          isPlaying ? 'text-yellow-400 animate-pulse' : 'text-yellow-500'
        }`} />
      </div>
      
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => playSection(section)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
              currentSection === section.id && isPlaying
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
            }`}
            title={section.description}
          >
            {currentSection === section.id && isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span className="hidden md:inline">{section.name}</span>
          </button>
        ))}
        
        {isPlaying && currentSection && (
          <span className="text-gray-400 text-sm animate-pulse">
            Oynatılıyor: {sections.find(s => s.id === currentSection)?.name}
          </span>
        )}
      </div>
    </div>
  )
}

export default VoiceControl
