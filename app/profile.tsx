import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, User, Mail, Save, Eye, EyeOff, Lock } from "lucide-react-native";
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "@/providers/AuthProvider";
import { useClubs } from "@/providers/ClubProvider";
import { useVideos } from "@/providers/VideoProvider";

type AuthMode = 'login' | 'register' | 'profile';

export default function ProfileScreen() {
  // Auth state from provider
  const { user, isAuthenticated, login, logout, isLoading: authLoading, error } = useAuth();
  const { clubs, selectedClubs, clearAllCache } = useClubs();
  const { clearCache: clearVideoCache } = useVideos();
  const navigation = useNavigation();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Profile data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Initialize profile data when user is authenticated
  useEffect(() => {
    if (user) {
      setName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Gebruiker');
      setEmail(user.email || '');
    }
  }, [user]);

  // Get user's clubs - show all clubs with status indicators
  const getUserClubs = () => {
    if (!clubs.length) return [];
    
    console.log('🏟️ All available clubs:', {
      total: clubs.length,
      selected: selectedClubs?.length || 0,
      permissions: user?.clubPermissions?.length || 0,
      clubNames: clubs.map(c => c.name)
    });
    
    // Show ALL clubs from Firebase/API, not just selected ones
    return clubs;
  };

  const userClubs = getUserClubs();

  // Safe back navigation
  const handleBack = () => {
    console.log('🔙 Back button pressed');
    if (navigation.canGoBack()) {
      console.log('✅ Can go back, using router.back()');
      router.back();
    } else {
      console.log('❌ Cannot go back, navigating to home');
      router.replace('/(tabs)/home');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }
    
    const success = await login(email, password);
    
    if (success) {
      Alert.alert('Succes', 'Je bent succesvol ingelogd!');
      // Clear form
      setPassword('');
    } else if (error) {
      Alert.alert('Fout', error);
    }
  };
  
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 6 karakters lang zijn');
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Implement actual registration logic
      console.log('Register attempt:', { name, email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just set logged in state
      setIsLoggedIn(true);
      Alert.alert('Succes', 'Account succesvol aangemaakt!');
    } catch (error) {
      Alert.alert('Fout', 'Registratie mislukt. Probeer opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    console.log('🚪 Logout button pressed');
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Starting complete logout process...');
              
              // Step 1: Clear authentication data
              await logout();
              console.log('✅ Authentication cleared');
              
              // Step 2: Clear all club data and cache
              await clearAllCache();
              console.log('✅ Club data and cache cleared');
              
              // Step 3: Clear video cache
              await clearVideoCache();
              console.log('✅ Video cache cleared');
              
              // Step 4: Clear form state
              setName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setAuthMode('login');
              console.log('✅ Form state cleared');
              
              // Step 5: Force app refresh and navigate
              console.log('🚀 Navigating to login screen...');
              router.replace('/login');
              
              // Step 6: Force reload to ensure clean state
              if (Platform.OS === 'web') {
                console.log('🔄 Forcing page reload for clean state...');
                setTimeout(() => {
                  window.location.href = window.location.origin + '/login';
                }, 50);
              } else {
                console.log('📱 Mobile logout complete');
              }
              
              console.log('🎉 Complete logout successful!');
              
            } catch (error) {
              console.error('❌ Logout error:', error);
              // Force logout even if there's an error
              router.replace('/login');
              if (Platform.OS === 'web') {
                setTimeout(() => {
                  window.location.href = window.location.origin + '/login';
                }, 50);
              }
            }
          }
        }
      ]
    );
  };

  const handleSave = () => {
    console.log("Saving profile:", { name, email });
    setIsEditing(false);
    Alert.alert('Succes', 'Profiel opgeslagen!');
  };
  
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    if (authMode === 'register') {
      setName('');
    }
  };

  const renderAuthForm = () => {
    if (authMode === 'login') {
      return (
        <View style={styles.authSection}>
          <Text style={styles.authTitle}>Inloggen</Text>
          <Text style={styles.authSubtitle}>Welkom terug! Log in om door te gaan.</Text>
          
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mailadres</Text>
              <View style={styles.inputContainer}>
                <Mail color="#999" size={20} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Voer je e-mailadres in"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wachtwoord</Text>
              <View style={styles.inputContainer}>
                <Lock color="#999" size={20} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Voer je wachtwoord in"
                  placeholderTextColor="#666"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color="#999" size={20} />
                  ) : (
                    <Eye color="#999" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, authLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={authLoading}
          >
            <Text style={styles.buttonText}>
              {authLoading ? 'Inloggen...' : 'Inloggen'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.authSwitch}>
            <Text style={styles.authSwitchText}>Nog geen account? </Text>
            <TouchableOpacity onPress={() => { setAuthMode('register'); resetForm(); }}>
              <Text style={styles.authSwitchLink}>Registreer hier</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    if (authMode === 'register') {
      return (
        <View style={styles.authSection}>
          <Text style={styles.authTitle}>Registreren</Text>
          <Text style={styles.authSubtitle}>Maak een account aan om te beginnen.</Text>
          
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Naam</Text>
              <View style={styles.inputContainer}>
                <User color="#999" size={20} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Voer je naam in"
                  placeholderTextColor="#666"
                  autoComplete="name"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mailadres</Text>
              <View style={styles.inputContainer}>
                <Mail color="#999" size={20} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Voer je e-mailadres in"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wachtwoord</Text>
              <View style={styles.inputContainer}>
                <Lock color="#999" size={20} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Voer je wachtwoord in"
                  placeholderTextColor="#666"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color="#999" size={20} />
                  ) : (
                    <Eye color="#999" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bevestig wachtwoord</Text>
              <View style={styles.inputContainer}>
                <Lock color="#999" size={20} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Bevestig je wachtwoord"
                  placeholderTextColor="#666"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff color="#999" size={20} />
                  ) : (
                    <Eye color="#999" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Registreren...' : 'Account aanmaken'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.authSwitch}>
            <Text style={styles.authSwitchText}>Al een account? </Text>
            <TouchableOpacity onPress={() => { setAuthMode('login'); resetForm(); }}>
              <Text style={styles.authSwitchLink}>Log hier in</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
  
  const renderProfile = () => {
    return (
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <User color="#FFF" size={40} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welkom terug!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          {selectedClubs && selectedClubs.length > 0 && (
            <Text style={styles.permissionsText}>
              Aangemeld bij {selectedClubs.length} club{selectedClubs.length !== 1 ? 's' : ''}
            </Text>
          )}
          {user?.clubPermissions && user.clubPermissions.length > 0 && (
            <Text style={styles.permissionsText}>
              API toegang tot {user.clubPermissions.length} club{user.clubPermissions.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Naam</Text>
            <View style={styles.inputContainer}>
              <User color="#999" size={20} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Voer je naam in"
                placeholderTextColor="#666"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mailadres</Text>
            <View style={styles.inputContainer}>
              <Mail color="#999" size={20} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Voer je e-mailadres in"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Clubs Section */}
        {userClubs.length > 0 && (
          <View style={styles.clubsSection}>
            <Text style={styles.clubsSectionTitle}>
              Alle Clubs ({userClubs.length})
            </Text>
            {userClubs.map((club) => {
              const isSelected = selectedClubs?.includes(club.id);
              const hasAPIAccess = user?.clubPermissions?.includes(club.id);
              
              return (
                <View key={club.id} style={styles.clubItem}>
                  <View style={styles.clubLogo}>
                    <Text style={styles.clubLogoText}>
                      {club.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubSubtitle}>{club.subtitle}</Text>
                    <Text style={styles.clubType}>{club.type}</Text>
                    <View style={styles.clubBadges}>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.badgeText}>Geselecteerd</Text>
                        </View>
                      )}
                      {hasAPIAccess && (
                        <View style={styles.apiBadge}>
                          <Text style={styles.badgeText}>API Toegang</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
            
            {/* Show total count */}
            <View style={styles.clubsSummary}>
              <Text style={styles.summaryText}>
                Totaal: {userClubs.length} club{userClubs.length !== 1 ? 's' : ''}
              </Text>
              {selectedClubs && selectedClubs.length > 0 && (
                <Text style={styles.summaryText}>
                  • {selectedClubs.length} geselecteerd
                </Text>
              )}
              {user?.clubPermissions && user.clubPermissions.length > 0 && (
                <Text style={styles.summaryText}>
                  • {user.clubPermissions.length} met API toegang
                </Text>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, isEditing && styles.saveButton]} 
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <Save color="#000" size={20} />
              <Text style={styles.buttonText}>Opslaan</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Bewerken</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAuthenticated ? 'Profiel' : authMode === 'login' ? 'Inloggen' : 'Registreren'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {isAuthenticated ? renderProfile() : renderAuthForm()}
        </ScrollView>
      </KeyboardAvoidingView>
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
  profileSection: {
    padding: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 5,
  },
  permissionsText: {
    fontSize: 12,
    color: "#C4FF00",
    fontWeight: "bold",
  },
  clubsSection: {
    marginBottom: 30,
  },
  clubsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  clubLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C4FF00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  clubLogoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 2,
  },
  clubSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 2,
  },
  clubType: {
    fontSize: 12,
    color: "#C4FF00",
    fontStyle: "italic",
  },
  clubBadges: {
    flexDirection: "row",
    marginTop: 5,
    gap: 8,
  },
  selectedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  apiBadge: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "bold",
  },
  clubsSummary: {
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  summaryText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 15,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#C4FF00",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#C4FF00",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  authSection: {
    padding: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
  },
  authSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  authSwitchText: {
    color: "#999",
    fontSize: 14,
  },
  authSwitchLink: {
    color: "#C4FF00",
    fontSize: 14,
    fontWeight: "bold",
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
});