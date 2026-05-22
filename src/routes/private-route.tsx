import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/home';
// import Astrologers from '../screens/astrologers';
import Kundli from '../screens/kundli';
import DetailsProfile from '../screens/DetailsProfile';
import ChatHistory from '../screens/ChatHistory';
import Wallet from '../screens/wallet';
import { ChatScreenDemo } from '../screens/chat.';
import RequestScreen from '../screens/request';
import KundliForm from '../screens/kundli-form';
import { useAppSelector } from '../hooks/redux-hook';
import { useNavigation } from '@react-navigation/native';
import { useUserRole } from '../hooks/use-role';
import { useSessionEvents } from '../hooks/use-session-events';
import About from '../screens/about';
import Call from '../screens/call/call';

import CustomerSupport from '../screens/customer-support';
import Remedies from '../screens/remedies';
import ProfilePage from '../screens/profile/profile';
import Horoscope from '../screens/horoscope';
import MatchMaking from '../screens/match-making';
import Tarot from '../screens/tarot';
import LanguageSetting from '../screens/settings/language-setting';
import TermsAndConditions from '../screens/settings/terms-conditions';

import { useQueueCountOnResume } from '../hooks/use-queue-count';
import ChangePassword from '../screens/settings/change-password';
import Setting from '../screens/settings';
import UserProfileEdit from '../screens/profile/pofile-edit';
import Astrologers from '../screens/astrologer-list/astrologers.tsx';
import AstrologersList from '../screens/astrologer-list/astrologers.tsx';


const Stack = createNativeStackNavigator();

export default function PrivateRoutes() {
  console.log("Privare route............")
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const role = useUserRole();
  useSessionEvents(user?.id, isAuthenticated);
  useQueueCountOnResume(isAuthenticated, role);
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="ProfileEdit" component={UserProfileEdit} />
      <Stack.Screen name="Astrologers" component={AstrologersList} />
      <Stack.Screen name="Kundli" component={Kundli} />
      <Stack.Screen name="KundliForm" component={KundliForm} />
      <Stack.Screen name="DetailsProfile" component={DetailsProfile} />
      <Stack.Screen name="Horoscope" component={Horoscope} />
      <Stack.Screen name="MatchMaking" component={MatchMaking} />
      <Stack.Screen name="Tarot" component={Tarot} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="chat" component={ChatScreenDemo} />
      <Stack.Screen name="call" component={Call} />
      <Stack.Screen name="session-request" component={RequestScreen} />
      <Stack.Screen name="Remedies" component={Remedies} />
      <Stack.Screen name="about" component={About} />
      <Stack.Screen name="customer-support" component={CustomerSupport} />
      <Stack.Screen name="Setting" component={Setting} />
      <Stack.Screen name="Language" component={LanguageSetting} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
}
