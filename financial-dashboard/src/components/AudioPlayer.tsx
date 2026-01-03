import React, { useState, useRef, useEffect } from 'react'
import { Volume2, Play, Pause, VolumeX } from 'lucide-react'
import { usePreferencesContext } from '../context/UserPreferencesContext'

interface AudioPlayerProps {
  audioSrc?: string
  text?: string
  label: string
  className?: string
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, text, label, className = '' }) => {
  const { preferences } = usePreferencesContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleLoadedData = () => setIsLoading(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Cleanup generated URL on unmount
  useEffect(() => {
    return () => {
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl)
      }
    }
  }, [generatedAudioUrl])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)

        // If we have text and no generated URL yet (or voice changed? - simpler to just regenerate if text provided)
        // Optimally we should check if text/voice changed. But for now let's just generate if text is present.
        // Actually, if we already generated it, we can reuse it unless voice changed.
        // But implementing voice change detection is extra state.
        // Let's regenerate to be safe and ensure correct voice.

        if (text) {
          const activeVoice = preferences?.audio?.activeVoiceId || 'analist_erkek'
          console.log('Generating audio for:', activeVoice)

          const response = await fetch('http://localhost:3001/api/tts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text,
              voice: activeVoice
            })
          })

          if (!response.ok) throw new Error('TTS Failed')

          const blob = await response.blob()
          const url = URL.createObjectURL(blob)

          // Revoke old url
          if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl)
          setGeneratedAudioUrl(url)

          audio.src = url
          // Wait for load? audio.play() usually handles it.
        }

        // If no text, we assume src is already set via props or previous generation

        await audio.play()
        setIsPlaying(true)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Ses oynatma hatası:', error)
      setIsLoading(false)
      // Fallback to browser TTS if desired?
      if (text && window.speechSynthesis) {
        // Simple fallback
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'tr-TR'
        window.speechSynthesis.speak(utterance)
        // We can't easily sync state with window.speechSynthesis without more logic
      }
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Ses seviyesini ayarla
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`audio-player bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600 ${className}`}>
      <audio
        ref={audioRef}
        src={generatedAudioUrl || audioSrc}
        preload="metadata"
        muted={isMuted}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-yellow-500" />
          <span className="text-white text-sm font-medium">{label}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-gray-600/50 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-3 w-3 text-gray-400" />
            ) : (
              <Volume2 className="h-3 w-3 text-yellow-500" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 bg-gray-600 rounded-lg appearance-none slider"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : isPlaying
                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500'
            }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          {/* Progress Bar */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none slider"
              style={{
                background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${progressPercentage}%, #4B5563 ${progressPercentage}%, #4B5563 100%)`
              }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      {isPlaying && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs">Oynatılıyor...</span>
        </div>
      )}
    </div>
  )
}

export default AudioPlayer
