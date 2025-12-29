import { useState, useEffect } from 'react'
import { savePushSubscription } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePushNotifications() {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  // Service Worker kaydet
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service Worker kayıtlı:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker kaydı başarısız:', error)
      return null
    }
  }

  // Push subscription oluştur
  const subscribeToPush = async () => {
    if (!isSupported || !user) {
      console.warn('Push notifications desteklenmiyor veya kullanıcı oturum açmamış')
      return false
    }

    try {
      // İzin iste
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        console.warn('Bildirim izni reddedildi')
        return false
      }

      // Service Worker kaydet
      let registration = await navigator.serviceWorker.ready

      if (!registration) {
        registration = await registerServiceWorker()
        if (!registration) return false
      }

      // VAPID public key (production'da environment variable'dan alınmalı)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SklhoQHk1jLlmJP6RZ-h0SAQdHBUgqJhDBL3dZJtJWHZ2d5jBdBE1ws'
      
      // Public key'i Uint8Array'e çevir
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Push subscription oluştur
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      setSubscription(pushSubscription)

      // Subscription'ı backend'e kaydet
      if (user?.id) {
        await savePushSubscription(user.id, pushSubscription.toJSON())
      }

      console.log('Push subscription başarılı:', pushSubscription)
      return true

    } catch (error) {
      console.error('Push subscription hatası:', error)
      return false
    }
  }

  // Push subscription kaldır
  const unsubscribeFromPush = async () => {
    if (!subscription) return

    try {
      await subscription.unsubscribe()
      setSubscription(null)
      console.log('Push subscription kaldırıldı')
    } catch (error) {
      console.error('Unsubscribe hatası:', error)
    }
  }

  // Test bildirimi gönder
  const sendTestNotification = () => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Bildirim gönderilemez: Desteklenmiyor veya izin verilmedi')
      return
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Service Worker'a mesaj gönder
      navigator.serviceWorker.controller.postMessage({
        type: 'TEST_NOTIFICATION',
        title: 'Test Bildirimi',
        body: 'Push notification sistemi çalışıyor! 🎉',
        icon: '/favicon.ico'
      })
    } else {
      // Fallback: Normal browser notification
      new Notification('Test Bildirimi', {
        body: 'Push notification sistemi çalışıyor! 🎉',
        icon: '/favicon.ico',
        badge: '/badge.png'
      })
    }
  }

  return {
    isSupported,
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  }
}

// VAPID key dönüştürücü (Base64 URL -> Uint8Array)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
