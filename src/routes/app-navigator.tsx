import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, Text, AppStateStatus, AppState} from 'react-native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {
  logout,
  logoutDevice,
  onlineStatus,
  registerDevice,
  setAstrologer,
  setAuthentication,
  setUser,
} from '../store/reducer/auth';
import {useWebSocket} from '../hooks/use-socket-new';
import {useSessionEvents} from '../hooks/use-session-events';
import Toast from 'react-native-toast-message';
import {clearSession} from '../store/reducer/session';
import {getFcmToken} from '../utils/getFcmToken';
import messaging from '@react-native-firebase/messaging';
import {useUserRole} from '../hooks/use-role';

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const {user, isAuthenticated, token} = useAppSelector(
    (state: any) => state.auth,
  );
  const role = useUserRole();
  const {connect, isConnected, disconnect, send} = useWebSocket(user?.id);

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
          Toast.show({
            type: 'success',
            text1: 'Device registered successfully',
          });
        }
      } else {
        Toast.show({
          type: 'success',
          text1: 'No FCM token retrieved',
        });
      }
    } catch (err) {
      console.error('Error while setting up push notifications:', err);
    }
  }

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     if (token) {
  //       try {
  //         const {payload} = await dispatch(userDetail());
  //         console.log(payload, '---------payload of user');

  //         if (payload?.success) {
  //           const userDetail: any = payload.user ?? payload.astrologer?.user!;

  //           const astro = payload.astrologer;
  //           const astrologer_detail: any = astro
  //             ? {
  //                 id: astro.id ?? '',
  //                 about: astro.about ?? '',
  //                 blocked: astro.blocked ?? false,
  //                 experienceYears: astro.experienceYears ?? 0,
  //                 expertise: astro.expertise ?? '',
  //                 imgUri: astro.imgUri ?? '',
  //                 languages: astro.languages ?? '',
  //                 pricePerMinuteChat: astro.pricePerMinuteChat ?? 0,
  //                 pricePerMinuteVoice: astro.pricePerMinuteVoice ?? 0,
  //                 pricePerMinuteVideo: astro.pricePerMinuteVideo ?? 0,
  //                 isAudioOnline: astro.isAudioOnline ?? false,
  //                 isChatOnline: astro.isChatOnline ?? false,
  //                 isVideoOnline: astro.isVideoOnline ?? false,
  //               }
  //             : null;

  //           dispatch(setAuthentication(true));
  //           dispatch(setUser(userDetail));
  //           if (astrologer_detail) dispatch(setAstrologer(astrologer_detail));
  //           if (!isConnected) {
  //             connect();
  //           } else {
  //             send('/app/online.user');
  //           }
  //         } else {
  //           dispatch(logout());
  //         }
  //       } catch (err) {
  //         console.log(err);
  //         dispatch(logout());
  //       }
  //     } else {
  //       dispatch(logout());
  //     }
  //     setLoading(false);
  //   };

  //   checkAuth();
  // }, [token, dispatch, isConnected]);

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
      if (role === 'ASTROLOGER') {
        const payload = await dispatch(logoutDevice()).unwrap();

        if (payload.success) {
          Toast.show({
            type: 'success',
            text1: 'Online status changed successfully!',
          });

          // 🔑 finally do logout
          dispatch(clearSession());
          disconnect();
          dispatch(logout());
        } else {
          Toast.show({
            type: 'error',
            text1: 'Try again later',
          });
        }
      } else {
        dispatch(clearSession());
        disconnect();
        dispatch(logout());
      }
    } catch (err) {}
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const {payload} = await dispatch(userDetail());

          if (payload?.success) {
            const userDetail: any = payload.user ?? payload.astrologer?.user!;
            const astro = payload.astrologer;

            const astrologer_detail: any = astro
              ? {
                  id: astro.id ?? '',
                  about: astro.about ?? '',
                  blocked: astro.blocked ?? false,
                  experienceYears: astro.experienceYears ?? 0,
                  expertise: astro.expertise ?? '',
                  imgUri: astro.imgUri ?? '',
                  languages: astro.languages ?? '',
                  pricePerMinuteChat: astro.pricePerMinuteChat ?? 0,
                  pricePerMinuteVoice: astro.pricePerMinuteVoice ?? 0,
                  pricePerMinuteVideo: astro.pricePerMinuteVideo ?? 0,
                  isAudioOnline: astro.isAudioOnline ?? false,
                  isChatOnline: astro.isChatOnline ?? false,
                  isVideoOnline: astro.isVideoOnline ?? false,
                }
              : null;

            dispatch(setAuthentication(true));
            dispatch(setUser(userDetail));
            if (astrologer_detail) dispatch(setAstrologer(astrologer_detail));
            if (!isConnected) {
              connect();
            } else {
              send('/app/online.user');
            }
          } else {
            // token invalid
            // dispatch(logout());
            handleLogout();
          }
        } catch (err) {
          console.log('Network error or offline:', err);
          // don’t log out if offline, just keep user authenticated
          dispatch(setAuthentication(true));
        }
      } else {
        // dispatch(logout()); // no token, definitely logout
        handleLogout();
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, dispatch, isConnected]);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
    </NavigationContainer>
  );
}
