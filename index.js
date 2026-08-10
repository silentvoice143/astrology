/**
 * @format
 */

window.global = global;

import {AppRegistry} from 'react-native';

import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import notifee, {EventType} from '@notifee/react-native';

import App from './App';
import {name as appName} from './app.json';

import {
  showIncomingCallNotification,
  CALL_NOTIFICATION_ACTION,
} from './src/services/call-notification';
import {
  setPendingCall,
  setPendingWaitingCall,
} from './src/services/pending-call';

/* =========================================================
   FIREBASE BACKGROUND MESSAGES
========================================================= */

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('BACKGROUND...................');
  console.log(JSON.stringify(remoteMessage, null, 2));

  const data = remoteMessage.data;

  if (!data) {
    return;
  }

  /* ================================
       INCOMING CALL
    ================================= */

  if (data.type === 'INCOMING_CALL') {
    await showIncomingCallNotification({
      callId: data.callId ?? data.roomId,
      roomId: String(data.roomId),
      sessionId: String(data.sessionId),

      callerId: String(data.callerId),
      callerName: String(data.callerName),

      callerImage: data.callerImage ? String(data.callerImage) : undefined,

      sessionType: data.sessionType,
    });

    return;
  }

  /* ================================
       CALL CANCELLED
    ================================= */

  if (data.type === 'CALL_CANCELLED') {
    if (data.callId) {
      await cancelIncomingCallNotification(String(data.callId));
    }

    return;
  }
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('=================================');
  console.log('🔔 NOTIFEE BACKGROUND EVENT');
  console.log('TYPE:', type);
  console.log('ACTION:', detail.pressAction?.id);
  console.log('NOTIFICATION ID:', detail.notification?.id);
  console.log('DATA:', detail.notification?.data);
  console.log('=================================');

  // if (type !== EventType.ACTION_PRESS) {
  //   return;
  // }
  const actionId = detail.pressAction?.id;
  const notificationId = detail.notification?.id;
  const data = detail.notification?.data;

  if (type !== EventType.ACTION_PRESS && type !== EventType.PRESS) {
    return;
  }

  if (!notificationId) {
    console.log('❌ No notification ID');
    return;
  }

  /* ================================
       REJECT CALL
  ================================= */

  if (actionId === 'default') {
    setPendingWaitingCall({
      callId: data.callId ?? data.roomId,
      roomId: String(data?.roomId),

      callerId: String(data?.callerId),
      callerName: String(data?.callerName),

      sessionType: data?.sessionType,
      isAstrologer: false,
    });
    await notifee.cancelNotification(notificationId);
    return;
  }

  if (actionId === CALL_NOTIFICATION_ACTION.REJECT) {
    console.log('❌ Decline pressed:', data?.callId);

    // Cancel the exact notification that triggered this event
    await notifee.cancelNotification(notificationId);

    console.log('🗑️ Notification cancelled:', notificationId);

    // TODO:
    // Call reject API using data?.callId

    return;
  }

  /* ================================
       ACCEPT CALL
  ================================= */

  if (actionId === CALL_NOTIFICATION_ACTION.ACCEPT) {
    console.log('✅ Accept pressed:', data?.callId);

    if (
      !data?.callId ||
      !data?.roomId ||
      !data?.callerId ||
      !data?.callerName ||
      !data?.sessionType
    ) {
      console.log('❌ Invalid call data:', data);
      return;
    }

    // Save call so App.tsx can navigate when ready
    setPendingCall({
      callId: data.callId ?? data.roomId,
      roomId: String(data?.roomId),

      callerId: String(data?.callerId),
      callerName: String(data?.callerName),

      sessionType: data?.sessionType,
      isAstrologer: false,
    });
    // Remove incoming-call notification
    await notifee.cancelNotification(notificationId);

    console.log('📞 Pending accepted call saved');

    return;
  }
});

AppRegistry.registerComponent(appName, () => App);
