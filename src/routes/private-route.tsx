import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/home';
import Astrologers from '../screens/astrologers';
import Kundli from '../screens/kundli';
import DetailsProfile from '../screens/DetailsProfile';
import ChatHistory from '../screens/ChatHistory';
import Wallet from '../screens/wallet';
import ChatScreen from '../screens/chat-screen';
import ExampleScreen, {ChatScreenDemo} from '../screens/chat.';
import RequestScreen from '../screens/request';
import KundliForm from '../screens/kundli-form';
import {useSessionEvents} from '../hooks/use-session-events';
import {useAppSelector} from '../hooks/redux-hook';

const Stack = createNativeStackNavigator();

export default function PrivateRoutes() {
  const {user, isAuthenticated} = useAppSelector((state: any) => state.auth);

  useSessionEvents(user?.id, isAuthenticated);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Astrologers" component={Astrologers} />
      <Stack.Screen name="Kundli" component={Kundli} />
      <Stack.Screen name="KundliForm" component={KundliForm} />
      <Stack.Screen name="DetailsProfile" component={DetailsProfile} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="chat-screen" component={ChatScreen} />
      <Stack.Screen name="chat" component={ChatScreenDemo} />
      <Stack.Screen name="session-request" component={RequestScreen} />
    </Stack.Navigator>
  );
}
