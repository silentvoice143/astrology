import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/login';

import BottomTabNavigator from '../componentsV1/layout/bottom-tabs';
import Register from '../screens/auth/registerV1';
import {Text, View} from 'react-native';
import {clearSession} from '../store/reducer/session';
import Toast from 'react-native-toast-message';
import {use, useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {
  logout,
  logoutDevice,
  registerDevice,
  setAuthentication,
  setUser,
} from '../store/reducer/auth';
import {useWebSocket} from '../hooks/use-socket-new';
import {useSessionEvents} from '../hooks/use-session-events';

import {getFcmToken} from '../utils/getFcmToken';
import messaging from '@react-native-firebase/messaging';
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

const Stack = createNativeStackNavigator();

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

  async function setupPush() {
    try {
      const token = await getFcmToken();
      if (token) {
        // send to backend
        const payload = await dispatch(
          registerDevice({deviceToken: token}),
        ).unwrap();

        if (payload.success) {
          // Toast.show({
          //   type: 'success',
          //   text1: 'Device registered successfully',
          // });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to initialize push notifications',
        });
      }
    } catch (err) {
      console.error('Error while setting up push notifications:', err);
    }
  }

  useEffect(() => {
    // Run push setup once when authenticated
    if (isAuthenticated) {
      setupPush();
    }

    // Foreground notification
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Notification:', remoteMessage);
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title ?? 'New Message',
        text2: remoteMessage.notification?.body ?? '',
      });
    });

    // App opened from background
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('App opened from background:', remoteMessage.notification);
        // Navigate user to specific screen if needed
      },
    );

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'App opened from quit state:',
            remoteMessage.notification,
          );
          // Navigate user here as well
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    console.log('checkauth logout-----------');
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

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!mounted) return;

      if (token) {
        if (!isAuthenticated) {
          try {
            const {payload} = await dispatch(userDetail());

            if (payload?.success) {
              const userDetail: any = payload.user;
              dispatch(setAuthentication(true));
              dispatch(setUser(userDetail));

              // if (!isConnected) {
              //   connect();
              // } else {
              //   send('/app/online.user');
              // }
              console.log('Navigation to MainTabs-----------');
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
        } else {
          // already authenticated, just show main tab
          setLoading(false);
        }
      } else {
        // no token → logout
        handleLogout();
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [token, dispatch]);

  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      connect();
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs'}],
        });
      }, 3000);
    }
  }, [isAuthenticated]);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (!isConnected) {
  //       connect();
  //     }
  //   }
  // }, [isConnected, isAuthenticated]);

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Splash">
      {/* Public screens (no bottom tabs) */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Call_Chat" component={CallChat} />
          <Stack.Screen name="Wallet" component={Wallet} />
          <Stack.Screen name="About" component={About} />
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
