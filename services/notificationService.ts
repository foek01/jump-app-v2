// import * as Notifications from 'expo-notifications'; // Temporarily disabled
import { Platform } from 'react-native';
// Only import Firebase messaging on mobile platforms
let messaging: any = null;
let getToken: any = null;
let onMessage: any = null;

if (Platform.OS !== 'web') {
  try {
    const firebase = require('@/config/firebase');
    const firebaseMessaging = require('firebase/messaging');
    messaging = firebase.messaging;
    getToken = firebaseMessaging.getToken;
    onMessage = firebaseMessaging.onMessage;
  } catch (error) {
    console.warn('⚠️ Firebase messaging not available:', error.message);
  }
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationService {
  requestPermissions(): Promise<boolean>;
  getDeviceToken(): Promise<string | null>;
  setupNotificationListeners(): void;
  sendTestNotification(): Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  private fcmToken: string | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔔 Requesting notification permissions...');
      
      if (Platform.OS === 'web') {
        // Web: Request permission via Notification API
        const permission = await Notification.requestPermission();
        console.log('🌐 Web notification permission:', permission);
        return permission === 'granted';
      } else {
        // Mobile: Use expo-notifications
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        console.log('📱 Mobile notification permission:', finalStatus);
        return finalStatus === 'granted';
      }
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Web: Get FCM token
        if (!messaging) {
          console.warn('⚠️ Firebase messaging not initialized on web');
          return null;
        }
        
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY' // You need to add your VAPID key here
        });
        
        console.log('🌐 FCM Token (Web):', token);
        this.fcmToken = token;
        return token;
      } else {
        // Mobile: Get Expo push token
        const token = await Notifications.getExpoPushTokenAsync();
        
        console.log('📱 Expo Push Token (Mobile):', token.data);
        return token.data;
      }
    } catch (error) {
      console.error('❌ Error getting device token:', error);
      return null;
    }
  }

  setupNotificationListeners(): void {
    console.log('🔧 Setting up notification listeners...');
    
    if (Platform.OS === 'web') {
      // Web: Listen for FCM messages
      if (messaging) {
        onMessage(messaging, (payload) => {
          if (!payload) return;
          console.log('🌐 Received FCM message (Web):', payload);
          
          // Show notification on web
          if (payload.notification) {
            new Notification(payload.notification.title || 'New Message', {
              body: payload.notification.body,
              icon: payload.notification.icon || '/favicon.png'
            });
          }
        });
      }
    } else {
      // Mobile: Listen for Expo notifications
      
      // Notification received while app is in foreground
      Notifications.addNotificationReceivedListener(notification => {
        if (!notification) return;
        console.log('📱 Notification received (foreground):', notification);
      });
      
      // Notification tapped/clicked
      Notifications.addNotificationResponseReceivedListener(response => {
        if (!response) return;
        console.log('📱 Notification response:', response);
        // Handle notification tap here
      });
    }
  }

  async sendTestNotification(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web: Show local notification
        if (Notification.permission === 'granted') {
          new Notification('Test Notification', {
            body: 'Dit is een test push bericht!',
            icon: '/favicon.png'
          });
        }
      } else {
        // Mobile: Send local notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Test Notification',
            body: 'Dit is een test push bericht!',
            data: { test: true },
          },
          trigger: null, // Show immediately
        });
      }
      
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }
}

export const notificationService = new NotificationServiceImpl();

// Helper function to initialize notifications
export async function initializeNotifications(): Promise<void> {
  console.log('🚀 Initializing notification service...');
  
  const hasPermission = await notificationService.requestPermissions();
  if (hasPermission) {
    await notificationService.getDeviceToken();
    notificationService.setupNotificationListeners();
    console.log('✅ Notification service initialized successfully');
  } else {
    console.warn('⚠️ Notification permissions not granted');
  }
}