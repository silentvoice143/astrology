import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import Login from '../screens/login';
import Otp from '../screens/otp';
import Register from '../screens/auth/register';
import Login from '../screens/auth/login-password';
import CustomerSupportPublic from '../screens/customer-support-public';

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
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="CustomerSupport" component={CustomerSupportPublic} />
    </Stack.Navigator>
  );
}
