import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Bell, BellOff, TestTube, Settings, Trash2 } from "lucide-react-native";
import { notificationService } from "@/services/notificationService";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'match' | 'news' | 'general' | 'text';
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Ajax - PSV",
    message: "De wedstrijd begint over 30 minuten!",
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    read: false,
    type: 'match',
  },
  {
    id: "2",
    title: "Nieuw artikel",
    message: "Ajax wint met 3-1 van Feyenoord",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    type: 'news',
  },
  {
    id: "3",
    title: "Live stream beschikbaar",
    message: "De wedstrijd Ajax - AZ is nu live",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    type: 'general',
  },
  {
    id: "4",
    title: "Transfer nieuws",
    message: "Ajax haalt nieuwe spits binnen",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    type: 'news',
  },
  {
    id: "5",
    title: "Wedstrijd update",
    message: "Ajax - Utrecht is uitgesteld",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    type: 'general',
  },
  {
    id: "6",
    title: "Tekstbericht",
    message: "Welkom bij de Ajax app! Hier vind je alle laatste nieuws en wedstrijden.",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: true,
    type: 'text',
  },
  {
    id: "7",
    title: "Belangrijk bericht",
    message: "De training van morgen is verplaatst naar 16:00 uur vanwege het weer.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    read: false,
    type: 'text',
  },
];

export default function NotificationsScreen() {
  const [isTestingNotification, setIsTestingNotification] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

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
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          },
        },
      ]
    );
  };

  const handleMarkAsRead = (notificationId: string): void => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
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
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <BellOff color="#666" size={48} />
            <Text style={styles.emptyText}>Geen notificaties</Text>
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