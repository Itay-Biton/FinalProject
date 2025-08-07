// utils/ContactPermissions.tsx - Improved version
import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';
import Contacts, { Contact } from 'react-native-contacts';

export type ContactInfo = {
  recordID: string;
  displayName: string | null;
  givenName: string | null;
  familyName: string;
  phoneNumbers: Array<{
    label: string;
    number: string;
  }>;
  emailAddresses?: Array<{
    label: string;
    email: string;
  }>;
};

/**
 * Hook to request contact permission and access user contacts.
 * Uses react-native-permissions for consistent permission handling.
 */
export function useContactPermission() {
  const [loading, setLoading] = useState(false);

  // Get the correct permission for the platform
  const getContactPermission = useCallback((): Permission => {
    return Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CONTACTS
      : PERMISSIONS.ANDROID.READ_CONTACTS;
  }, []);

  // Request contact permission using react-native-permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = getContactPermission();

      // Step 1: Check current status
      const initialStatus = await check(permission);
      console.log('📱 Initial permission status:', initialStatus);
      console.log('📱 Platform:', Platform.OS);
      console.log('📱 Permission constant:', permission);

      if (initialStatus === RESULTS.GRANTED) {
        console.log('✅ Permission already granted');
        return true;
      }

      if (initialStatus === RESULTS.UNAVAILABLE) {
        console.log('❌ Permission unavailable on this device/simulator');
        Alert.alert(
          'Feature Unavailable',
          'Contact access is not available on this device/simulator. Try on a real device.',
          [{ text: 'OK' }],
        );
        return false;
      }

      // Step 2: Force request permission regardless of status
      console.log('🔄 Requesting permission...');
      const requestResult = await request(permission);
      console.log('📝 Request result:', requestResult);

      // Step 3: Double-check the status after request
      const finalStatus = await check(permission);
      console.log('🔍 Final status after request:', finalStatus);

      if (
        requestResult === RESULTS.GRANTED ||
        finalStatus === RESULTS.GRANTED
      ) {
        console.log('✅ Permission granted successfully');
        return true;
      }

      if (
        requestResult === RESULTS.BLOCKED ||
        finalStatus === RESULTS.BLOCKED
      ) {
        console.log('🚫 Permission blocked, must go to settings');
        Alert.alert(
          'Permission Required',
          'Contact access was denied. Please enable it in Settings to import contacts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
        return false;
      }

      // If denied, show explanation
      console.log('⚠️  Permission denied');
      Alert.alert(
        'Permission Denied',
        'Contact access is needed to import phone numbers. Please try again and allow access.',
        [{ text: 'OK' }],
      );
      return false;
    } catch (error) {
      console.error('❌ Contact permission error:', error);
      Alert.alert(
        'Error',
        `Permission request failed: ${error.message}. This might be a simulator issue - try on a real device.`,
        [{ text: 'OK' }],
      );
      return false;
    }
  }, [getContactPermission]);

  // Get all contacts for selection
  const getAllContacts = useCallback(async (): Promise<ContactInfo[]> => {
    setLoading(true);

    try {
      const hasPermission = await requestPermission();

      if (!hasPermission) {
        setLoading(false);
        return [];
      }

      const contacts = await Contacts.getAllWithoutPhotos();
      setLoading(false);

      return contacts
        .filter(
          contact => contact.phoneNumbers && contact.phoneNumbers.length > 0,
        )
        .map(contact => ({
          recordID: contact.recordID,
          displayName:
            contact.displayName ||
            `${contact.givenName || ''} ${contact.familyName || ''}`.trim(),
          givenName: contact.givenName,
          familyName: contact.familyName,
          phoneNumbers: contact.phoneNumbers || [],
          emailAddresses: contact.emailAddresses || [],
        }));
    } catch (error) {
      console.error('Get all contacts error:', error);
      Alert.alert('Error', 'Unable to load contacts. Please try again.', [
        { text: 'OK' },
      ]);
      setLoading(false);
      return [];
    }
  }, [requestPermission]);

  // Check if contact permission is granted
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = getContactPermission();
      const status = await check(permission);
      return status === RESULTS.GRANTED;
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }, [getContactPermission]);

  // Get detailed permission status (useful for debugging)
  const getPermissionStatus = useCallback(async () => {
    const permission = getContactPermission();
    const status = await check(permission);
    return status;
  }, [getContactPermission]);

  return {
    getAllContacts,
    checkPermission,
    getPermissionStatus, // New: for debugging permission issues
    loading,
  };
}
