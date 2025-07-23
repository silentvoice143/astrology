import {View, Text} from 'react-native';
import React from 'react';
import ScreenLayout from '../components/screen-layout';
import {textStyle} from '../constants/text-style';

const Remedies = () => {
  return (
    <ScreenLayout>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[textStyle.fs_abyss_24_400]}>Coming soon...</Text>
      </View>
    </ScreenLayout>
  );
};

export default Remedies;
