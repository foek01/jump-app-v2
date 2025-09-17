import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const NotificationTester: React.FC = () => {
  const sendTestNotification = async () => {
    try {
      console.log('🔔 Testing local notification...');
      
      // Schedule a local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎬 Sport Club App",
          body: "Test notificatie werkt! Push notificaties zijn actief.",
          data: { 
            type: 'test',
            timestamp: Date.now() 
          },
        },
        trigger: { seconds: 1 },
      });
      
      console.log('✅ Test notification scheduled');
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      console.log('🔔 Current notification permission:', status);
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('🔔 New notification permission:', newStatus);
      }
    } catch (error) {
      console.error('❌ Permission check failed:', error);
    }
  };

  if (__DEV__) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔔 Notification Tester</Text>
        <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
          <Text style={styles.buttonText}>Test Lokale Notificatie</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={checkPermissions}>
          <Text style={styles.buttonText}>Check Permissions</Text>
        </TouchableOpacity>
        <Text style={styles.info}>
          {Platform.OS === 'web' 
            ? '🌐 Web: Alleen lokale notificaties' 
            : '📱 Mobile: Lokale notificaties (Remote niet in Expo Go)'
          }
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4FF00',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C4FF00',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
