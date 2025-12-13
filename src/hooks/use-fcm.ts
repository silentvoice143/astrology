import {useEffect, useState, useRef} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import {useAppDispatch} from '../hooks/redux-hook';
import {registerDevice} from '../store/reducer/auth';
import {getFcmToken} from '../utils/getFcmToken';

/**
 * useFcm
 * - Call this from a top-level component (e.g. AppNavigator).
 * - It will automatically register device token when authenticated.
 *
 * @param isAuthenticated when true the hook will attempt to register the device
 * @returns { fcmToken?: string, registering: boolean }
 */
export default function useFcm(isAuthenticated: boolean) {
  const dispatch = useAppDispatch();
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const [registering, setRegistering] = useState(false);
  const onMessageUnsubRef = useRef<(() => void) | null>(null);
  const onOpenedUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only run when auth state becomes true
    if (!isAuthenticated) return;

    let mounted = true;

    async function setup() {
      try {
        // Request permission on platforms that need it (iOS)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          // permission denied but we still try to obtain token (some platforms allow)
          Toast.show({
            type: 'info',
            text1: 'Notifications permission not granted',
            text2: 'You may miss push notifications.',
          });
        }

        // get token using existing util - may use messaging().getToken() internally
        const token = (await getFcmToken()) as string;
        if (mounted) setFcmToken(token);

        if (token) {
          setRegistering(true);
          try {
            const payload = await dispatch(
              // @ts-ignore - unwrap exists on thunk
              registerDevice({deviceToken: token}),
            ).unwrap();

            if (payload?.success) {
              //   Toast.show({
              //     type: 'success',
              //     text1: 'Device registered successfully',
              //   });
            } else {
              //   Toast.show({
              //     type: 'error',
              //     text1: 'Device registration failed',
              //     text2: payload?.message ?? '',
              //   });
            }
          } catch (err) {
            console.error('registerDevice error:', err);
            Toast.show({
              type: 'error',
              text1: 'Device registration failed',
            });
          } finally {
            setRegistering(false);
          }
        } else {
          Toast.show({
            type: 'info',
            text1: 'No FCM token retrieved',
          });
        }

        // Foreground messages
        onMessageUnsubRef.current = messaging().onMessage(
          async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
            console.log('Foreground Notification:', remoteMessage);
            Toast.show({
              type: 'info',
              text1: remoteMessage.notification?.title ?? 'New Message',
              text2: remoteMessage.notification?.body ?? '',
            });
          },
        );

        // App opened from background
        onOpenedUnsubRef.current = messaging().onNotificationOpenedApp(
          remoteMessage => {
            console.log(
              'App opened from background:',
              remoteMessage.notification,
            );
            // TODO: add navigation handling as needed, e.g. navigate(remoteMessage.data.screen)
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
              // TODO: add navigation handling as needed
            }
          })
          .catch(e => console.error('getInitialNotification err', e));
      } catch (err) {
        console.error('useFcm setup error:', err);
      }
    }

    setup();

    return () => {
      mounted = false;
      if (onMessageUnsubRef.current) onMessageUnsubRef.current();
      if (onOpenedUnsubRef.current) onOpenedUnsubRef.current();
    };
  }, [isAuthenticated, dispatch]);

  return {fcmToken, registering};
}
