import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import MarketOverview from '../components/MarketOverview';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState({
    indices: [],
    techStocks: [],
    commodities: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarketData = async () => {
    try {
      // Fetch real-time market data from Supabase
      const { data: indices } = await supabase
        .from('market_indices')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      const { data: techStocks } = await supabase
        .from('tech_stocks')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      const { data: commodities } = await supabase
        .from('commodities')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      setMarketData({
        indices: indices || [],
        techStocks: techStocks || [],
        commodities: commodities || [],
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="reload" size={48} color="#3B82F6" />
        <Text style={styles.loadingText}>Piyasa verileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
        <Text style={styles.headerSubtitle}>Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</Text>
      </View>

      {/* Market Overview */}
      <MarketOverview marketData={marketData} />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.actionText}>{t('home.priceAlert')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="wallet" size={24} color="#3B82F6" />
            <Text style={styles.actionText}>{t('home.myPortfolio')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="analytics" size={24} color="#8B5CF6" />
            <Text style={styles.actionText}>{t('home.aiAnalysis')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="newspaper" size={24} color="#F59E0B" />
            <Text style={styles.actionText}>{t('home.news')}</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2d2d2d',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});