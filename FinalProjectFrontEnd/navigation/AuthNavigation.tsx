import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import CustomBackButton from '../components/UI/CustomBackButton'; // import the custom back button
import { useTheme } from 'react-native-paper';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigation() {
  const { colors } = useTheme();

  // Memoize the headerLeft renderer to avoid recreating it on every rende

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        animation: 'none',
        headerTitle: '',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
