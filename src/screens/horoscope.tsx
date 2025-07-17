import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import {textStyle} from '../constants/text-style';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';
import VerticalTabSwitcher from '../components/vertical-tab';

import ZodiacCard from '../components/horoscope/zodiac-card';
import BackIcon from '../assets/icons/back-icon';

const zodiacData = [
  {name: 'Aries', image: require('../assets/imgs/zodiac/Aries.png')},
  {name: 'Taurus', image: require('../assets/imgs/zodiac/Taurus.png')},
  {name: 'Gemini', image: require('../assets/imgs/zodiac/Gemini.png')},
  {name: 'Cancer', image: require('../assets/imgs/zodiac/Cancer.png')},
  {name: 'Leo', image: require('../assets/imgs/zodiac/Leo.png')},
  {name: 'Virgo', image: require('../assets/imgs/zodiac/Virgo.png')},
  {name: 'Libra', image: require('../assets/imgs/zodiac/Libra.png')},
  {name: 'Scorpio', image: require('../assets/imgs/zodiac/Scorpio.png')},
  {
    name: 'Sagittarius',
    image: require('../assets/imgs/zodiac/Sagittarius.png'),
  },
  {name: 'Capricorn', image: require('../assets/imgs/zodiac/Capricorn.png')},
  {name: 'Aquarius', image: require('../assets/imgs/zodiac/Aquarius.png')},
  {name: 'Pisces', image: require('../assets/imgs/zodiac/Pisces.png')},
];

const Horoscope = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedZodiac, setSelectedZodiac] = useState<null | {
    name: string;
    image: any;
  }>(null);
  if (selectedZodiac) {
    return (
      <ScreenLayout hideHeader={true}>
        <View
          style={{
            paddingHorizontal: scale(10),
            height: verticalScale(80),
            // backgroundColor: colors.secondary_surface,
            gap: scale(8),
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: themeColors.surface.secondarySurface,
          }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: 10,
              height: moderateScale(40),
              width: moderateScale(40),
              // backgroundColor: 'red',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: scale(8),
            }}
            onPress={() => {
              setSelectedZodiac(null);
            }}>
            <BackIcon color={themeColors.text.primary} />
          </TouchableOpacity>
          <View
            style={{flexDirection: 'row', alignItems: 'center', gap: scale(8)}}>
            <Text
              style={[
                textStyle.fs_abyss_24_400,
                {
                  color: colors.primaryText ?? '#000',
                  textAlign: 'center',
                },
              ]}>
              {selectedZodiac.name}
            </Text>
          </View>
        </View>
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: themeColors.surface.secondarySurface,
          }}>
          <View
            style={{
              paddingHorizontal: scale(20),
              paddingVertical: verticalScale(20),
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: verticalScale(20),
              }}>
              <Image
                source={selectedZodiac.image}
                style={{
                  width: 80,
                  height: 80,
                  resizeMode: 'contain',
                  marginBottom: 10,
                }}
              />
            </View>
            <Text style={[textStyle.fs_abyss_16_400, {textAlign: 'center'}]}>
              Aries is the first sign of the zodiac, known for its fiery energy
              and leadership qualities. People born under Aries are often bold,
              competitive, and passionate. They love to take initiative and are
              natural-born leaders who thrive in dynamic environments.
            </Text>
          </View>
        </ScrollView>
      </ScreenLayout>
    );
  }
  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.secondarySurface}>
      <ScrollView>
        <View
          style={[
            {
              paddingHorizontal: scale(20),
              paddingVertical: verticalScale(20),
              backgroundColor: themeColors.card.default,
              flex: 1,
            },
          ]}>
          <Text
            style={[
              textStyle.fs_abyss_28_400,
              {color: themeColors.text.secondary, textAlign: 'center'},
            ]}>
            Horoscope - Daily, Weekly & Monthly Predictions
          </Text>
          <Text
            style={[
              textStyle.fs_abyss_16_400,
              {textAlign: 'center', marginVertical: verticalScale(20)},
            ]}>
            Horoscopes provide daily, weekly and monthly astrological
            predictions, helping you understand the influences of planets on
            your life.
          </Text>
          <VerticalTabSwitcher
            tabs={[
              {key: 'daily', label: 'Daily'},
              {key: 'weekly', label: 'Weekly'},
              {key: 'monthly', label: 'Monthly'},
            ]}
            value={activeTab}
            onTabChange={tab => setActiveTab(tab)}
            initialTab="daily"
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingVertical: verticalScale(20),
            }}>
            {zodiacData.map(item => (
              <ZodiacCard
                key={item.name}
                name={item.name}
                image={item.image}
                onPress={() => setSelectedZodiac(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default Horoscope;
