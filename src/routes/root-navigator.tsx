import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/login';
import Register from '../screens/auth/register';
import BottomTabNavigator from '../componentsV1/layout/bottom-tabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Public screens (no bottom tabs) */}

      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />

      {/* Private section with Bottom Tabs */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Screens that should NOT show tabs */}
      {/* <Stack.Screen name="Details" component={Details} /> */}
    </Stack.Navigator>
  );
}
