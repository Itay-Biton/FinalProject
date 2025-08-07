// utils/LocationPermissions.tsx
import { useCallback, useState, useEffect } from 'react';
import { Alert, Platform, AppState } from 'react-native';
import Geolocation, {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

/**
 * Hook to request location permission and fetch current coords.
 */
export function useLocationPermission() {
  const [loading, setLoading] = useState(false);
  const [waitingForSettings, setWaitingForSettings] = useState(false);

  // Return the appropriate permission constant for the current platform
  const getLocationPermission = useCallback(() => {
    return Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }, []);

  // Show instructions to the user on how to enable location in settings
  const showPermissionInstructions = useCallback(() => {
    const isIOS = Platform.OS === 'ios';
    const title = 'Location Permission Required';
    const message = isIOS
      ? 'To get your current location:\n\n1. Tap "Open Settings" below\n2. Tap "Location Services"\n3. Make sure it\'s enabled\n4. Return to the app'
      : 'To get your current location:\n\n1. Tap "Open Settings" below\n2. Tap "Permissions"\n3. Tap "Location"\n4. Select "Allow all the time" or "Allow only while using app"\n5. Return to the app';

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setWaitingForSettings(false),
      },
      {
        text: 'Open Settings',
        style: 'default',
        onPress: async () => {
          setWaitingForSettings(true);
          try {
            await openSettings();
          } catch (error) {
            console.error('Failed to open settings:', error);
            setWaitingForSettings(false);
            Alert.alert(
              'Error',
              'Could not open settings. Please go to Settings > Apps > [Your App Name] > Permissions > Location manually.',
              [{ text: 'OK' }],
            );
          }
        },
      },
    ]);
  }, []);

  // Check and request the location permission from the OS
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const permission = getLocationPermission();
    const status = await check(permission);

    console.log('Current permission status:', status);

    if (status === RESULTS.GRANTED) {
      return true;
    }

    if (status === RESULTS.DENIED) {
      const result = await request(permission);
      console.log('Permission request result:', result);

      if (result === RESULTS.GRANTED) {
        return true;
      }
      // Permanently denied or still denied
      showPermissionInstructions();
      return false;
    }

    if (status === RESULTS.BLOCKED) {
      showPermissionInstructions();
      return false;
    }

    if (status === RESULTS.UNAVAILABLE) {
      Alert.alert(
        'Location Unavailable',
        'Location services are not available on this device.',
        [{ text: 'OK' }],
      );
      return false;
    }

    return false;
  }, [getLocationPermission, showPermissionInstructions]);

  // Fetch the current position, handling permissions, errors, and settings flow
  const getCurrentLocation =
    useCallback(async (): Promise<LocationCoords | null> => {
      if (waitingForSettings) return null;

      setLoading(true);

      try {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          setLoading(false);
          return null;
        }

        return new Promise<LocationCoords | null>(resolve => {
          Geolocation.getCurrentPosition(
            (position: GeolocationResponse) => {
              setLoading(false);
              const { latitude, longitude } = position.coords;
              console.log('Location retrieved:', { latitude, longitude });
              resolve({ latitude, longitude });
            },
            (error: GeolocationError) => {
              console.error('getCurrentPosition error:', error);
              setLoading(false);

              let errorMessage =
                'Unable to get your location. Please try again.';
              let showRetry = true;

              switch (error.code) {
                case 1: // PERMISSION_DENIED
                  errorMessage =
                    'Location permission was denied. Please enable location access in settings.';
                  showRetry = false;
                  showPermissionInstructions();
                  break;
                case 2: // POSITION_UNAVAILABLE
                  errorMessage =
                    'Your location could not be determined. Please make sure location services are enabled and try again.';
                  break;
                case 3: // TIMEOUT
                  errorMessage =
                    'Location request timed out. Please try again.';
                  break;
                default:
                  break;
              }

              if (showRetry) {
                Alert.alert('Location Error', errorMessage, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Try Again', onPress: () => getCurrentLocation() },
                ]);
              }

              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            },
          );
        });
      } catch (error) {
        console.error('Location request failed:', error);
        setLoading(false);

        Alert.alert(
          'Location Error',
          'An unexpected error occurred. Please try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => getCurrentLocation() },
          ],
        );
        return null;
      }
    }, [requestPermission, showPermissionInstructions, waitingForSettings]);

  // Allow manual retry once the user returns from settings
  const retryAfterSettings = useCallback(() => {
    if (!loading && !waitingForSettings) {
      getCurrentLocation();
    }
  }, [getCurrentLocation, loading, waitingForSettings]);

  // When the app becomes active again after going to settings, retry location
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && waitingForSettings) {
        setWaitingForSettings(false);
        setTimeout(() => {
          getCurrentLocation();
        }, 500);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [getCurrentLocation, waitingForSettings]);

  return {
    getCurrentLocation,
    loading: loading || waitingForSettings,
    retryAfterSettings,
    waitingForSettings,
  };
}
