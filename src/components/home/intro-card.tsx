import {View, Text} from 'react-native';
import React from 'react';
import {scale, verticalScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import Avatar from '../avatar';
import {textStyle} from '../../constants/text-style';
import CustomButton from '../custom-button';
import LinearGradient from 'react-native-linear-gradient';

const IntroCard = () => {
  return (
    <View
      style={{
        padding: scale(24),
        backgroundColor: colors.primart_card_2,
        borderRadius: scale(20),
        flexDirection: 'row',
        gap: scale(20),
      }}>
      <Avatar
        image={{uri: 'https://i.pravatar.cc/300?img=9'}}
        fallbackText="SK"
      />
      <View
        style={{flex: 1, justifyContent: 'flex-start', gap: verticalScale(12)}}>
        <Text style={[textStyle.fs_mont_16_700, {color: colors.tertiary_text}]}>
          Pt. Raveena Tandon
        </Text>
        <Text
          style={[
            textStyle.fs_mont_14_400,
            {
              color: colors.secondaryText,
              width: '100%',
            },
          ]}>
          This is Pandit Raveena Tandon, specialist in Vedic Gyan.
        </Text>
        <LinearGradient
          colors={[
            colors.primary_card,
            colors.secondary_Card,
            colors.tertiary_card,
          ]}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'auto',
            height: verticalScale(40),
            borderRadius: scale(20),
          }}>
          <Text style={{color: colors.whiteText}}>10 Rs / Min</Text>
        </LinearGradient>
      </View>
    </View>
  );
};

export default IntroCard;
