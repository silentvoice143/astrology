import {View, Text} from 'react-native';
import React from 'react';
import ScreenLayout from '../../components/screen-layout';
import {textStyle} from '../../constants/text-style';
import {themeColors} from '../../constants/colors';
import PageWithHeader from '../../componentsV1/layout/page-with-header';

const TermsAndConditions = () => {
  return (
    <PageWithHeader
      scrollEnabled={true}
      title="Terms & Conditions"
      themeMode="light">
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[textStyle.fs_abyss_32_400]}>Comin soon...</Text>
      </View>
    </PageWithHeader>
  );
};

export default TermsAndConditions;
