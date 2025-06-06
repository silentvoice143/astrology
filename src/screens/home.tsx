import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ScreenLayout from '../components/screen-layout';
import AnimatedSearchInput from '../components/custom-searchbox';
import CustomButton from '../components/custom-button';
import ChatIcon from '../assets/icons/ChatIcon';
import CallIcon from '../assets/icons/CallIcon';
import {textStyle} from '../constants/text-style';
import KundliLogo from '../assets/icons/KundliLogo';
import {scale, scaleFont, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';

const Home = () => {
  const [search, setSearch] = useState('');

  return (
    <ScreenLayout>
      <ScrollView style={HomeStyle.container}>
        {/* Greeting */}
        <LinearGradient
          colors={[
            colors.secondary_surface,
            colors.secondary_surface_2,
            colors.tertiary_surface,
          ]}>
          <View style={HomeStyle.greetingContainer}>
            <Text style={[textStyle.fs_abyss_20_400]}>Hello</Text>
            <Text style={[textStyle.fs_abyss_36_400, HomeStyle.userName]}>
              Satyam
            </Text>

            {/* Horoscope Button */}
            <CustomButton
              title="Today's horoscope"
              onPress={() => {}}
              style={HomeStyle.horoscopeButton}
              textStyle={[textStyle.fs_mont_14_500, HomeStyle.horoscopeText]}
            />
          </View>
        </LinearGradient>
        <View style={{position: 'relative'}}>
          <Image
            style={{
              position: 'absolute',
              top: 300,
              right: -20,
              height: 466,
              width: 200,
            }}
            source={require('../assets/imgs/bg-img2.png')}
          />
          <View
            style={{
              backgroundColor: colors.primary_surface,
              borderTopEndRadius: 24,
              borderTopStartRadius: 24,
              position: 'relative',
              top: -20,
              paddingTop: verticalScale(60),
            }}>
            {/* Search Bar */}
            <View
              style={{
                position: 'absolute',
                top: verticalScale(-24),
                paddingHorizontal: scale(40),
                paddingVertical: verticalScale(2),
                width: '100%',
              }}>
              <AnimatedSearchInput
                enableShadow={true}
                placeholder="Search here for pandits"
                value={search}
                onChangeText={setSearch}
                iconPosition="left"
                containerStyle={{width: '100%'}}
                inputContainerStyle={HomeStyle.searchInput}
              />
            </View>

            {/* Quick Actions */}
            <View style={[HomeStyle.actionsContainer]}>
              <View style={HomeStyle.singleAction}>
                <TouchableOpacity style={HomeStyle.actionCard}>
                  <CallIcon />
                </TouchableOpacity>
                <Text
                  style={[textStyle.fs_abyss_14_400, HomeStyle.actionText]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Talk to Astrologer
                </Text>
              </View>

              <View style={HomeStyle.singleAction}>
                <TouchableOpacity style={HomeStyle.actionCard}>
                  <ChatIcon />
                </TouchableOpacity>
                <Text
                  style={[textStyle.fs_abyss_14_400, HomeStyle.actionText]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Chat with Astrologer
                </Text>
              </View>
            </View>

            {/* View Kundli Button */}
            <TouchableOpacity
              style={[HomeStyle.kundliButton]}
              onPress={() => {}}>
              <KundliLogo />
              <Text style={[textStyle.fs_mont_20_400, HomeStyle.kundliText]}>
                View kundli
              </Text>
            </TouchableOpacity>
          </View>

          {/* Our Astrologer  */}
          <View>
            <Text
              style={[
                textStyle.fs_mont_20_700,
                HomeStyle.sectionTitle,
                {fontWeight: 600, textAlign: 'center'},
              ]}>
              Our Astrologers
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default Home;

const HomeStyle = StyleSheet.create({
  container: {
    backgroundColor: colors.primary_surface,
  },
  greetingContainer: {
    flexDirection: 'column',
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(58),
    paddingHorizontal: scale(68),
  },
  greetingText: {
    fontSize: scaleFont(20),
    fontWeight: '400',
    color: colors.primaryText,
  },
  userName: {
    fontWeight: '700',
    color: colors.userNmaeText,
  },
  horoscopeButton: {
    backgroundColor: colors.secondarybtn,
    borderRadius: scale(20),
    marginTop: scale(52),
    paddingVertical: verticalScale(12),
  },
  horoscopeText: {
    color: '#fff',
  },
  searchContainer: {
    marginTop: verticalScale(30),
  },
  searchInput: {
    borderRadius: scale(24),
    borderColor: colors.primarybtn,
    borderWidth: 1,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(60),
  },

  singleAction: {
    alignItems: 'center',
    marginHorizontal: scale(5),
  },

  actionCard: {
    width: scale(90),
    height: verticalScale(70),
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(16),
    backgroundColor: '#fff',
    borderRadius: scale(15),

    shadowColor: colors.glow_shadow, // yellow
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 10,
    // Android shadow (limited control)
    elevation: 15,
  },

  actionText: {
    textAlign: 'center',
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: colors.secondaryText,
    marginTop: verticalScale(16),
  },
  kundliButton: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(16),
    flexDirection: 'row',
    backgroundColor: colors.secondarybtn,
    // gap:scale(43),
    marginTop: verticalScale(40),
  },
  kundliText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: scale(28),
  },
  sectionTitle: {
    marginTop: verticalScale(40),
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: colors.primaryText,
  },
});
