import messaging from '@react-native-firebase/messaging';

/**
 * Get FCM token for push notifications
 * @returns string | null
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('Push notification permission not granted');
      return null;
    }

    // Get FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}
