import React from 'react';
import {StyleSheet} from 'react-native';
import {Provider} from 'react-redux'; // Import Provider
import AppNavigator from './src/routes/app-navigator';
import {persistor, store} from './src/store'; // Import your Redux store
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import * as encoding from 'text-encoding';
Object.assign(global, encoding);

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <AppNavigator />
          <Toast />
        </>
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
