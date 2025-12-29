// Alarm ve Bildirim Tipleri

export type AlertType = 'price_target' | 'percentage_change' | 'volume_spike' | 'volatility'
export type AlertCondition = 'above' | 'below'
export type NotificationChannel = 'push' | 'email' | 'sms'
export type NotificationStatus = 'sent' | 'failed' | 'pending'
export type NotificationType = 'alert' | 'report' | 'news' | 'system'

export interface UserAlert {
  id: string
  user_id: string
  symbol: string
  alert_type: AlertType
  condition: AlertCondition
  threshold: number
  notification_method: NotificationChannel[]
  is_active: boolean
  created_at: string
  last_triggered?: string
  notes?: string
}

export interface AlertTrigger {
  id: string
  alert_id: string
  user_id: string
  symbol: string
  trigger_value: number
  current_price: number
  triggered_at: string
  resolved_at?: string
}

export interface NotificationLog {
  id: string
  user_id: string
  notification_type: NotificationType
  channel: NotificationChannel
  title: string
  message: string
  status: NotificationStatus
  error_message?: string
  metadata?: Record<string, any>
  sent_at: string
}

export interface AlertPreferences {
  id: string
  user_id: string
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  frequency_limit?: number
  created_at: string
  updated_at: string
}

export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  is_active: boolean
  user_agent?: string
  created_at: string
}

export interface SmartAlertSuggestion {
  type: string
  message: string
  suggestedThreshold: number
  reason: string
}

export interface AlertAnalysis {
  symbol: string
  currentPrice: number
  volatility: number
  adaptiveThreshold: {
    low: number
    high: number
    volatility: number
  }
  anomalies: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
    zScore: number
  }>
  trend: 'bullish' | 'bearish' | 'neutral'
  supportResistance: {
    support: number
    resistance: number
  }
  smartAlertSuggestions: SmartAlertSuggestion[]
  technicalIndicators: {
    ma10: number
    ma20: number
    priceZScore: number
    volumeZScore: number
  }
  analyzedAt: string
}

export interface CreateAlertInput {
  symbol: string
  alert_type: AlertType
  condition: AlertCondition
  threshold: number
  notification_method: NotificationChannel[]
  notes?: string
}

export interface NotificationStats {
  total: number
  byChannel: {
    push: number
    email: number
    sms: number
  }
  byStatus: {
    sent: number
    failed: number
    pending: number
  }
  byType: {
    alert: number
    report: number
    news: number
    system: number
  }
  successRate: string
  recentLogs: NotificationLog[]
  period: {
    start: string
    end: string
    days: number
  }
  dailyDistribution: Record<string, number>
}
