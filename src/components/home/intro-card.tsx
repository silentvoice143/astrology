import {View, Text} from 'react-native';
import React from 'react';
import {scale, verticalScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import Avatar from '../avatar';
import {textStyle} from '../../constants/text-style';
import LinearGradient from 'react-native-linear-gradient';

type IntroCardProps = {
  name: string;
  rate: string;
  avatar: string;
  specialty: string;
  cardWidth: number;
};

const IntroCard = ({
  name,
  rate,
  avatar,
  specialty,
  cardWidth,
}: IntroCardProps) => {
  return (
    <View
      style={{
        width: cardWidth,
        padding: scale(24),
        backgroundColor: colors.primary_card_2,
        borderRadius: scale(20),
        flexDirection: 'row',
        gap: scale(20),
      }}>
      <Avatar image={{uri: avatar}} fallbackText={name[0]} />
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          gap: verticalScale(12),
        }}>
        <Text style={[textStyle.fs_mont_16_700, {color: colors.tertiary_text}]}>
          {name}
        </Text>
        <Text
          style={[
            textStyle.fs_mont_14_400,
            {
              color: colors.secondaryText,
              width: '100%',
            },
          ]}>
          {specialty}
        </Text>
        <View
          style={{flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
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
              width: 120,
              height: verticalScale(40),
              borderRadius: scale(20),
              paddingHorizontal: scale(12),
            }}>
            <Text style={{color: colors.whiteText}}>{rate}</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

export default IntroCard;
