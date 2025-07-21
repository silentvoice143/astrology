import {View, Text} from 'react-native';
import React from 'react';
import ScreenLayout from '../../components/screen-layout';
import {textStyle} from '../../constants/text-style';
import {themeColors} from '../../constants/colors';

const TermsAndConditions = () => {
  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.background}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[textStyle.fs_abyss_32_400]}>Comin soon...</Text>
      </View>
    </ScreenLayout>
  );
};

export default TermsAndConditions;
