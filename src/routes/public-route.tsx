import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/login';
import Otp from '../screens/otp';

const Stack = createNativeStackNavigator();

export default function PublicRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'none', // disables animation
      }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Otp" component={Otp} />
    </Stack.Navigator>
  );
}
