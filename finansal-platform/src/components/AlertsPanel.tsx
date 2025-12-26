import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit,
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  Target,
  Clock,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserAlert {
  id: string;
  user_id: string;
  symbol: string;
  alert_type: 'price_target' | 'percentage_change' | 'volume_spike' | 'volatility';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  notification_method: string[];
  is_active: boolean;
  notes?: string;
  last_triggered?: string;
  created_at: string;
  updated_at: string;
}

interface AlertTrigger {
  id: string;
  alert_id: string;
  symbol: string;
  trigger_value: number;
  current_price: number;
  triggered_at: string;
}

export function AlertsPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [triggers, setTriggers] = useState<AlertTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Alert Form State
  const [formData, setFormData] = useState({
    symbol: '',
    alert_type: 'price_target' as UserAlert['alert_type'],
    condition: 'above' as UserAlert['condition'],
    threshold: 0,
    notification_method: ['push'] as string[],
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadTriggers();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTriggers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alert_triggers')
        .select('*')
        .eq('user_id', user.id)
        .order('triggered_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error loading triggers:', error);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: user.id,
          ...formData,
        });

      if (error) throw error;

      await loadAlerts();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating alert:', error);
      alert(t('errorCreatingAlert') || 'Alarm oluşturulurken hata oluştu');
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_active: !isActive })
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm(t('confirmDeleteAlert') || 'Alarmı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      alert_type: 'price_target',
      condition: 'above',
      threshold: 0,
      notification_method: ['push'],
      notes: '',
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_target': return <Target className="w-5 h-5" />;
      case 'percentage_change': return <TrendingUp className="w-5 h-5" />;
      case 'volume_spike': return <Volume2 className="w-5 h-5" />;
      case 'volatility': return <Activity className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      price_target: 'Fiyat Hedefi',
      percentage_change: 'Yüzde Değişim',
      volume_spike: 'Hacim Artışı',
      volatility: 'Volatilite',
    };
    return labels[type] || type;
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      above: 'Üstünde',
      below: 'Altında',
      equals: 'Eşit',
    };
    return labels[condition] || condition;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('signInRequired')}
          </h2>
          <p className="text-gray-500">
            {t('signInToManageAlerts') || 'Alarm yönetimi için giriş yapın'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('alerts') || 'Alarmlar'}</h1>
          <p className="text-gray-500 mt-1">
            {t('manageYourAlerts') || 'Fiyat alarmları ve bildirimlerinizi yönetin'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t('createAlert') || 'Yeni Alarm'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{alerts.length}</div>
              <div className="text-sm text-gray-600">{t('totalAlerts') || 'Toplam Alarm'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.is_active).length}
              </div>
              <div className="text-sm text-gray-600">{t('activeAlerts') || 'Aktif Alarm'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{triggers.length}</div>
              <div className="text-sm text-gray-600">{t('triggeredAlerts') || 'Tetiklenen'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('activeAlerts') || 'Aktif Alarmlar'}
        </h2>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              {t('noAlertsYet') || 'Henüz alarm oluşturmadınız'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('createFirstAlert') || 'İlk Alarmınızı Oluşturun'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg border-2 transition-all ${
                  alert.is_active ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        alert.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{alert.symbol}</div>
                        <div className="text-xs text-gray-500">
                          {getAlertTypeLabel(alert.alert_type)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                        className={`p-1 rounded transition-colors ${
                          alert.is_active
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('condition') || 'Koşul'}:</span>
                      <span className="font-medium text-gray-900">
                        {getConditionLabel(alert.condition)} {alert.threshold}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {alert.notification_method.map((method) => (
                        <span
                          key={method}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {method}
                        </span>
                      ))}
                    </div>

                    {alert.notes && (
                      <p className="text-sm text-gray-600 mt-2">{alert.notes}</p>
                    )}

                    {alert.last_triggered && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <Clock className="w-3 h-3" />
                        Son: {new Date(alert.last_triggered).toLocaleString('tr-TR')}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`px-4 py-2 border-t ${
                  alert.is_active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-xs text-center font-medium">
                    {alert.is_active ? (
                      <span className="text-blue-700">{t('monitoring') || 'İzleniyor'}</span>
                    ) : (
                      <span className="text-gray-600">{t('paused') || 'Duraklatıldı'}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trigger History */}
      {triggers.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('triggerHistory') || 'Tetikleme Geçmişi'}
          </h2>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      {t('symbol') || 'Sembol'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      {t('triggerValue') || 'Tetik Değeri'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      {t('currentPrice') || 'Mevcut Fiyat'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      {t('triggeredAt') || 'Tetiklenme'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {triggers.map((trigger) => (
                    <tr key={trigger.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{trigger.symbol}</td>
                      <td className="px-4 py-3 text-gray-700">${trigger.trigger_value.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-700">${trigger.current_price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(trigger.triggered_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {t('createAlert') || 'Yeni Alarm Oluştur'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('symbol') || 'Sembol'}
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  required
                  placeholder="AAPL, THYAO, BTC-USD..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alertType') || 'Alarm Türü'}
                </label>
                <select
                  value={formData.alert_type}
                  onChange={(e) => setFormData({ ...formData, alert_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price_target">Fiyat Hedefi</option>
                  <option value="percentage_change">Yüzde Değişim</option>
                  <option value="volume_spike">Hacim Artışı</option>
                  <option value="volatility">Volatilite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('condition') || 'Koşul'}
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="above">Üstünde</option>
                    <option value="below">Altında</option>
                    <option value="equals">Eşit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('threshold') || 'Değer'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notes') || 'Notlar'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('cancel') || 'İptal'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('create') || 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
