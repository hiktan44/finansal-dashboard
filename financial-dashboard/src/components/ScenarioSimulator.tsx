import React, { useState } from 'react'
import { Brain, ArrowRight, Play, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface SimulationResult {
    summary: string
    predictions: Array<{
        asset: string
        predictedChange: string | number
        confidence: number
        reasoning: string
    }>
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
}

const ScenarioSimulator: React.FC = () => {
    const [scenarioInput, setScenarioInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SimulationResult | null>(null)

    // Pre-defined quick scenarios
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const quickScenarios = [
        "Dolar/TL kuru 40.00 seviyesine çıkarsa borsa nasıl etkilenir?",
        "Merkez Bankası faizleri %5 puan indirirse ne olur?",
        "Petrol fiyatları 100 doları aşarsa Türkiye ekonomisi nasıl tepki verir?",
        "Altın ons fiyatı 3000 dolar olursa gram altın ne kadar olur?"
    ]

    const handleSimulate = async () => {
        if (!scenarioInput.trim()) return
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch(`${API_URL}/api/analysis/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario: scenarioInput })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setResult(data)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                    <Brain className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">"What-If" Senaryo Simülatörü</h2>
                    <p className="text-gray-400 text-sm">Yapay Zeka Destekli Etki Analizi</p>
                </div>
            </div>

            {/* Input Section */}
            <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Simülasyon Senaryosu</label>
                    <div className="relative">
                        <textarea
                            value={scenarioInput}
                            onChange={(e) => setScenarioInput(e.target.value)}
                            placeholder="Örn: Dolar/TL 40 olursa..."
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] resize-none"
                        />
                        <button
                            onClick={handleSimulate}
                            disabled={loading || !scenarioInput.trim()}
                            className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                        >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            Analiz Et
                        </button>
                    </div>
                </div>

                {/* Quick Scenarios */}
                <div className="flex flex-wrap gap-2">
                    {quickScenarios.map((sc, i) => (
                        <button
                            key={i}
                            onClick={() => setScenarioInput(sc)}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-gray-600"
                        >
                            {sc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className={`h-5 w-5 ${result.riskLevel === 'Critical' || result.riskLevel === 'High' ? 'text-red-500' :
                                result.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                }`} />
                            <h3 className="text-white font-semibold">Simülasyon Sonucu</h3>
                            <span className={`ml-auto text-xs font-bold px-2 py-1 rounded ${result.riskLevel === 'Critical' || result.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                                result.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                Risk Seviyesi: {result.riskLevel}
                            </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {result.summary}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Tahmini Piyasa Etkileri</h4>
                        {result.predictions.map((pred, i) => (
                            <div key={i} className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium">{pred.asset}</span>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">%{pred.confidence} Güven</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{pred.reasoning}</p>
                                </div>

                                <div className={`text-right pl-4 border-l border-gray-700 ml-4 min-w-[80px] ${(typeof pred.predictedChange === 'string' && pred.predictedChange.includes('-')) || (typeof pred.predictedChange === 'number' && pred.predictedChange < 0) ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                    <div className="text-lg font-bold flex items-center justify-end gap-1">
                                        {/* Handle both string and number display */}
                                        {typeof pred.predictedChange === 'number' && pred.predictedChange > 0 ? '+' : ''}
                                        {pred.predictedChange}
                                        {typeof pred.predictedChange === 'number' ? '%' : ''}
                                        {(typeof pred.predictedChange === 'string' && pred.predictedChange.includes('+')) || (typeof pred.predictedChange === 'number' && pred.predictedChange > 0) ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 mt-4">
                            * Bu sonuçlar yapay zeka tarafından üretilen hipotetik senaryolardır. Yatırım tavsiyesi değildir.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScenarioSimulator
