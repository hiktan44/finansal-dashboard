import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPurchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
}

export default function PortfolioScreen() {
  const { session } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = async () => {
    try {
      if (!session) return;

      // Fetch user's portfolios
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', session.user.id);

      if (portfolios && portfolios.length > 0) {
        const portfolioId = portfolios[0].id; // Take first portfolio for now

        // Fetch portfolio holdings
        const { data: holdings } = await supabase
          .from('portfolio_holdings')
          .select('*')
          .eq('portfolio_id', portfolioId);

        if (holdings) {
          // Fetch current prices from market data
          const portfolioWithPrices = holdings.map(holding => ({
            ...holding,
            currentPrice: Math.random() * 100 + 50, // Mock current price
            totalValue: holding.quantity * (Math.random() * 100 + 50), // Mock total value
            gain: (Math.random() * 200 - 100), // Mock gain
            gainPercent: (Math.random() * 20 - 10), // Mock gain percent
            name: holding.symbol === 'AAPL' ? 'Apple Inc.' : 
                  holding.symbol === 'GOOGL' ? 'Alphabet Inc.' :
                  holding.symbol === 'MSFT' ? 'Microsoft Corp.' :
                  holding.symbol === 'TSLA' ? 'Tesla Inc.' :
                  holding.symbol + ' Stock'
          }));

          setPortfolioItems(portfolioWithPrices);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [session]);

  const renderPortfolioItem = ({ item }: { item: PortfolioItem }) => (
    <View style={styles.portfolioItem}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
        <Text style={styles.stockQuantity}>{item.quantity} adet</Text>
      </View>
      
      <View style={styles.stockValues}>
        <Text style={styles.totalValue}>${item.totalValue.toFixed(2)}</Text>
        <Text style={[
          styles.gain,
          { color: item.gain >= 0 ? '#10B981' : '#EF4444' }
        ]}>
          {item.gain >= 0 ? '+' : ''}${item.gain.toFixed(2)} ({item.gainPercent >= 0 ? '+' : ''}{item.gainPercent.toFixed(2)}%)
        </Text>
        <Text style={styles.avgPrice}>Ort. Alış: ${item.avgPurchasePrice.toFixed(2)}</Text>
      </View>
    </View>
  );

  const addNewHolding = () => {
    Alert.alert(
      'Yeni Hisse Ekle',
      'Yakında: Hisse senedi ekleme özelliği eklenecek',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.totalValue, 0);
  const totalGain = portfolioItems.reduce((sum, item) => sum + item.gain, 0);
  const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Portföy yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Portfolio Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Portföyüm</Text>
        <Text style={styles.totalPortfolioValue}>${totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Text style={[
          styles.totalGain,
          { color: totalGain >= 0 ? '#10B981' : '#EF4444' }
        ]}>
          {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)} ({totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)
        </Text>
      </View>

      {/* Add Holding Button */}
      <TouchableOpacity style={styles.addButton} onPress={addNewHolding}>
        <Ionicons name="add-circle" size={24} color="#3B82F6" />
        <Text style={styles.addButtonText}>Yeni Hisse Ekle</Text>
      </TouchableOpacity>

      {/* Holdings List */}
      {portfolioItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>Portföyünüz Boş</Text>
          <Text style={styles.emptySubtitle}>İlk hissenizi ekleyerek başlayın</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={addNewHolding}>
            <Text style={styles.emptyButtonText}>Hisse Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={portfolioItems}
          renderItem={renderPortfolioItem}
          keyExtractor={(item) => item.id}
          style={styles.holdingsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#2d2d2d',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 8,
  },
  totalPortfolioValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalGain: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  holdingsList: {
    paddingHorizontal: 16,
    flex: 1,
  },
  portfolioItem: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  stockName: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  stockQuantity: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  stockValues: {
    alignItems: 'flex-end',
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  gain: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  avgPrice: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});