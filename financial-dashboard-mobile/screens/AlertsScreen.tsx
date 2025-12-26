import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Alert {
  id: string;
  symbol: string;
  alert_type: string;
  condition: string;
  threshold: number;
  is_active: boolean;
  created_at: string;
}

export default function AlertsScreen() {
  const { session } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      if (!session) return;

      const { data } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_active: !isActive })
        .eq('id', alertId);

      if (!error) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_active: !isActive }
            : alert
        ));
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      'Alarmı Sil',
      'Bu alarmı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => deleteAlertConfirmed(alertId)
        }
      ]
    );
  };

  const deleteAlertConfirmed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId);

      if (!error) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const addNewAlert = () => {
    Alert.alert(
      'Yeni Alarm Ekle',
      'Yakında: Alarm kurma özelliği eklenecek',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  useEffect(() => {
    fetchAlerts();
  }, [session]);

  const renderAlert = ({ item }: { item: Alert }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertInfo}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertSymbol}>{item.symbol}</Text>
          <View style={[
            styles.alertStatus,
            { backgroundColor: item.is_active ? '#10B981' : '#6B7280' }
          ]}>
            <Text style={styles.alertStatusText}>
              {item.is_active ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.alertType}>
          {item.alert_type === 'price_target' && 'Fiyat Hedefi'}
          {item.alert_type === 'percentage_change' && 'Yüzde Değişim'}
          {item.alert_type === 'volume_spike' && 'Hacim Artışı'}
          {item.alert_type === 'volatility' && 'Volatilite'}
        </Text>
        
        <Text style={styles.alertCondition}>
          Fiyat {item.condition === 'above' ? 'yukarısında' : 'altında'} ${item.threshold}
        </Text>
        
        <Text style={styles.alertDate}>
          Oluşturulma: {new Date(item.created_at).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      
      <View style={styles.alertActions}>
        <Switch
          value={item.is_active}
          onValueChange={() => toggleAlert(item.id, item.is_active)}
          trackColor={{ false: '#374151', true: '#10B981' }}
          thumbColor={item.is_active ? '#ffffff' : '#9CA3AF'}
        />
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteAlert(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Alarmlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add Alert Button */}
      <TouchableOpacity style={styles.addButton} onPress={addNewAlert}>
        <Ionicons name="add-circle" size={24} color="#3B82F6" />
        <Text style={styles.addButtonText}>Yeni Alarm Ekle</Text>
      </TouchableOpacity>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>Henüz Alarm Yok</Text>
          <Text style={styles.emptySubtitle}>Önemli fiyat hareketlerini kaçırmayın</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={addNewAlert}>
            <Text style={styles.emptyButtonText}>İlk Alarmımı Kur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          style={styles.alertsList}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    margin: 16,
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
  alertsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  alertItem: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertInfo: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertSymbol: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  alertStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  alertType: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertCondition: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  alertDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  alertActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    marginTop: 12,
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