import React, { useState } from 'react'
import { ArrowUp, ArrowDown, ExternalLink, Info } from 'lucide-react'
import { SectorIndex } from '../lib/supabase'

interface SectorHeatmapProps {
    data: SectorIndex[]
}

const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ data }) => {
    const [selectedSector, setSelectedSector] = useState<SectorIndex | null>(null)

    // Sort by performance (descending)
    const sortedData = [...data].sort((a, b) => b.change_percent - a.change_percent)

    const getHeatmapColor = (change: number) => {
        if (change >= 3) return 'bg-green-600'
        if (change >= 1) return 'bg-green-700'
        if (change > 0) return 'bg-green-800'
        if (change === 0) return 'bg-gray-700'
        if (change > -1) return 'bg-red-900/80' // Darker red/brownish
        if (change > -3) return 'bg-red-700'
        return 'bg-red-600'
    }

    const getBoxSize = (change: number) => {
        // Optional: Make larger movers bigger? For now, keep uniform for cleaner grid.
        return 'col-span-1 row-span-1'
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-64 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Sektör verisi bulunamadı veya yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 w-2 h-6 rounded-full"></span>
                        Sektörel Isı Haritası
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 ml-4">
                        BIST Sektör Endeksleri Anlık Performans
                    </p>
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-600 rounded-sm"></div> Güçlü Pozitif</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Güçlü Negatif</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 auto-rows-[100px]">
                {sortedData.map((sector) => (
                    <div
                        key={sector.symbol}
                        onClick={() => setSelectedSector(sector)}
                        className={`
              relative p-4 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:z-10
              ${getHeatmapColor(sector.change_percent)}
              border border-white/5 flex flex-col justify-between overflow-hidden group
            `}
                    >
                        {/* Background Gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20 pointer-events-none"></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <span className="font-bold text-white text-md tracking-wide drop-shadow-md">{sector.symbol}</span>
                            <ExternalLink className="h-3 w-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="relative z-10">
                            <div className="text-xs text-white/80 font-medium truncate mb-1" title={sector.name}>{sector.name}</div>
                            <div className="flex items-end items-center gap-1">
                                <span className="text-xl font-bold text-white leading-none drop-shadow-sm">
                                    %{Math.abs(sector.change_percent).toFixed(2)}
                                </span>
                                {sector.change_percent !== 0 && (
                                    sector.change_percent > 0
                                        ? <ArrowUp className="h-4 w-4 text-white animate-pulse" />
                                        : <ArrowDown className="h-4 w-4 text-white animate-pulse" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal/Overlay */}
            {selectedSector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSector(null)}>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">{selectedSector.name}</h3>
                                <span className="text-blue-400 font-mono text-sm">{selectedSector.symbol}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${selectedSector.change_percent >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                {selectedSector.change_percent >= 0 ? '+' : ''}%{selectedSector.change_percent.toFixed(2)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-gray-400">Son Fiyat</span>
                                <span className="text-white font-mono text-lg">{selectedSector.last_price.toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-gray-400">Değişim (Puan)</span>
                                <span className={`font-mono ${selectedSector.change_value && selectedSector.change_value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {selectedSector.change_value?.toLocaleString('tr-TR')}
                                </span>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-gray-400">Son Güncelleme</span>
                                <span className="text-gray-300 text-sm">
                                    {new Date(selectedSector.data_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedSector(null)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SectorHeatmap
