import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

export interface IncomingCallData {
  callId?: string;
  roomId: string;
  // sessionId: string;

  callerId: string;
  callerName: string;
  // callerImage?: string;

  sessionType: 'AUDIO' | 'VIDEO';
}

export const CALL_NOTIFICATION_TYPE = {
  INCOMING_CALL: 'INCOMING_CALL',
  CALL_CANCELLED: 'CALL_CANCELLED',
} as const;

export type CallNotificationType =
  (typeof CALL_NOTIFICATION_TYPE)[keyof typeof CALL_NOTIFICATION_TYPE];

export const CALL_NOTIFICATION_ACTION = {
  ACCEPT: 'accept-call',
  REJECT: 'reject-call',
  DEFAULT: 'default',
} as const;

export type CallNotificationAction =
  (typeof CALL_NOTIFICATION_ACTION)[keyof typeof CALL_NOTIFICATION_ACTION];

/**
 * Create Android notification channel
 *
 * Safe to call multiple times.
 */
export const createCallChannel = async () => {
  return notifee.createChannel({
    id: 'incoming-calls',

    name: 'Incoming Calls',

    description: 'Notifications for incoming audio and video calls',

    importance: AndroidImportance.HIGH,

    sound: 'zego_incoming',

    vibration: true,

    vibrationPattern: [300, 500, 300, 500],

    bypassDnd: false,
  });
};

export const showIncomingCallNotification = async (data: IncomingCallData) => {
  const channelId = await createCallChannel();

  const notificationId = `call-${data.roomId}`;

  await notifee.displayNotification({
    id: notificationId,

    title:
      data.sessionType === 'VIDEO'
        ? 'Incoming Video Call'
        : 'Incoming Audio Call',

    body: `${data.callerName} is calling you`,

    data: {
      callId: data.roomId,
      roomId: data.roomId,
      callerId: data.callerId,
      callerName: data.callerName,
      sessionType: data.sessionType,
      type: CALL_NOTIFICATION_TYPE.INCOMING_CALL,
    },

    android: {
      channelId,

      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,

      // Ringtone + vibration so it behaves like a real call, not a ping
      sound: 'zego_incoming',
      vibrationPattern: [300, 500, 300, 500],
      // loopSound: true,

      // Brand accent color on the notification chrome
      color: '#ffffff',
      colorized: true,

      // Small icon in the status bar (must be a white/transparent silhouette)
      //   smallIcon: 'ic_call_notification',

      // Caller avatar as the large icon, with a sane fallback
      //   largeIcon: data.callerImage || require('../assets/imgs/zodiac/Aries.png'),
      //   circularLargeIcon: true,

      visibility: AndroidVisibility.PUBLIC,

      /**
       * Keep notification until we explicitly
       * accept/reject/cancel it.
       */
      ongoing: true,
      autoCancel: false,

      // Wakes the screen and shows a full-screen incoming-call UI
      // over the lock screen, like a native dialer call.
      fullScreenAction: {
        id: 'default',
        launchActivity: 'default',
      },

      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },

      timestamp: Date.now(),
      showTimestamp: true,

      actions: [
        {
          title: '<span style="color:#EF4444">✕ Decline</span>',
          icon: 'ic_call_decline',
          pressAction: {
            id: 'reject-call',
          },
        },
        {
          title: '<span style="color:#22C55E">✓ Accept</span>',
          icon: 'ic_call_accept',
          pressAction: {
            id: 'accept-call',
            launchActivity: 'default',
          },
        },
      ],
    },
  });

  return notificationId;
};

/**
 * Remove incoming call notification
 */
export const cancelIncomingCallNotification = async (callId: string) => {
  console.log('canceling ', callId);
  await notifee.cancelNotification(`call-${callId}`);
};
