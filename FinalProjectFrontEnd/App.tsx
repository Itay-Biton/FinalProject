// App.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  useColorScheme,
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

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : dayTheme;

  const [isInitialized, isLoading] = useAuthStore(
    useShallow(state => [state.isInitialized, state.isLoading]),
  );

  const [isRTLReady, setIsRTLReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const initializeAuth = useAuthStore(s => s.initialize);

  const colors: ThemeColors = theme.colors as ThemeColors;
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  useEffect(() => {
    const hideBootSplash = async () => {
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <StatusBar
          translucent
          backgroundColor={colors.background}
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
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
