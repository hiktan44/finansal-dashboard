import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MarketOverviewProps {
  marketData: {
    indices: any[];
    techStocks: any[];
    commodities: any[];
  };
}

export default function MarketOverview({ marketData }: MarketOverviewProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Market Summary Cards */}
      <View style={styles.summaryCards}>
        <TouchableOpacity style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ana Endeksler</Text>
            <Ionicons name="trending-up" size={24} color="#10B981" />
          </View>
          <Text style={styles.cardSubtitle}>Tüm endeksler yükseliyor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Teknoloji Hisseleri</Text>
            <Ionicons name="phone-portrait" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.cardSubtitle}>Yükseliş trendi devam ediyor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Emtialar</Text>
            <Ionicons name="diamond" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.cardSubtitle}>Altın güçlenmeye devam</Text>
        </TouchableOpacity>
      </View>

      {/* Market Indices Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ana Endeksler</Text>
        <View style={styles.indicesContainer}>
          {marketData.indices.map((index: any) => (
            <View key={index.symbol} style={styles.indexItem}>
              <View style={styles.indexInfo}>
                <Text style={styles.indexName}>{index.name}</Text>
                <Text style={styles.indexSymbol}>{index.symbol}</Text>
              </View>
              <View style={styles.indexPrice}>
                <Text style={styles.indexClose}>{formatCurrency(index.close)}</Text>
                <Text style={[
                  styles.indexChange,
                  { color: index.change >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatChange(index.changePercent)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Tech Stocks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teknoloji Devleri</Text>
        <View style={styles.stocksContainer}>
          {marketData.techStocks.map((stock: any) => (
            <View key={stock.symbol} style={styles.stockItem}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              </View>
              <View style={styles.stockPrice}>
                <Text style={styles.stockCurrentPrice}>{formatCurrency(stock.price)}</Text>
                <Text style={[
                  styles.stockChange,
                  { color: stock.change >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatChange(stock.changePercent)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Commodities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emtia Fiyatları</Text>
        <View style={styles.commoditiesContainer}>
          {marketData.commodities.map((commodity: any) => (
            <View key={commodity.symbol} style={styles.commodityItem}>
              <View style={styles.commodityInfo}>
                <Text style={styles.commodityName}>{commodity.name}</Text>
                <Text style={styles.commoditySymbol}>{commodity.symbol}</Text>
              </View>
              <View style={styles.commodityPrice}>
                <Text style={styles.commodityCurrentPrice}>{formatCurrency(commodity.price)}</Text>
                <Text style={[
                  styles.commodityChange,
                  { color: commodity.change >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatChange(commodity.changePercent)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  summaryCards: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  indicesContainer: {
    gap: 12,
  },
  indexItem: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexInfo: {
    flex: 1,
  },
  indexName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  indexSymbol: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  indexPrice: {
    alignItems: 'flex-end',
  },
  indexClose: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  indexChange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  stocksContainer: {
    gap: 12,
  },
  stockItem: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stockSymbol: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  stockCurrentPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  commoditiesContainer: {
    gap: 12,
  },
  commodityItem: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commodityInfo: {
    flex: 1,
  },
  commodityName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  commoditySymbol: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  commodityPrice: {
    alignItems: 'flex-end',
  },
  commodityCurrentPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  commodityChange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});