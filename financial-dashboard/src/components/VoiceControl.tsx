import React from 'react'
import { Volume2 } from 'lucide-react'

interface VoiceControlProps {
  sections?: { id: string; name: string; description: string }[]
  onSectionChange?: (section: string) => void
}

const VoiceControl: React.FC<VoiceControlProps> = ({ 
  sections = [{ id: 'general', name: 'Genel Bakış', description: 'Genel bakış bilgileri' }],
  onSectionChange
}) => {
  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-2 border border-yellow-500/30">
        <Volume2 className="h-5 w-5 text-yellow-500" />
        <span className="text-yellow-400 text-sm ml-2">Sesli özet aktif</span>
      </div>
    </div>
  )
}

export default VoiceControl