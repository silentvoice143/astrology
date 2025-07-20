import React from 'react';
import {Text, View} from 'react-native';
import {themeColors} from '../../constants/colors';
import {verticalScale} from '../../utils/sizer';
import {textStyle} from '../../constants/text-style';

function Timer({timer}: {timer: string}) {
  return (
    <View
      style={{
        backgroundColor: themeColors.status.success.base,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(4),
      }}>
      <Text
        style={[
          {color: themeColors.text.light, textAlign: 'center'},
          textStyle.fs_mont_16_700,
        ]}>
        {timer}
      </Text>
    </View>
  );
}

export default Timer;
