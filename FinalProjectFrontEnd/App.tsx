// App.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { I18nextProvider } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import darkTheme from './themes/DarkTheme';
import dayTheme from './themes/DayTheme';
import i18n from './locales/i18n';
import { ThemeColors } from './types/theme';
import { ensureRTLReady } from './utils/rtlUtils';
import { useAuthStore } from './stores/AuthStore';
import AppNavigator from './navigation/AppNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import BootSplash from 'react-native-bootsplash';
import { useIsAuthenticated } from './stores/AuthStore';

// Dev imports for testing
import {
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
} from './hooks/useAuth';
import { apiClient } from './api';
import Config from 'react-native-config';

// Dev component for testing auth functionality
const DevAuthTester = () => {
  const { firebaseUser, serverUser, isLoading } = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const {
    login,
    isLoading: loginLoading,
    error: loginError,
    clearError: clearLoginError,
  } = useLogin();
  const {
    register,
    isLoading: registerLoading,
    error: registerError,
    clearError: clearRegisterError,
  } = useRegister();
  const { logout, isLoading: logoutLoading } = useLogout();
  const [apiStatus, setApiStatus] = useState<string>('Not tested');

  const testApiConnection = async () => {
    setApiStatus('Testing...');
    try {
      const result = await apiClient.testConnection();
      setApiStatus(
        result.success ? '✅ Connected' : `❌ Failed: ${result.error}`,
      );
    } catch (error) {
      setApiStatus(`🚨 Error: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      clearLoginError();
      await login({
        email: 'test@example.com',
        password: 'password123',
      });
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      Alert.alert('Error', loginError || 'Login failed');
    }
  };

  const testRegister = async () => {
    try {
      clearRegisterError();
      await register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      });
      Alert.alert('Success', 'Registration successful!');
    } catch (error) {
      Alert.alert('Error', registerError || 'Registration failed');
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logout successful!');
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  return (
    <View style={devStyles.container}>
      <Text style={devStyles.title}>🔧 Dev Auth Tester</Text>

      {/* API Configuration */}
      <View style={devStyles.section}>
        <Text style={devStyles.sectionTitle}>API Configuration:</Text>
        <Text style={devStyles.info}>Base URL: {apiClient.getBaseURL()}</Text>
        <Text style={devStyles.info}>
          Config.API_URL: {Config.API_URL || 'undefined'}
        </Text>
        <Text style={devStyles.info}>Status: {apiStatus}</Text>

        <TouchableOpacity
          style={[
            devStyles.button,
            { backgroundColor: '#9C27B0', marginTop: 8 },
          ]}
          onPress={testApiConnection}
        >
          <Text style={devStyles.buttonText}>🌐 Test API Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Status */}
      <View style={devStyles.section}>
        <Text style={devStyles.sectionTitle}>Auth Status:</Text>
        <Text style={devStyles.status}>
          Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={devStyles.status}>
          Loading: {isLoading ? '⏳ Yes' : '✅ No'}
        </Text>
      </View>

      {/* Firebase User Info */}
      <View style={devStyles.section}>
        <Text style={devStyles.sectionTitle}>Firebase User:</Text>
        {firebaseUser ? (
          <>
            <Text style={devStyles.info}>UID: {firebaseUser.uid}</Text>
            <Text style={devStyles.info}>Email: {firebaseUser.email}</Text>
            <Text style={devStyles.info}>
              Verified: {firebaseUser.emailVerified ? '✅' : '❌'}
            </Text>
          </>
        ) : (
          <Text style={devStyles.info}>No Firebase user</Text>
        )}
      </View>

      {/* Server User Info */}
      <View style={devStyles.section}>
        <Text style={devStyles.sectionTitle}>Server User:</Text>
        {serverUser ? (
          <>
            <Text style={devStyles.info}>ID: {serverUser.id}</Text>
            <Text style={devStyles.info}>
              Name: {serverUser.firstName} {serverUser.lastName}
            </Text>
            <Text style={devStyles.info}>Role: {serverUser.role}</Text>
          </>
        ) : (
          <Text style={devStyles.info}>No server user</Text>
        )}
      </View>

      {/* Test Buttons */}
      <View style={devStyles.section}>
        <Text style={devStyles.sectionTitle}>Test Actions:</Text>

        <TouchableOpacity
          style={[devStyles.button, devStyles.loginButton]}
          onPress={testLogin}
          disabled={loginLoading}
        >
          <Text style={devStyles.buttonText}>
            {loginLoading ? 'Logging in...' : '🔑 Test Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[devStyles.button, devStyles.registerButton]}
          onPress={testRegister}
          disabled={registerLoading}
        >
          <Text style={devStyles.buttonText}>
            {registerLoading ? 'Registering...' : '📝 Test Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[devStyles.button, devStyles.logoutButton]}
          onPress={testLogout}
          disabled={logoutLoading || !isAuthenticated}
        >
          <Text style={devStyles.buttonText}>
            {logoutLoading ? 'Logging out...' : '🚪 Test Logout'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Errors */}
      {(loginError || registerError) && (
        <View style={devStyles.section}>
          <Text style={devStyles.sectionTitle}>Errors:</Text>
          {loginError && (
            <Text style={devStyles.error}>Login: {loginError}</Text>
          )}
          {registerError && (
            <Text style={devStyles.error}>Register: {registerError}</Text>
          )}
        </View>
      )}

      {/* Clear Errors Button */}
      {(loginError || registerError) && (
        <TouchableOpacity
          style={[devStyles.button, { backgroundColor: '#9E9E9E' }]}
          onPress={() => {
            clearLoginError();
            clearRegisterError();
          }}
        >
          <Text style={devStyles.buttonText}>🧹 Clear Errors</Text>
        </TouchableOpacity>
      )}

      {/* Debug Info */}
      <View style={devStyles.section}>
        <Text style={devStyles.sectionTitle}>Troubleshooting:</Text>
        <Text style={devStyles.troubleshoot}>
          • Make sure your server is running on port 3000{'\n'}• Check your .env
          file for API_URL{'\n'}• For Android emulator: use 10.0.2.2{'\n'}• For
          device: use your computer's IP{'\n'}• Check console logs for detailed
          requests
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : dayTheme;

  const [isInitialized, isLoading] = useAuthStore(
    useShallow(state => [state.isInitialized, state.isLoading]),
  );

  const [isRTLReady, setIsRTLReady] = useState(false);
  const [showDevTester, setShowDevTester] = useState(__DEV__); // Show in dev mode by default
  const [initError, setInitError] = useState<string | null>(null);
  const initializeAuth = useAuthStore(s => s.initialize);

  const colors: ThemeColors = theme.colors as ThemeColors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  /* bootstrap with better error handling */
  useEffect(() => {
    const init = async () => {
      try {
        setInitError(null);
        await ensureRTLReady();
        setIsRTLReady(true);
        await initializeAuth();
      } catch (error) {
        console.error('Initialization error:', error);
        setInitError(
          error instanceof Error ? error.message : 'Initialization failed',
        );
      }
    };

    init();
  }, [initializeAuth]);

  // Hide BootSplash when app is fully ready
  useEffect(() => {
    const hideBootSplash = async () => {
      // Only hide when everything is ready
      if (isRTLReady && !isLoading && isInitialized) {
        try {
          await BootSplash.hide();
          console.log('BootSplash has been hidden successfully');
        } catch (error) {
          console.error('Error hiding BootSplash:', error);
        }
      }
    };

    hideBootSplash();
  }, [isRTLReady, isLoading, isInitialized]);

  // Show loading screen while initializing (BootSplash is still visible during this time)
  if (!isRTLReady || isLoading || !isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={[styles.app, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
          {initError && <Text style={styles.errorText}>{initError}</Text>}
        </View>
      </SafeAreaProvider>
    );
  }

  // Show Dev Tester in development mode
  if (__DEV__ && showDevTester) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.app}>
          <StatusBar
            translucent
            backgroundColor={colors.background}
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          />
          <ScrollView style={styles.app} showsVerticalScrollIndicator={false}>
            <DevAuthTester />

            {/* Toggle button to switch to main app */}
            <TouchableOpacity
              style={[devStyles.button, devStyles.switchButton]}
              onPress={() => setShowDevTester(false)}
            >
              <Text style={devStyles.buttonText}>🚀 Switch to Main App</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <StatusBar
          translucent
          backgroundColor={colors.background}
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />

        {/* Dev toggle button (only in dev mode) */}
        {__DEV__ && (
          <TouchableOpacity
            style={devStyles.devToggle}
            onPress={() => setShowDevTester(true)}
          >
            <Text style={devStyles.devToggleText}>🔧</Text>
          </TouchableOpacity>
        )}

        <KeyboardProvider>
          <I18nextProvider i18n={i18n}>
            <PaperProvider theme={theme}>
              <AppNavigator />
            </PaperProvider>
          </I18nextProvider>
        </KeyboardProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    app: { flex: 1, backgroundColor: colors.background },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: colors.error || '#f44336',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 20,
    },
  });

// Dev styles for the auth tester
const devStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  button: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
  },
  registerButton: {
    backgroundColor: '#2196F3',
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  switchButton: {
    backgroundColor: '#FF9800',
    marginTop: 20,
  },
  error: {
    color: '#f44336',
    fontSize: 14,
    marginBottom: 5,
  },
  troubleshoot: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  devToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#FF9800',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devToggleText: {
    fontSize: 18,
  },
});
