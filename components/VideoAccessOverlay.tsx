import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lock, Crown, User } from 'lucide-react-native';
import { router } from 'expo-router';

interface VideoAccessOverlayProps {
  isVisible: boolean;
  accessType: 'login' | 'premium' | 'club';
  onPress?: () => void;
}

export const VideoAccessOverlay: React.FC<VideoAccessOverlayProps> = ({
  isVisible,
  accessType,
  onPress,
}) => {
  if (!isVisible) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default: navigate to login
      router.push('/login');
    }
  };

  const getOverlayContent = () => {
    switch (accessType) {
      case 'premium':
        return {
          icon: <Crown color="#FFD700" size={32} fill="#FFD700" />,
          title: 'Premium Content',
          subtitle: 'Upgrade voor toegang',
          bgColor: 'rgba(255, 215, 0, 0.1)',
          borderColor: '#FFD700',
        };
      case 'club':
        return {
          icon: <User color="#4A90E2" size={32} />,
          title: 'Club Content',
          subtitle: 'Login voor toegang',
          bgColor: 'rgba(74, 144, 226, 0.1)',
          borderColor: '#4A90E2',
        };
      default:
        return {
          icon: <Lock color="#FFF" size={32} />,
          title: 'Login Vereist',
          subtitle: 'Tap om in te loggen',
          bgColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: '#FFF',
        };
    }
  };

  const content = getOverlayContent();

  return (
    <TouchableOpacity
      style={[
        styles.overlay,
        { 
          backgroundColor: content.bgColor,
          borderColor: content.borderColor,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.lockContainer}>
        {content.icon}
        <Text style={styles.lockTitle}>{content.title}</Text>
        <Text style={styles.lockSubtitle}>{content.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 10,
  },
  lockContainer: {
    alignItems: 'center',
    padding: 20,
  },
  lockTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  lockSubtitle: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
});
