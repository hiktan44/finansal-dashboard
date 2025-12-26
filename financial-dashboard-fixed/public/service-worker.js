// Service Worker - Push Notification Desteği

self.addEventListener('install', (event) => {
  console.log('Service Worker yükleniyor...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker aktif!')
  event.waitUntil(self.clients.claim())
})

// Push notification alma
self.addEventListener('push', (event) => {
  console.log('Push notification alındı:', event)

  let notificationData = {
    title: 'Finansal Dashboard',
    body: 'Yeni bir bildiriminiz var',
    icon: '/favicon.ico',
    badge: '/badge.png',
    data: {}
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      if (payload.notification) {
        notificationData = {
          title: payload.notification.title || notificationData.title,
          body: payload.notification.body || notificationData.body,
          icon: payload.notification.icon || notificationData.icon,
          badge: payload.notification.badge || notificationData.badge,
          tag: payload.notification.tag,
          requireInteraction: payload.notification.requireInteraction || false,
          actions: payload.notification.actions || [],
          data: payload.notification.data || {}
        }
      }
    } catch (error) {
      console.error('Push data parse hatası:', error)
      notificationData.body = event.data.text()
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data
    }
  )

  event.waitUntil(promiseChain)
})

// Bildirime tıklama
self.addEventListener('notificationclick', (event) => {
  console.log('Bildirime tıklandı:', event)

  event.notification.close()

  if (event.action === 'view') {
    // "Görüntüle" butonuna tıklandı
    event.waitUntil(
      self.clients.openWindow('/')
    )
  } else if (event.action === 'dismiss') {
    // "Kapat" butonuna tıklandı - hiçbir şey yapma
    return
  } else {
    // Bildirimin kendisine tıklandı
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Açık bir pencere varsa odaklan
          for (let client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus()
            }
          }
          // Yoksa yeni pencere aç
          if (self.clients.openWindow) {
            return self.clients.openWindow('/')
          }
        })
    )
  }
})

// Test bildirimi için mesaj dinleyici
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification(
      event.data.title || 'Test Bildirimi',
      {
        body: event.data.body || 'Bu bir test bildirimidir',
        icon: event.data.icon || '/favicon.ico',
        badge: '/badge.png',
        tag: 'test-notification',
        requireInteraction: false
      }
    )
  }
})

// Background sync (gelecekte kullanılabilir)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)
  
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncAlerts())
  }
})

async function syncAlerts() {
  try {
    // Alarmları senkronize et
    console.log('Alarmlar senkronize ediliyor...')
    // API çağrısı yapılabilir
  } catch (error) {
    console.error('Alarm senkronizasyon hatası:', error)
  }
}
