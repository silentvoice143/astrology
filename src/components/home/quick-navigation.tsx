import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {scale, verticalScale} from '../../utils/sizer';
import {themeColors} from '../../constants/colors';
import HoroscopeIcon from '../../assets/icons/horoscope-icon';
import {textStyle} from '../../constants/text-style';
import KundliBookIcon from '../../assets/icons/kundli-book-icon';
import MatchmakingIcon from '../../assets/icons/match-making-icon';
import TarotIcon from '../../assets/icons/tarot-icon';
interface QuickNavigationProps {
  onClick?: (action: string) => void;
}
const QuickNavigation = ({onClick = () => {}}: QuickNavigationProps) => {
  return (
    <View
      style={{
        // backgroundColor: 'red',
        paddingHorizontal: scale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <View>
        <TouchableOpacity
          style={{
            height: scale(60),
            width: scale(60),
            borderRadius: scale(35),
            backgroundColor: themeColors.card.yellow,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View>
            <HoroscopeIcon size={32} />
          </View>
        </TouchableOpacity>
        <View style={{maxWidth: scale(80), marginTop: 8}}>
          <Text style={[textStyle.fs_abyss_14_400, {textAlign: 'center'}]}>
            Horoscope
          </Text>
        </View>
      </View>
      <View>
        <TouchableOpacity
          style={{
            height: scale(60),
            width: scale(60),
            borderRadius: scale(35),
            backgroundColor: themeColors.card.yellow,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{}}>
            <KundliBookIcon size={32} strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <View style={{maxWidth: scale(80), marginTop: 8}}>
          <Text style={[textStyle.fs_abyss_14_400, {textAlign: 'center'}]}>
            Free Kundli
          </Text>
        </View>
      </View>
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        <TouchableOpacity
          style={{
            height: scale(60),
            width: scale(60),
            borderRadius: scale(35),
            backgroundColor: themeColors.card.yellow,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{}}>
            <MatchmakingIcon size={32} strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <View style={{maxWidth: scale(80), marginTop: 8}}>
          <Text style={[textStyle.fs_abyss_14_400, {textAlign: 'center'}]}>
            Match Making
          </Text>
        </View>
      </View>
      <View>
        <TouchableOpacity
          style={{
            height: scale(60),
            width: scale(60),
            borderRadius: scale(35),
            backgroundColor: themeColors.card.yellow,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TarotIcon size={36} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{maxWidth: scale(80), marginTop: 8}}>
          <Text style={[textStyle.fs_abyss_14_400, {textAlign: 'center'}]}>
            Tarot
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QuickNavigation;
