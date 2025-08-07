// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import authService from '../services/authService';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions (these will be used by the hooks, not directly by components)
  setAuthData: (user: User, token: string) => void;
  clearAuthData: () => void;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Set authentication data (called by hooks after successful auth)
  const setAuthData = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    storeUserData(userData, userToken);
  };

  // Clear authentication data (called by hooks on logout)
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    clearStoredData();
  };

  // Refresh token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const newToken = await authService.getIdToken(true);
      if (newToken) {
        setToken(newToken);
        await AsyncStorage.setItem('firebase_id_token', newToken);
      }
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  // Store user data and token
  const storeUserData = async (userData: User, userToken: string) => {
    try {
      await AsyncStorage.multiSet([
        ['user_data', JSON.stringify(userData)],
        ['firebase_id_token', userToken],
      ]);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  // Clear stored data
  const clearStoredData = async () => {
    try {
      await AsyncStorage.multiRemove(['user_data', 'firebase_id_token']);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  };

  // Initialize auth state on app startup
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Check for stored user data
        const [storedUserData, storedToken] = await AsyncStorage.multiGet([
          'user_data',
          'firebase_id_token',
        ]);

        const userData = storedUserData[1]
          ? JSON.parse(storedUserData[1])
          : null;
        const tokenData = storedToken[1];

        if (userData && tokenData) {
          setUser(userData);
          setToken(tokenData);
        }

        // Listen for Firebase auth state changes
        unsubscribe = authService.onAuthStateChanged(
          async (firebaseUser: FirebaseAuthTypes.User | null) => {
            if (firebaseUser) {
              try {
                const idToken = await firebaseUser.getIdToken();
                const newUserData: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                  emailVerified: firebaseUser.emailVerified,
                };

                setUser(newUserData);
                setToken(idToken);
                await storeUserData(newUserData, idToken);
              } catch (error) {
                console.error('Error processing auth state change:', error);
                setUser(null);
                setToken(null);
                await clearStoredData();
              }
            } else {
              setUser(null);
              setToken(null);
              await clearStoredData();
            }
            setIsLoading(false);
          },
        );
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    setAuthData,
    clearAuthData,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
