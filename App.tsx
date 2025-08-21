import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
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

Object.assign(global, encoding);

function App(): React.JSX.Element {
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
