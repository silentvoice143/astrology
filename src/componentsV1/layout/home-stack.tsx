import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../../screens/home/index';
import CustomerSupport from '../../screens/customer-support/index';
import Wallet from '../../screens/wallet';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Wallet" component={Wallet} />

      {/* Extra screens that should keep bottom tabs */}
      <Stack.Screen name="CustomerSupport" component={CustomerSupport} />
    </Stack.Navigator>
  );
}
