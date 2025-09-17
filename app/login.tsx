import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(language === 'nl' ? 'Fout' : 'Error', 
                  language === 'nl' ? 'Voer je emailadres in' : 'Enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert(language === 'nl' ? 'Fout' : 'Error', 
                  language === 'nl' ? 'Voer je wachtwoord in' : 'Enter your password');
      return;
    }

    const success = await login(email.trim(), password);

    if (success) {
      // Navigate to club selection or home
      router.replace('/club-selection');
    }
  };

  const handleRegister = () => {
    // For now, just show an alert
    Alert.alert(
      language === 'nl' ? 'Registreren' : 'Register',
      language === 'nl' ? 'Registratie functionaliteit komt binnenkort beschikbaar.' : 'Registration functionality coming soon.',
      [{ text: 'OK' }]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      language === 'nl' ? 'Wachtwoord vergeten' : 'Forgot Password',
      language === 'nl' ? 'Wachtwoord reset functionaliteit komt binnenkort beschikbaar.' : 'Password reset functionality coming soon.',
      [{ text: 'OK' }]
    );
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'nl' ? 'en' : 'nl';
    changeLanguage(newLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Language/Skip button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.languageContainer} onPress={toggleLanguage}>
            <Image 
              source={{ uri: language === 'nl' ? 'https://flagcdn.com/w40/nl.png' : 'https://flagcdn.com/w40/gb.png' }} 
              style={[styles.flag, styles.activeFlag]}
            />
            <Image 
              source={{ uri: language === 'nl' ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/nl.png' }} 
              style={[styles.flag, styles.inactiveFlag]}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.replace('/club-selection')}
          >
            <Text style={styles.skipText}>
              {language === 'nl' ? 'Sla over →' : 'Skip →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://jump.video/assets/uploads/ef8559e98866357502f16cab8430c63a3c4e9e755f39568a5a5e3074bc560428e99454c2e60a0825cdf029d1aa1da3aa0ea0e498d05e54752b67a20a439b8323.png"
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            {language === 'nl' ? 'Welkom' : 'Welcome'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {language === 'nl' ? 'Login om verder te gaan' : 'Login to continue'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder={language === 'nl' ? 'Emailadres' : 'Email address'}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={language === 'nl' ? 'Wachtwoord' : 'Password'}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff color="#999" size={20} />
              ) : (
                <Eye color="#999" size={20} />
              )}
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>
              {language === 'nl' ? 'Wachtwoord vergeten?' : 'Forgot password?'}
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.loginButtonText}>
                  {language === 'nl' ? 'Bezig...' : 'Loading...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>
                {language === 'nl' ? 'LOG IN' : 'LOG IN'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>
              {language === 'nl' ? 'REGISTREER' : 'REGISTER'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  flag: {
    width: 30,
    height: 20,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  activeFlag: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#C4FF00',
  },
  inactiveFlag: {
    opacity: 0.5,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#999',
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
    flex: 1,
  },
  input: {
    backgroundColor: 'transparent',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFF',
    marginBottom: 20,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  passwordInput: {
    backgroundColor: 'transparent',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingRight: 50,
    fontSize: 16,
    color: '#FFF',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#C4FF00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerButton: {
    borderColor: '#C4FF00',
    borderWidth: 2,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#C4FF00',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
