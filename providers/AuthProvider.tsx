import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '@/services/apiService';
import { SSOService } from '@/services/ssoService';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  clubPermissions: string[]; // Club IDs the user has access to
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSSO: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  hasClubAccess: (clubId: string) => boolean;
  getUserClubs: () => string[];
}

const AUTH_STORAGE_KEY = '@auth_user';
const TOKEN_STORAGE_KEY = '@auth_token';

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking authentication status...');

      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      ]);

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        console.log('✅ Found stored user:', userData.email);
        
        // Verify token is still valid by making a test API call
        try {
          const apiUser = await ApiService.getUser(undefined, { 
            email_address: userData.email 
          });
          
          if (apiUser) {
            // Update user data from API
            const updatedUser: User = {
              id: apiUser.id?.toString() || userData.id,
              email: userData.email,
              firstName: apiUser.first_name,
              lastName: apiUser.last_name,
              clubPermissions: userData.clubPermissions || [],
              isEmailVerified: apiUser.email_verified || false,
              createdAt: userData.createdAt,
              updatedAt: new Date().toISOString(),
            };
            
            setUser(updatedUser);
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
            console.log('✅ User authenticated and updated');
          } else {
            // Token invalid, clear storage
            await clearAuthStorage();
            console.log('❌ Token invalid, cleared storage');
          }
        } catch (apiError) {
          console.log('⚠️ API verification failed, using cached user');
          setUser(userData);
        }
      } else {
        console.log('❌ No stored authentication found');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setError('Failed to check authentication status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAuthStorage = useCallback(async () => {
    console.log('🧹 Starting complete data clearance...');
    
    // Get all keys first to see what we're working with
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 All AsyncStorage keys before clear:', allKeys);
    
    // Clear authentication data
    console.log('🔐 Clearing authentication data...');
    await Promise.all([
      AsyncStorage.removeItem(AUTH_STORAGE_KEY),
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
    ]);
    
    // Clear club selection data
    console.log('🏟️ Clearing club selection data...');
    await Promise.all([
      AsyncStorage.removeItem('selectedClubs'),
      AsyncStorage.removeItem('currentClubId'),
    ]);
    
    // Clear ALL cache data (both @cache_ and other app data)
    console.log('💾 Clearing all cache data...');
    const cacheKeys = allKeys.filter(key => 
      key.startsWith('@cache_') || 
      key.includes('cache') ||
      key.includes('Cache')
    );
    
    // Also clear other app data
    const appDataKeys = allKeys.filter(key => 
      key.includes('liked') ||
      key.includes('settings') ||
      key.includes('favorites')
    );
    
    const allKeysToRemove = [...cacheKeys, ...appDataKeys];
    
    if (allKeysToRemove.length > 0) {
      await AsyncStorage.multiRemove(allKeysToRemove);
      console.log(`🗑️ Cleared ${allKeysToRemove.length} cache/app data entries:`, allKeysToRemove);
    }
    
    // Clear React state
    setUser(null);
    setError(null);
    
    // Verify clearance
    const remainingKeys = await AsyncStorage.getAllKeys();
    console.log('📋 Remaining AsyncStorage keys after clear:', remainingKeys);
    
    console.log('✅ Complete data clearance finished');
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Attempting login for:', email);

      // For now, we'll simulate a successful login
      // In real implementation, you'd validate credentials
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email: email,
        firstName: 'Test',
        lastName: 'User',
        clubPermissions: [], // Will be populated after club selection
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser)),
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, 'mock_token_' + Date.now()),
      ]);

      setUser(mockUser);
      console.log('✅ Login successful');
      return true;

    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithSSO = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Attempting SSO login for:', email);

      // Use the SSO service for complete authentication flow
      const authResult = await SSOService.authenticateUser(email);
      
      if (!authResult) {
        setError('SSO authentication failed. Please check your email or try again.');
        return false;
      }

      const { user: apiUser, ingestToken } = authResult;

      // Create user object with API data
      const user: User = {
        id: apiUser.id?.toString() || 'user_' + Date.now(),
        email: email,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        clubPermissions: apiUser.owned_price_plans?.map(String) || [], // Convert to string array
        isEmailVerified: apiUser.email_verified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store authentication
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, ingestToken),
      ]);

      setUser(user);
      console.log('✅ SSO login successful');
      console.log('🎫 User has access to price plans:', user.clubPermissions);
      return true;

    } catch (error) {
      console.error('❌ SSO login error:', error);
      setError('SSO login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 AuthProvider: Starting logout...');
      setIsLoading(true);
      await clearAuthStorage();
      console.log('✅ AuthProvider: Logout successful - user cleared');
    } catch (error) {
      console.error('❌ AuthProvider: Logout error:', error);
      setError('Failed to logout');
      throw error; // Re-throw so the UI can handle it
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthStorage]);

  const hasClubAccess = useCallback((clubId: string): boolean => {
    return user?.clubPermissions.includes(clubId) || false;
  }, [user]);

  const getUserClubs = useCallback((): string[] => {
    return user?.clubPermissions || [];
  }, [user]);

  return useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithSSO,
    logout,
    checkAuthStatus,
    hasClubAccess,
    getUserClubs,
  }), [
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithSSO,
    logout,
    checkAuthStatus,
    hasClubAccess,
    getUserClubs,
  ]);
});
