// navigation/AppNavigator.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  useAuthStore,
  useCurrentUser,
  useIsInitialized,
} from '../stores/AuthStore';
import { apiServices } from '../api';

import AuthNavigation from './AuthNavigation';
import MainTabNavigation from './MainTabNavigation';
import RegisterPetNavigation from './RegisterPetNavigation';
import RegisterBusinessNavigation from './RegisterBusinessNavigation';

export type RootStackParamList = {
  // Shell routes
  Auth: undefined;
  MainTabs: undefined;

  // Global routes reachable from anywhere
  RegisterPetNavigation: undefined;
  RegisterBusinessNavigation: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { firebaseUser, serverUser, isLoading } = useCurrentUser();
  const isInitialized = useIsInitialized();
  const setServerUser = useAuthStore(s => s.setServerUser);

  const [serverChecked, setServerChecked] = useState(false);

  const fetchServerUser = useCallback(async () => {
    try {
      const res = await apiServices.user.getCurrentUser();
      if (res?.success && res.data) {
        setServerUser({
          id: res.data._id,
          firebaseUid: res.data.firebaseUid,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          role: res.data.role,
        });
      } else {
        setServerUser(null);
      }
    } catch (e) {
      setServerUser(null);
    } finally {
      setServerChecked(true);
    }
  }, [setServerUser]);

  // Decide if we need to check the server
  useEffect(() => {
    if (isLoading) return;

    if (firebaseUser && serverUser && !serverChecked) {
      setServerChecked(true);
      return;
    }

    if (!firebaseUser && !serverChecked) {
      setServerChecked(true);
      return;
    }

    if (firebaseUser && serverUser == null && !serverChecked) {
      fetchServerUser();
    }
  }, [isLoading, firebaseUser, serverUser, serverChecked, fetchServerUser]);

  // Safety timeout
  useEffect(() => {
    if (firebaseUser && serverUser == null && !serverChecked) {
      const t = setTimeout(() => setServerChecked(true), 8000);
      return () => clearTimeout(t);
    }
  }, [firebaseUser, serverUser, serverChecked]);

  const status = useMemo(() => {
    if (!isInitialized || isLoading) return 'booting';
    if (firebaseUser && serverUser == null && !serverChecked)
      return 'checking-server';
    if (!firebaseUser) return 'unauthenticated';
    if (!serverUser) return 'no-server-user';
    return 'authenticated';
  }, [isInitialized, isLoading, serverChecked, firebaseUser, serverUser]);

  if (status === 'booting' || status === 'checking-server') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const showAuth = status === 'unauthenticated' || status === 'no-server-user';

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showAuth ? (
          <RootStack.Screen name="Auth" component={AuthNavigation} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabNavigation} />
        )}

        <RootStack.Screen
          name="RegisterPetNavigation"
          component={RegisterPetNavigation}
        />
        <RootStack.Screen
          name="RegisterBusinessNavigation"
          component={RegisterBusinessNavigation}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
