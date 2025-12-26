// @ts-nocheck
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import { getBudgetDeficitData } from '@/services/economicDataService';

interface BudgetDeficitChartProps {
  title?: string;
  height?: string;
}

export function BudgetDeficitChart({ title = 'Bütçe Açığı/GSYİH', height = '400px' }: BudgetDeficitChartProps) {
  const [data, setData] = useState<{
    years: number[];
    values: (number | null)[];
  }>({ years: [], values: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const budgetData = await getBudgetDeficitData();
        setData({
          years: budgetData.years || [],
          values: budgetData.values || []
        });
      } catch (err) {
        console.error('Bütçe açığı verileri yüklenirken hata:', err);
        setError('Veri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height, width: '100%' }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 rounded-lg"
        style={{ height, width: '100%' }}
      >
        <div className="text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data.years || data.years.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height, width: '100%' }}
      >
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Veri bulunamadı</p>
        </div>
      </div>
    );
  }

  // Filter out null values
  const filteredData = data.years
    .map((year, index) => ({ year, value: data.values[index] }))
    .filter(item => item.value !== null);

  const option: EChartsOption = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#1f2937'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = params[0];
        const isDeficit = item.value >= 0;
        const status = isDeficit ? 'Açık' : 'Fazla';
        return `<strong>${item.name}</strong><br/>${item.marker} Bütçe ${status}: <strong>${Math.abs(item.value)}%</strong>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: filteredData.map(item => item.year.toString()),
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: 'GSYİH Oranı (%)',
      nameTextStyle: {
        fontSize: 12,
        padding: [0, 0, 0, 10]
      },
      axisLabel: {
        formatter: '{value}%',
        fontSize: 11
      }
    },
    series: [
      {
        name: 'Bütçe Durumu',
        type: 'bar',
        data: filteredData.map(item => item.value),
        itemStyle: {
          color: (params: any) => {
            return params.value >= 0 ? '#EF4444' : '#10B981'; // Red for deficit, green for surplus
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    ]
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
