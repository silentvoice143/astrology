// import {useEffect, useState, useRef} from 'react';
// import messaging, {
//   FirebaseMessagingTypes,
// } from '@react-native-firebase/messaging';
// import Toast from 'react-native-toast-message';
// import {useAppDispatch} from '../hooks/redux-hook';
// import {registerDevice} from '../store/reducer/auth';
// import {getFcmToken} from '../utils/getFcmToken';

// /**
//  * useFcm
//  * - Call this from a top-level component (e.g. AppNavigator).
//  * - It will automatically register device token when authenticated.
//  *
//  * @param isAuthenticated when true the hook will attempt to register the device
//  * @returns { fcmToken?: string, registering: boolean }
//  */
// export default function useFcm(isAuthenticated: boolean) {
//   const dispatch = useAppDispatch();
//   const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
//   const [registering, setRegistering] = useState(false);
//   const onMessageUnsubRef = useRef<(() => void) | null>(null);
//   const onOpenedUnsubRef = useRef<(() => void) | null>(null);

//   useEffect(() => {
//     // Only run when auth state becomes true
//     if (!isAuthenticated) return;

//     let mounted = true;

//     async function setup() {
//       try {
//         // Request permission on platforms that need it (iOS)
//         const authStatus = await messaging().requestPermission();
//         const enabled =
//           authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//           authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//         if (!enabled) {
//           // permission denied but we still try to obtain token (some platforms allow)
//           Toast.show({
//             type: 'info',
//             text1: 'Notifications permission not granted',
//             text2: 'You may miss push notifications.',
//           });
//         }

//         // get token using existing util - may use messaging().getToken() internally
//         const token = (await getFcmToken()) as string;
//         if (mounted) setFcmToken(token);

//         if (token) {
//           setRegistering(true);
//           try {
//             const payload = await dispatch(
//               // @ts-ignore - unwrap exists on thunk
//               registerDevice({deviceToken: token}),
//             ).unwrap();

//             if (payload?.success) {
//               //   Toast.show({
//               //     type: 'success',
//               //     text1: 'Device registered successfully',
//               //   });
//             } else {
//               //   Toast.show({
//               //     type: 'error',
//               //     text1: 'Device registration failed',
//               //     text2: payload?.message ?? '',
//               //   });
//             }
//           } catch (err) {
//             console.error('registerDevice error:', err);
//             Toast.show({
//               type: 'error',
//               text1: 'Device registration failed',
//             });
//           } finally {
//             setRegistering(false);
//           }
//         } else {
//           Toast.show({
//             type: 'info',
//             text1: 'No FCM token retrieved',
//           });
//         }

//         // Foreground messages
//         onMessageUnsubRef.current = messaging().onMessage(
//           async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
//             console.log('Foreground Notification:', remoteMessage);
//             Toast.show({
//               type: 'info',
//               text1: remoteMessage.notification?.title ?? 'New Message',
//               text2: remoteMessage.notification?.body ?? '',
//             });
//           },
//         );

//         // App opened from background
//         onOpenedUnsubRef.current = messaging().onNotificationOpenedApp(
//           remoteMessage => {
//             console.log(
//               'App opened from background:',
//               remoteMessage.notification,
//             );
//             // TODO: add navigation handling as needed, e.g. navigate(remoteMessage.data.screen)
//           },
//         );

//         // App opened from quit state
//         messaging()
//           .getInitialNotification()
//           .then(remoteMessage => {
//             if (remoteMessage) {
//               console.log(
//                 'App opened from quit state:',
//                 remoteMessage.notification,
//               );
//               // TODO: add navigation handling as needed
//             }
//           })
//           .catch(e => console.error('getInitialNotification err', e));
//       } catch (err) {
//         console.error('useFcm setup error:', err);
//       }
//     }

//     setup();

//     return () => {
//       mounted = false;
//       if (onMessageUnsubRef.current) onMessageUnsubRef.current();
//       if (onOpenedUnsubRef.current) onOpenedUnsubRef.current();
//     };
//   }, [isAuthenticated, dispatch]);

//   return {fcmToken, registering};
// }

import {useEffect, useState, useRef} from 'react';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import {useAppDispatch} from '../hooks/redux-hook';
import {registerDevice} from '../store/reducer/auth';
import {handleNotificationNavigation} from '../utils/notification-handler';
import {markNotificationRead} from '../store/reducer/notifications';
import {setOtherUser, setSession} from '../store/reducer/session';
import {getCurrentRouteName} from '../utils/navigation';
import {
  CALL_NOTIFICATION_TYPE,
  cancelIncomingCallNotification,
  showIncomingCallNotification,
} from '../services/call-notification';

export default function useFcm(isAuthenticated: boolean) {
  const dispatch = useAppDispatch();
  const [fcmToken, setFcmToken] = useState<string>();
  const [registering, setRegistering] = useState(false);

  const onMessageUnsub = useRef<() => void>(() => {});
  const onOpenedUnsub = useRef<() => void>(() => {});

  useEffect(() => {
    if (!isAuthenticated) return;

    const messaging = getMessaging();
    let mounted = true;

    async function setup() {
      try {
        const authStatus = await requestPermission(messaging);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Toast.show({
            type: 'info',
            text1: 'Notifications permission not granted',
          });
        }

        let token;
        try {
          token = await getToken(messaging);
          console.log('FCM Token:', token);
          if (mounted) setFcmToken(token);
        } catch (tokenError) {
          console.warn(
            'Failed to fetch FCM Token (Check Google Play Services / Network):',
            tokenError,
          );
        }
        console.log('FCM Token:', token);
        if (mounted) setFcmToken(token);

        if (token) {
          setRegistering(true);
          try {
            const res = await dispatch(
              registerDevice({deviceToken: token}),
            ).unwrap();
            console.log('Device registration response:', res);
          } finally {
            setRegistering(false);
          }
        }

        // Foreground messages
        // onMessageUnsub.current = onMessage(
        //   messaging,
        //   async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        //     console.log('Foreground message:', remoteMessage);
        //     const currentRoute = getCurrentRouteName();
        //     if (
        //       currentRoute === 'ChatScreen' &&
        //       remoteMessage?.data?.type === 'CHAT_MESSAGE'
        //     ) {
        //       return;
        //     }
        //     handleNotificationNavigation(remoteMessage.data);
        //     Toast.show({
        //       type: 'info',
        //       text1: remoteMessage.notification?.title ?? 'New Message',
        //       text2: remoteMessage.notification?.body ?? '',
        //     });
        //   },
        // );

        onMessageUnsub.current = onMessage(
          messaging,
          async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
            console.log('Foreground message:', remoteMessage);

            const data = remoteMessage.data;

            if (!data) {
              return;
            }

            if (data.type === CALL_NOTIFICATION_TYPE.INCOMING_CALL) {
              await showIncomingCallNotification({
                callId: String(data?.callId),
                roomId: String(data?.roomId),
                callerId: String(data?.callerId),
                callerName: String(data?.callerName),
                sessionType: data.sessionType as any,
              });

              return;
            }

            if (data.type === CALL_NOTIFICATION_TYPE.CALL_CANCELLED) {
              if (data.callId) {
                await cancelIncomingCallNotification(String(data.callId));
              }

              return;
            }

            /* =========================================
       NORMAL NOTIFICATIONS
    ========================================= */

            const currentRoute = getCurrentRouteName();

            if (currentRoute === 'ChatScreen' && data.type === 'CHAT_MESSAGE') {
              return;
            }

            handleNotificationNavigation(data);

            Toast.show({
              type: 'info',
              text1: remoteMessage.notification?.title ?? 'New Message',
              text2: remoteMessage.notification?.body ?? '',
            });
          },
        );

        // App opened from background
        // onOpenedUnsub.current = onNotificationOpenedApp(
        //   messaging,
        //   remoteMessage => {
        //     console.log('Opened from background:', remoteMessage?.notification);
        //   },
        // );
        onOpenedUnsub.current = onNotificationOpenedApp(
          messaging,
          (remoteMessage: any) => {
            if (remoteMessage?.data) {
              if (initialMessage?.data?.type === 'CHAT_MESSAGE') {
                const decodedData = JSON.parse(remoteMessage?.data?.session);
                dispatch(setOtherUser(decodedData.astrologer));
                dispatch(setSession(decodedData));
              }
              handleNotificationNavigation(remoteMessage.data);
              if (remoteMessage.data.id) {
                dispatch(markNotificationRead(remoteMessage.data.id));
              }
            }
          },
        );

        // App opened from quit state
        const initialMessage: any = await getInitialNotification(messaging);

        if (initialMessage?.data) {
          if (initialMessage?.data?.type === 'CHAT_MESSAGE') {
            const decodedData = JSON.parse(initialMessage?.data?.session);
            dispatch(setOtherUser(decodedData.astrologer));
            dispatch(setSession(decodedData));
          }
          handleNotificationNavigation(initialMessage.data);
          if (initialMessage.data.id) {
            dispatch(markNotificationRead(initialMessage.data.id));
          }
        }
      } catch (err) {
        console.error('useFcm error:', err);
      }
    }

    setup();

    return () => {
      mounted = false;
      onMessageUnsub.current?.();
      onOpenedUnsub.current?.();
    };
  }, [isAuthenticated, dispatch]);

  return {fcmToken, registering};
}
