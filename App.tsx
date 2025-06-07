/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppNavigator from './src/routes/app-navigator';

function App(): React.JSX.Element {
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: 'red',
  },
});

export default App;
