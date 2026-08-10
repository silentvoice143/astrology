import React, {useEffect, useState} from 'react';
import {Alert, AppState, StatusBar, StyleSheet} from 'react-native';
import {Provider} from 'react-redux';

import {persistor, store} from './src/store';
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import * as encoding from 'text-encoding';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {colors} from './src/constants/colors';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import './i18n';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import RootNavigator from './src/routes/root-navigator';
import {NavigationContainer} from '@react-navigation/native';
// import {ZegoCallInvitationDialog} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {navigationRef} from './src/utils/navigation';
import {createNotificationChannels} from './src/utils/notification-channel';
import {
  requestAndroidCallPermissions,
  requestOverlayPermission,
} from './src/utils/requestPermission';
import Config from 'react-native-config';
import {
  CALL_NOTIFICATION_ACTION,
  CALL_NOTIFICATION_TYPE,
  createCallChannel,
} from './src/services/call-notification';
import {
  clearPendingCall,
  getPendingCall,
  getPendingWaitingCall,
  setPendingCall,
  setPendingWaitingCall,
} from './src/services/pending-call';
import CallWaitingOverlay from './src/screens/call/call-waiting-overlay';
import {stopRingtone} from './src/services/ringtone';

Object.assign(global, encoding);

function App(): React.JSX.Element {
  // useEffect(() => {
  //   requestUserPermission();
  //   getFCMToken();
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     Alert.alert('New Notification', JSON.stringify(remoteMessage));
  //   });
  //   return unsubscribe;
  // }, []);

  // async function requestUserPermission() {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //   if (enabled) {
  //     console.log('Authorization status:', authStatus);
  //   }
  // }

  // async function getFCMToken() {
  //   const token = await messaging().getToken();
  //   console.log('FCM Token:', token);
  //   // Send token to your backend to store per user
  // }

  const [waitingCallData, setWaitingCallData] = useState<any>({
    data: null,
    palySound: true,
  });

  async function createNotificationChannel() {
    await notifee.createChannel({
      id: 'high_importance_channel',
      name: 'High Importance Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'notification_sound',
      vibration: true,
    });
  }

  // async function createZegoChannel() {
  //   await notifee.createChannel({
  //     id: Config.ZEGO_CHANNEl_ID!,
  //     name: Config.ZEGO_CHANNEl_NAME!,
  //     importance: AndroidImportance.HIGH,
  //     sound: 'zego_incoming', // without .mp3
  //   });
  // }

  const navigateToPendingCall = () => {
    const call = getPendingCall();

    if (!call?.roomId || !call?.callId) {
      return;
    }

    console.log('📞 Navigating to accepted call:', call);

    clearPendingCall();

    navigationRef.navigate('CallScreen', {
      callId: call?.callId,
      roomId: call?.roomId,

      callType: call?.sessionType,

      astrologer: {
        id: call?.callerId,
        name: call?.callerName,
        imageUri: call?.callerImage,
      },
      isAstrologer: false,
    });
  };

  // useEffect(() => {
  //   const unsubscribe = notifee.onForegroundEvent(async event => {
  //     console.log('=================================');
  //     console.log('NOTIFEE EVENT FIRED');
  //     console.log('TYPE:', event.type);
  //     console.log('ACTION:', event.detail.pressAction?.id);
  //     console.log('NOTIFICATION ID:', event.detail.notification?.id);
  //     console.log('DATA:', event.detail.notification?.data);
  //     console.log('=================================');

  //     if (event.type !== EventType.ACTION_PRESS) {
  //       return;
  //     }

  //     const notificationId = event.detail.notification?.id;

  //     if (!notificationId) {
  //       console.log('❌ NO NOTIFICATION ID');
  //       return;
  //     }

  //     console.log('Cancelling directly:', notificationId);

  //     await notifee.cancelNotification(notificationId);

  //     console.log('✅ cancelNotification finished');
  //   });

  //   return unsubscribe;
  // }, []);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async event => {
      console.log('=================================');
      console.log('NOTIFEE EVENT FIRED Foreground');
      console.log('TYPE:', event.type);
      console.log('ACTION:', event.detail.pressAction?.id);
      console.log('NOTIFICATION ID:', event.detail.notification?.id);
      console.log('DATA:', event.detail.notification?.data);
      console.log('=================================');

      // if (event.type !== EventType.ACTION_PRESS) {
      //   return;
      // }
      if (
        event.type !== EventType.ACTION_PRESS &&
        event.type !== EventType.PRESS
      ) {
        return;
      }

      const notificationId = event.detail.notification?.id;

      if (!notificationId) {
        console.log('❌ NO NOTIFICATION ID');
        return;
      }
      const actionId = event.detail.pressAction?.id;
      const data = event.detail.notification?.data;

      if (actionId === 'default') {
        const data = event.detail.notification?.data;
        await notifee.cancelNotification(notificationId);

        setWaitingCallData({data: data, playSound: false});
        return;
      }

      if (actionId === CALL_NOTIFICATION_ACTION.REJECT) {
        console.log('🗑️ Notification cancelled:', notificationId);
        await notifee.cancelNotification(notificationId);

        // TODO:
        // Call reject API using data?.callId

        return;
      }

      /* ================================
             ACCEPT CALL
        ================================= */

      if (actionId === CALL_NOTIFICATION_ACTION.ACCEPT) {
        await notifee.cancelNotification(notificationId);

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

        if (navigationRef.isReady()) {
          navigationRef.navigate('CallScreen', {
            callId: data.callId,
            roomId: data.roomId,
            callType: data.sessionType,
            astrologer: {
              id: data.callerId,
              name: data.callerName,
              imageUri: data.callerImage,
            },
            isAstrologer: false,
          });
        } else {
          setPendingCall({
            callId: String(data?.callId),
            roomId: String(data?.roomId),

            callerId: String(data?.callerId),
            callerName: String(data?.callerName),

            sessionType: data?.sessionType as any,
          });
        }
        // Remove incoming-call notification
        await notifee.cancelNotification(notificationId);

        console.log('📞 Pending accepted call saved');

        return;
      }
    });

    return unsubscribe;
  }, []);

  // Call this once when app starts
  useEffect(() => {
    createCallChannel();
    createNotificationChannel();
    // createZegoChannel();
    requestAndroidCallPermissions();
  }, []);

  useEffect(() => {
    const call = getPendingWaitingCall();
    if (call) {
      setWaitingCallData({data: call, playSound: true});
    }
  }, []);

  const checkAvailableNotification = async () => {
    const displayed = await notifee.getDisplayedNotifications();
    const incomingCalls = displayed.filter(
      n => n.notification?.data?.type === CALL_NOTIFICATION_TYPE.INCOMING_CALL,
    );

    if (incomingCalls.length === 0) {
      return;
    }

    const latestCall = incomingCalls.reduce((latest, current) =>
      Number(current.date) > Number(latest.date) ? current : latest,
    );

    const notification = latestCall.notification!;
    const data = notification.data!;
    setWaitingCallData({data: data, playSound: false});

    console.log(notification, displayed, data, '---data for this');
  };

  useEffect(() => {
    checkAvailableNotification();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async state => {
      console.log('AppState:', state);
      // checkAvailableNotification();

      if (state === 'active' && navigationRef.isReady()) {
        navigateToPendingCall();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  console.log(waitingCallData, '----waiting call data');

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{flex: 1}}>
          <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
              <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
              {/* <AppNavigator /> */}
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  console.log('🧭 Navigation ready');

                  navigateToPendingCall();
                }}>
                {/* <ZegoCallInvitationDialog /> */}
                <RootNavigator />
              </NavigationContainer>
              {waitingCallData?.data && (
                <CallWaitingOverlay
                  visible={!!waitingCallData.data}
                  playSound={waitingCallData?.playSound}
                  callerName={waitingCallData.data?.callerName}
                  sessionType={waitingCallData.data?.sessionType}
                  onAccept={async () => {
                    navigationRef.navigate('CallScreen', {
                      callId: waitingCallData?.data.callId,
                      roomId: waitingCallData?.data.roomId,
                      callType: waitingCallData?.data.sessionType,
                      astrologer: {
                        id: waitingCallData?.data.callerId,
                        name: waitingCallData?.data.callerName,
                        imageUri: waitingCallData?.data.callerImage,
                      },
                      isAstrologer: false,
                    });
                    await notifee.cancelDisplayedNotification(
                      `call-${waitingCallData?.data?.roomId}`,
                    );
                    stopRingtone();
                    setWaitingCallData({data: null, playSound: true});
                  }}
                  onReject={async () => {
                    stopRingtone();
                    await notifee.cancelDisplayedNotification(
                      `call-${waitingCallData?.data.roomId}`,
                    );
                    setWaitingCallData({data: null, playSound: true});
                  }}
                />
              )}

              <Toast />
            </SafeAreaView>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary_surface, // set your desired background
  },
});

export default App;
