import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterBusinessFirstStep from '../screens/RegisterBusiness/RegisterBusinessFirstStep';
import RegisterBusinessSecondStep from '../screens/RegisterBusiness/RegisterBusinessSecondStep';
import RegisterBusinessThirdStep from '../screens/RegisterBusiness/RegisterBusinessThirdStep';
import CustomBackButton from '../components/UI/CustomBackButton';
import { useTheme } from 'react-native-paper';

export type RegisterBusinessStackParamList = {
  RegisterBusinessFirstStep: undefined;
  RegisterBusinessSecondStep: { businessId: string };
  RegisterBusinessThirdStep: { businessId: string };
};

const Stack = createNativeStackNavigator<RegisterBusinessStackParamList>();

export default function RegisterBusinessNavigation() {
  const { colors } = useTheme();

  // Memoize the headerLeft renderer to avoid recreating it on every render
  const renderCustomBackButton = useCallback(() => <CustomBackButton />, []);

  return (
    <Stack.Navigator
      initialRouteName="RegisterBusinessFirstStep"
      screenOptions={{
        animation: 'none',
        headerTitle: '',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="RegisterBusinessFirstStep"
        component={RegisterBusinessFirstStep}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterBusinessSecondStep"
        component={RegisterBusinessSecondStep}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterBusinessThirdStep"
        component={RegisterBusinessThirdStep}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
