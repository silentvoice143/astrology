import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/login';

import BottomTabNavigator from '../componentsV1/layout/bottom-tabs';
import Register from '../screens/auth/registerV1';
import {Text, View} from 'react-native';
import {clearSession} from '../store/reducer/session';
import Toast from 'react-native-toast-message';
import {use, useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {setWalletBalance, userDetail} from '../store/reducer/user';
import {
  logout,
  logoutDevice,
  registerDevice,
  setAuthentication,
  setBalance,
  setUser,
} from '../store/reducer/auth';
import {useWebSocket} from '../hooks/use-socket-new';
import {useUserRole} from '../hooks/use-role';
import CustomerSupport from '../screens/customer-support/index';
import SplashScreen from '../screens/splash';
import {useNavigation} from '@react-navigation/native';
import {set} from 'date-fns';
import CallChat from '../screens/call&chat';
import Wallet from '../screens/wallet';
import About from '../screens/about';
import Setting from '../screens/settings';
import LanguageSetting from '../screens/settings/language-setting';
import TermsAndConditions from '../screens/settings/terms-conditions';
import ChangePassword from '../screens/settings/change-password';
import ProfilePage from '../screens/profile/profile';
import ProfileEdit from '../screens/profile/pofile-edit';
import Notification from '../screens/notification';
import {useZegoAndFCM} from '../hooks/use-zego';
import useFcm from '../hooks/use-fcm';
import {
  ZegoUIKitPrebuiltCallInCallScreen,
  ZegoUIKitPrebuiltCallWaitingScreen,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {
  requestAndroidCallPermissions,
  requestOverlayPermission,
} from '../utils/requestPermission';
import ChatScreen from '../screens/call&chat/chatScreen';
import {useSessionEvents} from '../hooks/use-session-events';
import {getTransactionHistory} from '../store/reducer/payment';

const Stack = createNativeStackNavigator<any>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const {user, isAuthenticated, token} = useAppSelector(
    (state: any) => state.auth,
  );
  const role = useUserRole();
  const {connect, isConnected, disconnect, send} = useWebSocket(user?.id);
  const navigation = useNavigation<any>();

  useSessionEvents(user?.id, isAuthenticated, isConnected);
  const {fcmToken} = useFcm(isAuthenticated);
  // console.log(
  //   user?.mobile,
  //   user?.name?.slice(0, 20) || 'Guest',
  //   '-----------------this is zego user',
  // );
  const zegoInitialized = useZegoAndFCM(
    user?.mobile,
    user?.name?.slice(0, 20) || 'Guest',
    isAuthenticated,
  );

  const handleLogout = async () => {
    try {
      // dispatch(clearSession());
      disconnect();
      dispatch(logout());
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }, 5000);
    } catch (err) {}
  };

  const getTransactionDetails = async () => {
    try {
      setLoading(true);
      const payload = await dispatch(
        getTransactionHistory({query: `?page=1`}),
      ).unwrap();
      console.log('Transaction Payload: ', payload);

      if (payload.success) {
        dispatch(
          setBalance({
            balance: payload?.wallet?.balance - payload?.wallet?.lockedBalance,
          }),
        );
        dispatch(
          setWalletBalance(
            ((payload?.wallet?.balance as number) -
              payload?.wallet?.lockedBalance) as number,
          ),
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to get transactions',
        });
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Failed to get transactions',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    requestAndroidCallPermissions();
    requestOverlayPermission();

    const checkAuth = async () => {
      if (!mounted) return;

      if (token) {
        // if (!isAuthenticated) {
        try {
          const {payload} = await dispatch(userDetail());

          if (payload?.success) {
            const userDetail: any = payload.user;
            console.log('User Detail fetched in checkAuth:', userDetail);
            dispatch(setAuthentication(true));
            dispatch(setUser(userDetail));
            getTransactionDetails();
            requestAndroidCallPermissions();

            // if (!isConnected) {
            //   connect();
            // } else {
            //   send('/app/online.user');
            // }

            // Navigate only once
          } else {
            handleLogout();
          }
        } catch (err) {
          console.log('Network error or offline:', err);
          dispatch(setAuthentication(true)); // keep logged in if offline
        } finally {
          setLoading(false);
        }
        // } else {
        //   // already authenticated, just show main tab
        //   setLoading(false);
        // }
      } else {
        // no token → logout
        // navigation.reset({
        //   index: 0,
        //   routes: [{name: 'Register'}],
        // });
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [token, dispatch]);

  if (loading && !token) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={token ? 'MainTabs' : 'Register'}>
      {/* Public screens (no bottom tabs) */}
      {/* <Stack.Screen name="Splash" component={SplashScreen} /> */}

      {!token ? (
        <>
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
        </>
      ) : (
        <>
          {zegoInitialized && (
            <>
              <Stack.Screen
                options={{headerShown: false}}
                // DO NOT change the name
                name="ZegoUIKitPrebuiltCallWaitingScreen"
                component={ZegoUIKitPrebuiltCallWaitingScreen}
              />
              <Stack.Screen
                options={{headerShown: false}}
                // DO NOT change the name
                name="ZegoUIKitPrebuiltCallInCallScreen"
                component={ZegoUIKitPrebuiltCallInCallScreen}
              />
            </>
          )}
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Profile" component={ProfilePage} />
          <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
          <Stack.Screen
            name="Call_Chat"
            component={CallChat}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />

          <Stack.Screen name="Wallet" component={Wallet} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="Notification" component={Notification} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="Language" component={LanguageSetting} />
          <Stack.Screen
            name="TermsAndConditions"
            component={TermsAndConditions}
          />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </>
      )}
      <Stack.Screen name="CustomerSupport" component={CustomerSupport} />
    </Stack.Navigator>
  );
}
