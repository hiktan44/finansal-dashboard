import React from 'react'
import { Activity, TrendingUp, TrendingDown, DollarSign, Percent, AlertCircle, Briefcase, Scale } from 'lucide-react'
import { TurkeyEconomicIndicator } from '../lib/supabase'

interface MacroCockpitProps {
    indicators: TurkeyEconomicIndicator[]
}

const MacroCockpit: React.FC<MacroCockpitProps> = ({ indicators }) => {
    // Helper to find indicator by code or partial name
    const findIndicator = (patterns: string[]) => {
        return indicators.find(ind =>
            patterns.some(p =>
                (ind.indicator_code && ind.indicator_code.includes(p)) ||
                (ind.indicator_name && ind.indicator_name.toLowerCase().includes(p.toLowerCase()))
            )
        )
    }

    // Define Key Indicators
    const keyIndicators = [
        {
            title: 'Enflasyon (TÜFE)',
            icon: <Percent className="h-5 w-5 text-red-400" />,
            data: findIndicator(['TR_CPI', 'Tüketici Fiyat', 'TP.FG.J0']),
            format: (val: number) => `%${val.toFixed(2)}`,
            color: 'text-red-400',
            desc: 'Yıllık Tüketici Enflasyonu'
        },
        {
            title: 'Büyüme (GSYİH)',
            icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
            data: findIndicator(['TP.GSYIH', 'Gayrisafi Yurt İçi Hasıla', 'Growth']),
            format: (val: number) => `%${val.toFixed(1)}`,
            color: 'text-blue-400',
            desc: 'Çeyreklik Büyüme'
        },
        {
            title: 'İşsizlik Oranı',
            icon: <Briefcase className="h-5 w-5 text-orange-400" />,
            data: findIndicator(['TR_UNEMP', 'İşsizlik', 'Unemployment']),
            format: (val: number) => `%${val.toFixed(1)}`,
            color: 'text-orange-400',
            desc: 'Mevsimsellikten Arındırılmış'
        },
        {
            title: 'Cari Denge',
            icon: <Scale className="h-5 w-5 text-purple-400" />,
            data: findIndicator(['TR_CURR_ACC', 'Cari İşlemler', 'Current Account']),
            format: (val: number) => `${(val / 1000).toFixed(1)}M USD`, // Assuming raw is M USD or similar, adjusting formatting is tricky without knowing scale
            color: 'text-purple-400',
            desc: 'Aylık Cari Denge'
        },
        {
            title: 'CDS Primi',
            icon: <Activity className="h-5 w-5 text-yellow-400" />,
            data: findIndicator(['TR_CDS', 'CDS']),
            format: (val: number) => `${val.toFixed(0)}`,
            color: 'text-yellow-400',
            desc: '5 Yıllık Kredi Risk Primi'
        },
        {
            title: 'Merkez Bankası Rezervleri',
            icon: <DollarSign className="h-5 w-5 text-green-400" />,
            data: findIndicator(['TR_RES_GOLD', 'Rezerv', 'Reserves']),
            format: (val: number) => `${(val / 1000).toFixed(1)} Mrd USD`,
            color: 'text-green-400',
            desc: 'Brüt Rezervler'
        }
    ]

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Makro-Ekonomik Kokpit</h2>
                    <p className="text-gray-400 text-sm">Türkiye Ekonomisi Temel Göstergeler Özeti</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {keyIndicators.map((item, index) => (
                    <div key={index} className="bg-gray-750/50 p-4 rounded-lg border border-gray-700 group hover:border-gray-600 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{item.title}</span>
                            {item.icon}
                        </div>

                        {item.data ? (
                            <div>
                                <div className={`text-2xl font-bold font-mono py-1 ${item.color}`}>
                                    {item.format(item.data.current_value)}
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
                                    <span className="text-[10px] text-gray-500 truncate max-w-[80px]" title={item.desc}>{item.desc}</span>
                                    {item.data.change_percent !== undefined && (
                                        <div className={`flex items-center text-xs font-medium ${item.data.change_percent > 0 ? 'text-green-400' : item.data.change_percent < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                            {item.data.change_percent > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                            %{Math.abs(item.data.change_percent).toFixed(1)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-gray-600 mt-1 text-right">
                                    {new Date(item.data.period_date).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-20 flex flex-col items-center justify-center text-gray-500 text-xs">
                                <AlertCircle className="h-6 w-6 mb-2 opacity-30" />
                                Veri Bekleniyor
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MacroCockpit
