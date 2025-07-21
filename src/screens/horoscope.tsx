import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import {textStyle} from '../constants/text-style';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';
import VerticalTabSwitcher from '../components/vertical-tab';

import ZodiacCard from '../components/horoscope/zodiac-card';
import BackIcon from '../assets/icons/back-icon';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import TabSwitcher from '../components/tab';
import TabBar from '../components/horizontal-tab';
import Toast from 'react-native-toast-message';
import {
  getDailyHoroscope,
  getMonthlyHoroscope,
} from '../store/reducer/horoscope';
import {useAppDispatch} from '../hooks/redux-hook';
import {getFormattedDate} from '../utils/utils';

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

const demoData = {
  personal:
    'In personal relationships, you may experience some tension due to conflicting needs or desires...',
  health: 'Your health may require extra attention today...',
  profession:
    'Today, your professional life is likely to see some positive developments...',
  emotions: 'Emotional ups and downs are on the horizon today...',
  travel: "Today's energies are supportive of short trips or local travel...",
  luck: [
    'Colors of the day : Red, Gold',
    'Lucky Numbers of the day : 5, 11, 23',
    'Lucky Alphabets you will be in sync with : M, R',
    'Cosmic Tip : Stay grounded and open-minded for new opportunities.',
    'Tips for Singles : Take a chance and meet someone new today.',
    'Tips for Couples : Communicate openly to resolve any misunderstandings.',
  ],
};

interface HoroscopeDataType {
  personal: string;
  health: string;
  profession: string;
  emotions: string;
  travel: string;
  luck: string[];
}

const Horoscope = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [detailTab, setDetailTab] = useState('personal');
  const [selectedZodiac, setSelectedZodiac] = useState<null | {
    name: string;
    image: any;
  }>(null);
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeDataType | null>(
    demoData,
  );
  const dispatch = useAppDispatch();
  const getDailyHoroscopeData = async () => {
    try {
      const {day, month, year} = getFormattedDate();
      console.log(
        `?sign=${selectedZodiac?.name.toLowerCase()}&day=${day}&month=${month}&year=${year}`,
      );
      const payload = await dispatch(
        getDailyHoroscope(
          `?sign=${selectedZodiac?.name}&day=${day}&month=${month}&year=${year}`,
        ),
      ).unwrap();
      if (payload.success) {
        console.log(payload, '---horoscope daily');
        setHoroscopeData(payload?.data?.prediction);
      } else {
        Toast.show({
          type: 'warning',
          text1: 'Something went wrong',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.msg || 'Something went wrong',
      });
    }
  };

  const getWeeklyHoroscopeData = async () => {
    try {
      const payload = await dispatch(
        getDailyHoroscope(`?sign=${selectedZodiac?.name}`),
      ).unwrap();
      console.log(payload, '---horoscope weekly');
      if (payload.success) {
        setHoroscopeData(payload?.data?.prediction);
      } else {
        Toast.show({
          type: 'warning',
          text1: 'Something went wrong',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.msg || 'Something went wrong',
      });
    }
  };

  const getMonthlyHoroscopeData = async () => {
    try {
      const payload = await dispatch(
        getMonthlyHoroscope(`?sign=${selectedZodiac?.name}`),
      ).unwrap();
      if (payload.success) {
        console.log(payload, '---horoscope monthly');

        setHoroscopeData(payload?.data?.prediction);
      } else {
        Toast.show({
          type: 'warning',
          text1: 'Something went wrong',
        });
      }
    } catch (err: any) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: err?.msg || 'Something went wrong',
      });
    }
  };

  useEffect(() => {
    if (selectedZodiac) {
      if (activeTab === 'daily') {
        getDailyHoroscopeData();
      } else if (activeTab === 'weekly') {
        getWeeklyHoroscopeData();
      } else {
        getMonthlyHoroscopeData();
      }
    }
  }, [selectedZodiac]);

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

              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: scale(8),
            }}
            onPress={() => {
              setSelectedZodiac(null);
            }}>
            <ChevronLeftIcon size={32} color={themeColors.text.primary} />
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
        <View style={{backgroundColor: themeColors.surface.secondarySurface}}>
          <TabSwitcher
            enableHorizontalScroll={true}
            containerStyle={{
              marginTop: 0,
              backgroundColor: themeColors.surface.secondarySurface,
            }}
            tabs={[
              {key: 'personal', label: 'Personal'},
              {key: 'health', label: 'Health'},
              {key: 'profession', label: 'Profession'},
              {key: 'emotions', label: 'Emotions'},
              {key: 'travel', label: 'Travel'},
              {key: 'luck', label: 'Luck'},
            ]}
            onTabChange={tab => setDetailTab(tab)}
            initialTab="personal"
          />
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
            {detailTab === 'personal' && (
              <Text style={[textStyle.fs_abyss_16_400, {}]}>
                {horoscopeData?.personal}
              </Text>
            )}
            {detailTab === 'health' && (
              <Text style={[textStyle.fs_abyss_16_400, {}]}>
                {horoscopeData?.health}
              </Text>
            )}
            {detailTab === 'profession' && (
              <Text style={[textStyle.fs_abyss_16_400, {}]}>
                {horoscopeData?.profession}
              </Text>
            )}
            {detailTab === 'emotions' && (
              <Text style={[textStyle.fs_abyss_16_400, {}]}>
                {horoscopeData?.emotions}
              </Text>
            )}
            {detailTab === 'travel' && (
              <Text style={[textStyle.fs_abyss_16_400, {}]}>
                {horoscopeData?.travel}
              </Text>
            )}
            {detailTab === 'luck' &&
              horoscopeData?.luck.map((item, index) => (
                <Text
                  key={`${index}-horoscope-category`}
                  style={[textStyle.fs_abyss_16_400, {}]}>
                  {item}
                </Text>
              ))}
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
