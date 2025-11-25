import {View, Text, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';

const Astrologers = () => {
  return (
    <PageWithHeader themeMode="light">
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(30),
          backgroundColor: COLORS.theme.white,
          flex: 1,
        }}>
        {/* PROFILE IMAGE */}
        <View style={{alignItems: 'center', marginTop: verticalScale(20)}}>
          <Image
            source={require('../../assets/imgs/profile-demo.jpg')}
            style={{
              height: scale(120),
              width: scale(120),
              borderRadius: scale(60),
              borderWidth: 3,
              borderColor: COLORS.theme.secondary,
            }}
          />
        </View>

        {/* NAME & RATING */}
        <View style={{alignItems: 'center', marginTop: verticalScale(14)}}>
          <Text style={{fontSize: scaleFont(22), fontWeight: '700'}}>
            Astro Priya Sharma
          </Text>
          <Text style={{marginTop: 6, fontSize: scaleFont(14), color: '#666'}}>
            ★ 4.9 • Vedic Astrology • Tarot
          </Text>
        </View>

        {/* ABOUT */}
        <View style={{marginTop: verticalScale(22)}}>
          <Text style={{fontSize: scaleFont(18), fontWeight: '700'}}>
            About
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: scaleFont(14),
              color: '#444',
              lineHeight: 20,
            }}>
            With 10+ years of experience in Vedic astrology and tarot readings,
            I help individuals find clarity in their personal, professional, and
            spiritual journeys. Specializing in marriage matching, career
            guidance, and remedies.
          </Text>
        </View>

        {/* EXPERIENCE + LANGUAGE */}
        <View
          style={{
            marginTop: verticalScale(22),
            padding: scale(16),
            backgroundColor: COLORS.theme.secondary,
            borderRadius: scale(12),
          }}>
          <Text style={{fontSize: scaleFont(14), fontWeight: '700'}}>
            Experience: <Text style={{fontWeight: '400'}}>10+ years</Text>
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: scaleFont(14),
              fontWeight: '700',
            }}>
            Languages: <Text style={{fontWeight: '400'}}>Hindi, English</Text>
          </Text>
        </View>

        {/* BOOKING BUTTONS */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: verticalScale(30),
            gap: scale(16),
          }}>
          {/* Online Button */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: COLORS.theme.primary,
              paddingVertical: verticalScale(14),
              borderRadius: scale(10),
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: scaleFont(16),
                color: COLORS.theme.white,
                fontWeight: '700',
              }}>
              Book Online
            </Text>
          </TouchableOpacity>

          {/* Offline Button */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: COLORS.theme.white,
              paddingVertical: verticalScale(14),
              borderWidth: 2,
              borderRadius: scale(10),
              borderColor: COLORS.theme.primary,
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: scaleFont(16),
                color: COLORS.theme.primary,
                fontWeight: '700',
              }}>
              Book Offline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageWithHeader>
  );
};

export default Astrologers;
