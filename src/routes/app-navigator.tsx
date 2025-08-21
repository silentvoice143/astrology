import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, Text, AppStateStatus, AppState} from 'react-native';

import PublicRoutes from './public-route';
import PrivateRoutes from './private-route';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {userDetail} from '../store/reducer/user';
import {
  logout,
  setAstrologer,
  setAuthentication,
  setUser,
} from '../store/reducer/auth';
import {useWebSocket} from '../hooks/use-socket-new';
import {useSessionEvents} from '../hooks/use-session-events';

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const {user, isAuthenticated, token} = useAppSelector(
    (state: any) => state.auth,
  );

  const {connect, isConnected, disconnect, send} = useWebSocket(user?.id);

  useSessionEvents(user?.id, isAuthenticated, isConnected);

//  async function setupPush() {
//   try {
//     const token = await getFcmToken();
//     if (token) {
//       // send to backend
//       const res = await fetch("http://10.0.2.2:4000/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token, userId: "123" }),
//       });

//       if (!res.ok) {
//         console.error("Failed to register push token", res.status);
//       } else {
//         console.log("Push token registered successfully");
//       }
//     } else {
//       console.warn("No FCM token retrieved");
//     }
//   } catch (err) {
//     console.error("Error while setting up push notifications:", err);
//   }
// }

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
            dispatch(logout());
          }
        } catch (err) {
          console.log(err);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, dispatch, isConnected]);

//   useEffect(() => {
//   // Run push setup once when authenticated
//   if (isAuthenticated) {
//     setupPush();
//   }

//   // Foreground notification
//   const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
//     console.log("Foreground Notification:", remoteMessage);
//     Alert.alert(
//       remoteMessage.notification?.title ?? "New Message",
//       remoteMessage.notification?.body ?? ""
//     );
//   });

//   // App opened from background
//   const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log("App opened from background:", remoteMessage.notification);
//     // Navigate user to specific screen if needed
//   });

//   // App opened from quit state
//   messaging().getInitialNotification().then(remoteMessage => {
//     if (remoteMessage) {
//       console.log("App opened from quit state:", remoteMessage.notification);
//       // Navigate user here as well
//     }
//   });

//   return () => {
//     unsubscribeOnMessage();
//     unsubscribeOnNotificationOpened();
//   };
// }, [isAuthenticated]);


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
