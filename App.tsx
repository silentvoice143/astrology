import React from 'react';
import {StyleSheet} from 'react-native';
import {Provider} from 'react-redux'; // Import Provider
import AppNavigator from './src/routes/app-navigator';
import {store} from './src/store'; // Import your Redux store
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <>
        <AppNavigator />
        <Toast />
      </>
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
