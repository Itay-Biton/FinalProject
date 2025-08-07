// navigation/RegisterPetNavigation.tsx
import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import CustomBackButton from '../components/UI/CustomBackButton';
import RegisterPetFirstStep from '../screens/RegisterPet/RegisterPetFirstStep';
import RegisterPetSecondStep from '../screens/RegisterPet/RegisterPetSecondStep';
import RegisterPetThirdStep from '../screens/RegisterPet/RegisterPetThirdStep';

export type RegisterPetStackParamList = {
  RegisterPetFirstStep: undefined;
  RegisterPetSecondStep: { petId: string };
  RegisterPetThirdStep: { petId: string };
  RegisterPetFourthStep: undefined;
};

const Stack = createNativeStackNavigator<RegisterPetStackParamList>();

export default function RegisterPetNavigation() {
  const { colors } = useTheme();
  const renderBack = useCallback(() => <CustomBackButton />, []);

  return (
    <Stack.Navigator
      initialRouteName="RegisterPetFirstStep"
      screenOptions={{
        animation: 'none',
        headerTitle: '',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerLeft: renderBack,
      }}
    >
      <Stack.Screen
        name="RegisterPetFirstStep"
        component={RegisterPetFirstStep}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterPetSecondStep"
        component={RegisterPetSecondStep}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterPetThirdStep"
        component={RegisterPetThirdStep}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
