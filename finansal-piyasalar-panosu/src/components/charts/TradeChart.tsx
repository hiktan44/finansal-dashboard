// @ts-nocheck
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import { getTradeData } from '@/services/economicDataService';

interface TradeChartProps {
  title?: string;
  height?: string;
}

export function TradeChart({ title = 'Dış Ticaret Verileri', height = '400px' }: TradeChartProps) {
  const [data, setData] = useState<{
    exports: Record<string, number>;
    imports: Record<string, number>;
    sectors: Record<string, number>;
  }>({ exports: {}, imports: {}, sectors: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const tradeData = await getTradeData();
        setData({
          exports: tradeData.exports,
          imports: tradeData.imports,
          sectors: tradeData.sectors
        });
      } catch (err) {
        console.error('Dış ticaret verileri yüklenirken hata:', err);
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

  const dates = Object.keys(data.exports || {});
  const exportValues = Object.values(data.exports || {});
  const importValues = Object.values(data.imports || {});

  if (!dates || dates.length === 0) {
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
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: <strong>${item.value} Milyar $</strong><br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['İhracat', 'İthalat'],
      bottom: 0,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: 'Milyar $',
      nameTextStyle: {
        fontSize: 12,
        padding: [0, 0, 0, 10]
      },
      axisLabel: {
        formatter: '{value}',
        fontSize: 11
      }
    },
    series: [
      {
        name: 'İhracat',
        type: 'line',
        smooth: true,
        data: exportValues,
        itemStyle: {
          color: '#10B981'
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: 'İthalat',
        type: 'line',
        smooth: true,
        data: importValues,
        itemStyle: {
          color: '#EF4444'
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          focus: 'series'
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
