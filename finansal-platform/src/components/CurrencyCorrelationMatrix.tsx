import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity } from 'lucide-react';

interface CurrencyPair {
  pair: string;
  correlation: number;
}

export function CurrencyCorrelationMatrix() {
  const [loading, setLoading] = useState(true);
  const [correlationData, setCorrelationData] = useState<number[][]>([]);
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'JPY', 'TRY', 'BTC']);

  useEffect(() => {
    calculateCorrelations();
  }, []);

  const calculateCorrelations = async () => {
    setLoading(true);
    try {
      // Simplified correlation calculation
      // In production, fetch historical prices and calculate actual correlations
      const matrix: number[][] = [];
      
      for (let i = 0; i < currencies.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < currencies.length; j++) {
          if (i === j) {
            matrix[i][j] = 1.0; // Perfect correlation with itself
          } else {
            // Simulated correlation (-1 to 1)
            const correlation = Math.random() * 2 - 1;
            matrix[i][j] = parseFloat(correlation.toFixed(2));
          }
        }
      }

      setCorrelationData(matrix);
    } catch (error) {
      console.error('Correlation calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForCorrelation = (value: number): string => {
    if (value >= 0.7) return 'bg-green-600 text-white';
    if (value >= 0.4) return 'bg-green-400 text-white';
    if (value >= 0.1) return 'bg-green-200 text-gray-900';
    if (value >= -0.1) return 'bg-gray-200 text-gray-900';
    if (value >= -0.4) return 'bg-red-200 text-gray-900';
    if (value >= -0.7) return 'bg-red-400 text-white';
    return 'bg-red-600 text-white';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Döviz Korelasyon Matrisi</h3>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-50"></th>
              {currencies.map((currency) => (
                <th key={currency} className="border border-gray-300 p-2 bg-gray-50 font-semibold text-sm">
                  {currency}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency1, i) => (
              <tr key={currency1}>
                <td className="border border-gray-300 p-2 bg-gray-50 font-semibold text-sm">
                  {currency1}
                </td>
                {currencies.map((currency2, j) => (
                  <td
                    key={`${currency1}-${currency2}`}
                    className={`border border-gray-300 p-2 text-center text-sm font-medium transition-colors hover:opacity-80 cursor-pointer ${getColorForCorrelation(correlationData[i][j])}`}
                    title={`${currency1} / ${currency2}: ${correlationData[i][j]}`}
                  >
                    {correlationData[i][j].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-600">Negatif Korelasyon</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span className="text-gray-600">Nötr</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-gray-600">Pozitif Korelasyon</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Korelasyon Katsayısı:</strong> -1 ile +1 arasında değer alır.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>+1: Mükemmel pozitif korelasyon (beraber hareket ederler)</li>
          <li>0: Korelasyon yok (bağımsız hareket ederler)</li>
          <li>-1: Mükemmel negatif korelasyon (ters yönde hareket ederler)</li>
        </ul>
      </div>
    </div>
  );
}
