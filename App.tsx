import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {Provider} from 'react-redux'; // Import Provider
import AppNavigator from './src/routes/app-navigator';
import {persistor, store} from './src/store'; // Import your Redux store
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import * as encoding from 'text-encoding';
import {SafeAreaProvider} from 'react-native-safe-area-context';
Object.assign(global, encoding);

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <>
            <StatusBar
              barStyle="dark-content" // dark text/icons
              backgroundColor="#ffffff" // light background (white or any light color)
            />
            <AppNavigator />
            <Toast />
          </>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: 'red',
  },
});

export default App;
