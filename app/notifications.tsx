import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Bell, BellOff, TestTube, Settings, Trash2 } from "lucide-react-native";
import { notificationService } from "@/services/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Notifications from 'expo-notifications'; // Temporarily disabled

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'match' | 'news' | 'general' | 'text';
}

// Real notifications will be loaded from AsyncStorage and notification listeners

const NOTIFICATIONS_STORAGE_KEY = "@app_notifications";

export default function NotificationsScreen() {
  const [isTestingNotification, setIsTestingNotification] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load notifications from AsyncStorage
  useEffect(() => {
    loadNotifications();
    // setupNotificationListeners(); // Temporarily disabled
  }, []);

  const loadNotifications = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (notifs: Notification[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>): Promise<void> => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const setupNotificationListeners = (): void => {
    console.log('🔔 Setting up notification listeners...');
    
    // Listen for notifications received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received in foreground:', notification);
      
      const { title, body, data } = notification.request.content;
      addNotification({
        title: title || 'Nieuwe melding',
        message: body || '',
        timestamp: new Date(),
        read: false,
        type: (data?.type as 'match' | 'news' | 'general' | 'text') || 'general'
      });
    });

    // Listen for notification responses (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification tapped:', response);
      
      const { title, body, data } = response.notification.request.content;
      addNotification({
        title: title || 'Nieuwe melding',
        message: body || '',
        timestamp: new Date(),
        read: false,
        type: (data?.type as 'match' | 'news' | 'general' | 'text') || 'general'
      });
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    const formatTime = (date: Date): string => {
      return date.toLocaleTimeString('nl-NL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('nl-NL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min geleden • ${formatTime(timestamp)}`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} uur geleden • ${formatTime(timestamp)}`;
    } else if (diffInMinutes < 2880) { // Less than 48 hours
      return `Gisteren • ${formatTime(timestamp)}`;
    } else {
      return `${formatDate(timestamp)} • ${formatTime(timestamp)}`;
    }
  };

  const handleDeleteNotification = (notificationId: string): void => {
    Alert.alert(
      'Bericht verwijderen',
      'Weet je zeker dat je dit bericht wilt verwijderen?',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            const updatedNotifications = notifications.filter(n => n.id !== notificationId);
            setNotifications(updatedNotifications);
            await saveNotifications(updatedNotifications);
          },
        },
      ]
    );
  };

  const handleMarkAsRead = async (notificationId: string): Promise<void> => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const handleTestNotification = async (): Promise<void> => {
    try {
      setIsTestingNotification(true);
      await notificationService.sendTestNotification();
      Alert.alert('Succes', 'Test notificatie verzonden!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Fout', 'Kon test notificatie niet verzenden');
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleRequestPermissions = async (): Promise<void> => {
    try {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        Alert.alert('Succes', 'Notificatie permissies toegestaan!');
        await notificationService.getDeviceToken();
      } else {
        Alert.alert('Geweigerd', 'Notificatie permissies zijn geweigerd');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Fout', 'Kon permissies niet aanvragen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaties</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Test Section */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Push Berichten Testen</Text>
          
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={handleRequestPermissions}
          >
            <Settings color="#C4FF00" size={20} />
            <Text style={styles.testButtonText}>Permissies Aanvragen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, isTestingNotification && styles.testButtonDisabled]} 
            onPress={handleTestNotification}
            disabled={isTestingNotification}
          >
            <TestTube color={isTestingNotification ? "#666" : "#C4FF00"} size={20} />
            <Text style={[styles.testButtonText, isTestingNotification && styles.testButtonTextDisabled]}>
              {isTestingNotification ? 'Verzenden...' : 'Test Notificatie'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Ontvangen Berichten</Text>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Berichten laden...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <BellOff color="#666" size={48} />
            <Text style={styles.emptyText}>Geen notificaties</Text>
            <Text style={styles.emptySubtext}>
              Push notificaties verschijnen hier automatisch
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={[styles.notificationItem, !notification.read && styles.unread]}
            >
              <TouchableOpacity
                style={styles.notificationContent}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.iconContainer}>
                  <Bell color={notification.read ? "#666" : "#C4FF00"} size={20} />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{formatTimestamp(notification.timestamp)}</Text>
                  {notification.type === 'text' && (
                    <View style={styles.textBadge}>
                      <Text style={styles.textBadgeLabel}>Tekstbericht</Text>
                    </View>
                  )}
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(notification.id)}
              >
                <Trash2 color="#ff4444" size={18} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#000",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C4FF00",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#1a1a1a",
  },
  unread: {
    backgroundColor: "#222",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 15,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#666",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C4FF00",
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    textAlign: "center",
  },
  testSection: {
    padding: 20,
    backgroundColor: "#222",
    margin: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#C4FF00",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonDisabled: {
    backgroundColor: "#1a1a1a",
  },
  testButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  testButtonTextDisabled: {
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 10,
  },
  deleteButton: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderLeftWidth: 1,
    borderLeftColor: "#333",
  },
  textBadge: {
    backgroundColor: "#C4FF00",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  textBadgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
  },
});