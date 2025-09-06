// navigation/EditPetNavigation.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditPetFirstStep from '../screens/Edit/EditPetFirstStep';

export type EditPetStackParamList = {
  EditPetFirstStep: { petId: string };
};

const Stack = createNativeStackNavigator<EditPetStackParamList>();

const EditPetNavigation: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="EditPetFirstStep"
      screenOptions={{
        headerShown: true,
        headerTitle: 'Edit Pet',
      }}
    >
      <Stack.Screen
        name="EditPetFirstStep"
        component={EditPetFirstStep}
        options={{ headerTitle: 'Edit Pet' }}
      />
    </Stack.Navigator>
  );
};

export default EditPetNavigation;
