import {View, Text} from 'react-native';
import React from 'react';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {COLORS} from '../../constants/colors';

const CallChat = () => {
  return (
    <PageWithHeader title="History">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.theme.white,
        }}>
        <Text>CallChat</Text>
      </View>
    </PageWithHeader>
  );
};

export default CallChat;
