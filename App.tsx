import React, {useEffect} from 'react';
import {Alert, StatusBar, StyleSheet} from 'react-native';
import {Provider} from 'react-redux';
import AppNavigator from './src/routes/app-navigator';
import {persistor, store} from './src/store';
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import * as encoding from 'text-encoding';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {colors} from './src/constants/colors';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import './i18n';
import notifee, {AndroidImportance} from '@notifee/react-native';

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

  async function createNotificationChannel() {
    await notifee.createChannel({
      id: 'high_importance_channel',
      name: 'High Importance Notifications',
      importance: AndroidImportance.HIGH, // 🔥 equivalent to IMPORTANCE_HIGH
      sound: 'default',
    });
  }

  // Call this once when app starts
  createNotificationChannel();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{flex: 1}}>
          <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
              <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
              <AppNavigator />
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
