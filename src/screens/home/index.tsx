import React from 'react';
import {View, Text, Image} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import Input from '../../componentsV1/common/input';
import CustomButton from '../../componentsV1/common/custom-button';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import SearchIcon from '../../assets/icons/search-icon';
import {categories} from './categories-data'; // Move array into separate file

const HomeNew = () => {
  return (
    <PageWithHeader rounded={true} scrollHeader>
      {/* HERO BANNER */}
      <View style={{position: 'relative'}}>
        <Image
          style={{
            position: 'absolute',
            top: verticalScale(-80),
            width: '100%',
            borderBottomLeftRadius: scale(16),
            borderBottomRightRadius: scale(16),
          }}
          source={require('../../assets/imgs/home-design-1.png')}
        />

        <Input
          containerStyle={{
            marginHorizontal: scale(20),
            marginTop: verticalScale(20),
          }}
          inputContainerStyle={{
            borderRadius: scale(80),
            backgroundColor: COLORS.theme.white,
          }}
          leftIcon={<SearchIcon />}
          placeholder="Search for service"
        />

        <Image
          style={{marginTop: verticalScale(16)}}
          source={require('../../assets/imgs/home-demo-img.png')}
        />
      </View>

      {/* BOOKING CARD */}
      <View
        style={{
          marginTop: verticalScale(48),
          padding: scale(16),
          marginHorizontal: 20,
          backgroundColor: COLORS.theme.primary,
          borderRadius: scale(12),
          gap: verticalScale(8),
        }}>
        <Text style={{fontSize: scaleFont(24), color: COLORS.theme.white}}>
          Book an Appointment
        </Text>
        <Text style={{fontSize: scaleFont(14), color: COLORS.theme.white}}>
          Connect with expert astrologers at your preferred time.
        </Text>

        <View style={{flexDirection: 'row', gap: scale(16)}}>
          <CustomButton
            style={{flex: 1, backgroundColor: COLORS.theme.secondary}}
            textStyle={{color: COLORS.theme.black}}
            title="Online"
            onPress={() => {}}
          />

          <CustomButton
            style={{flex: 1, backgroundColor: COLORS.theme.white}}
            textStyle={{color: COLORS.theme.black}}
            title="Offline"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* CATEGORY GRID */}
      <View
        style={{
          paddingHorizontal: scale(20),
          marginTop: verticalScale(28),
          marginBottom: verticalScale(80),
        }}>
        <Image source={require('../../assets/imgs/banner1.png')} />

        <View style={{marginTop: verticalScale(28), gap: verticalScale(16)}}>
          {[0, 4, 8].map(start => (
            <View
              key={start}
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              {categories.slice(start, start + 4).map((item, idx) => (
                <View
                  key={idx}
                  style={{flex: 1, alignItems: 'center', paddingHorizontal: 4}}>
                  <View
                    style={{
                      height: scale(60),
                      width: scale(60),
                      borderRadius: scale(30),
                      backgroundColor: COLORS.theme.secondary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{fontSize: scaleFont(24)}}>{item.icon}</Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 6,
                      textAlign: 'center',
                      width: scale(72),
                      fontSize: 12,
                    }}>
                    {item.title}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </PageWithHeader>
  );
};

export default HomeNew;
