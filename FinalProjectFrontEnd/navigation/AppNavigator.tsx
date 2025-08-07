import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigation from './AuthNavigation';
import RegisterPetNavigation from './RegisterPetNavigation';
import RegisterBusinessNavigation from './RegisterBusinessNavigation';
import MainTabNavigation from './MainTabNavigation';

export type RootStackParamList = {
  AuthNavigation: undefined;
  RegisterPetNavigation: undefined;
  RegisterBusinessNavigation: undefined;
  MainTabNavigation: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="MainTabNavigation" // Change this to test different flows
      >
        <RootStack.Screen name="AuthNavigation" component={AuthNavigation} />
        <RootStack.Screen
          name="RegisterPetNavigation"
          component={RegisterPetNavigation}
        />
        <RootStack.Screen
          name="RegisterBusinessNavigation"
          component={RegisterBusinessNavigation}
        />
        <RootStack.Screen
          name="MainTabNavigation"
          component={MainTabNavigation}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
