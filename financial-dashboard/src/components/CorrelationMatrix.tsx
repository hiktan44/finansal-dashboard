import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, Info } from 'lucide-react';

const CorrelationMatrix: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchCorrelations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/analysis/correlations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbols: ['XU100.IS', 'USDTRY=X', 'GC=F', '^GSPC', 'BTC-USD', 'CL=F'],
                    period: 90
                })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);
            setData(result);
        } catch (err: any) {
            console.error('Correlation error:', err);
            setError('Veri hesaplanamadı veya yetersiz veri.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCorrelations();
    }, []);

    const getColor = (value: number) => {
        // -1 (Red) -> 0 (Gray) -> 1 (Green)
        if (value === 1) return 'bg-purple-600 text-white';
        if (value > 0.7) return 'bg-green-600 text-white';
        if (value > 0.3) return 'bg-green-600/50 text-white';
        if (value > 0) return 'bg-green-600/20 text-gray-300';
        if (value === 0) return 'bg-gray-700/50 text-gray-400';
        if (value > -0.3) return 'bg-red-600/20 text-gray-300';
        if (value > -0.7) return 'bg-red-600/50 text-white';
        return 'bg-red-600 text-white';
    };

    const formatSymbol = (s: string) => {
        const map: Record<string, string> = {
            'XU100.IS': 'BIST 100',
            'USDTRY=X': 'USD/TRY',
            'GC=F': 'Altın',
            '^GSPC': 'S&P 500',
            'BTC-USD': 'Bitcoin',
            'CL=F': 'Petrol'
        };
        return map[s] || s;
    };

    const symbols = data?.matrix ? Object.keys(data.matrix) : [];

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Network className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Korelasyon Matriksi</h3>
                        <p className="text-gray-400 text-xs">Varlıkların birbiriyle ilişkisi (Son 90 Gün)</p>
                    </div>
                </div>
                <button
                    onClick={fetchCorrelations}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-6">
                {error ? (
                    <div className="text-red-400 text-center text-sm p-4 bg-red-500/10 rounded-lg">
                        {error}
                    </div>
                ) : !data ? (
                    <div className="text-gray-400 text-center py-8">Veriler yükleniyor...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2"></th>
                                    {symbols.map(s => (
                                        <th key={s} className="p-2 text-gray-400 font-medium text-xs whitespace-nowrap">
                                            {formatSymbol(s)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {symbols.map(row => (
                                    <tr key={row}>
                                        <th className="p-2 text-left text-gray-400 font-medium text-xs whitespace-nowrap">
                                            {formatSymbol(row)}
                                        </th>
                                        {symbols.map(col => {
                                            const val = data.matrix[row][col];
                                            return (
                                                <td key={col} className="p-1">
                                                    <div
                                                        className={`h-8 w-full rounded flex items-center justify-center font-mono text-xs ${getColor(val)} transition-colors`}
                                                        title={`${formatSymbol(row)} vs ${formatSymbol(col)}: ${val}`}
                                                    >
                                                        {val > 0 ? '+' : ''}{val}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-4 flex items-start space-x-2 text-xs text-gray-500 bg-gray-900/30 p-3 rounded">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                        Korelasyon katsayısı +1'e yaklaştıkça varlıklar <strong>birlikte</strong> hareket eder.
                        -1'e yaklaştıkça <strong>ters</strong> hareket eder. 0'a yakınsa ilişki yoktur.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CorrelationMatrix;
