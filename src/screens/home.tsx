import React, {useEffect, useState} from 'react';
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
import ChatIcon from '../assets/icons/chat-icon';
import CallIcon from '../assets/icons/call-icon';
import {textStyle} from '../constants/text-style';
import KundliLogo from '../assets/icons/kundli-icon';
import {scale, scaleFont, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import SlidingCard from '../components/home/card-carosel';
import AstrologerCarosel from '../components/home/top-astrologer-carosel';
import Carousel from '../components/carosel';
import PersonalDetailModal from '../components/personal-detail-modal';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';

import {useUserRole} from '../hooks/use-role';
import QuickNavigation from '../components/home/quick-navigation';
import FirstChatFreePopup from '../components/free-chat-popup';

const Home = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<any>();
  const [isFirstChatModalOpen, setIsFiirstChatModalOpen] = useState(false);
  const [headerBgColor, setHeaderBgColor] = useState('color');

  const user = useAppSelector(state => state.auth.user);
  const astrologer_detail = useAppSelector(
    state => state.auth.astrologer_detail,
  );
  const userRole = useUserRole();
  console.log(user, '-----user detail in redux');
  // const {isProfileComplete} = useAppSelector(state => state.auth);

  // const [isPersonalDetailModalOpen, setIsPersonalDetailModalOpen] =
  //   useState(false);
  // const [forKundli, setForKundli] = useState(false);
  // const dispatch = useAppDispatch();

  // const handlePostUserData = async (user: UserPersonalDetail) => {
  //   try {
  //     const payload = await dispatch(postUserDetail(user)).unwrap();

  //     if (payload?.success) {
  //       setIsPersonalDetailModalOpen(false);
  //       dispatch(setUser(payload.user));
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // Function to handle search input changes
  const handleSearchChange = (text: string) => {
    setSearch(text); // Update the local state
  };
  const handleSearchSubmit = () => {
    // Navigate to Astrologers screen with the current search query and focus instruction
    navigation.navigate('Astrologers', {
      initialSearch: search,
      focusSearch: true,
    });
  };
  const handleQuickNavigation = (nav: string) => {
    switch (nav) {
      case 'horoscope':
        navigation.navigate('Horoscope');
        break;
      case 'kundli':
        navigation.navigate('KundliForm');
        break;
      case 'match-making':
        navigation.navigate('MatchMaking');
        break;
      case 'tarot':
        navigation.navigate('Tarot');
        break;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFiirstChatModalOpen(true);
    }, 500); // open after 500ms

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ScreenLayout>
      {/* <PersonalDetailModal
        existingDetails={{
          name: userRole === 'ASTROLOGER' ? user.name : '',
          gender: '',
          birthDate: new Date().toISOString().split('T')[0],
          birthTime: new Date().toTimeString().split(' ')[0],
          birthPlace: '',
          latitude: null,
          longitude: null,
        }}
        isOpen={true}
        onClose={() => {}}
        onSubmit={data => {}}
      /> */}

      <FirstChatFreePopup
        isOpen={isFirstChatModalOpen}
        onClose={() => {
          setIsFiirstChatModalOpen(false);
        }}
        onClaimPress={() => {
          navigation.navigate('Astrologers');
        }}
      />

      <ScrollView
        scrollEventThrottle={16}
        style={HomeStyle.container}
        showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <LinearGradient
          colors={[
            colors.secondary_surface,
            // colors.secondary_surface_2,
            colors.primary_surface,
          ]}>
          <View
            style={{
              paddingHorizontal: scale(40),
              marginTop: verticalScale(20),
              width: '100%',
            }}>
            <AnimatedSearchInput
              shadowColor={colors.glow_shadow}
              iconColor={colors.primarybtn}
              enableShadow={true}
              placeholder="Search here for pandits"
              value={search}
              onChangeText={handleSearchChange}
              iconPosition="left"
              containerStyle={{width: '100%'}}
              inputContainerStyle={HomeStyle.searchInput}
              onSubmitEditing={handleSearchSubmit}
            />
          </View>
        </LinearGradient>
        <View
          style={{
            position: 'relative',
            gap: verticalScale(20),
            marginTop: verticalScale(40),
          }}>
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
          <View style={{}}>
            <QuickNavigation onClick={handleQuickNavigation} />
          </View>

          {/* banner */}
          <View
            style={{
              paddingHorizontal: scale(20),
            }}>
            <Image source={require('../assets/imgs/banner.png')} />
          </View>

          {/* Our Astrologer  */}
          <View style={{}}>
            <Text
              style={[
                textStyle.fs_mont_20_700,
                HomeStyle.sectionTitle,
                {
                  marginBottom: verticalScale(20),
                  fontWeight: 600,
                  textAlign: 'center',
                },
              ]}>
              Our Astrologers
            </Text>
            <SlidingCard />
          </View>
          <View
            style={{
              height: 1,
              width: '80%',
              alignSelf: 'center',
              backgroundColor: colors.primary_border,
              marginVertical: verticalScale(28),
            }}></View>

          {/* Top astrologer list  */}
          <View
            style={{
              paddingHorizontal: scale(20),
              marginBottom: verticalScale(80),
            }}>
            <Text
              style={[
                textStyle.fs_mont_20_700,
                {
                  marginBottom: verticalScale(20),
                  fontWeight: 600,
                  textAlign: 'center',
                },
              ]}>
              Top Astrologers
            </Text>
            <Carousel
              data={introCardData}
              pagination={true}
              cardWidthScale={0.9}
              CardComponent={AstrologerCarosel}
            />
          </View>
        </View>
      </ScrollView>
      <CustomButton
        style={{
          width: scale(140),
          position: 'absolute',
          bottom: 20,
          left: 20,
          backgroundColor: colors.primarybtn,
        }}
        leftIcon={<CallIcon colors={['#000000']} height={20} width={20} />}
        textStyle={{color: colors.primaryText}}
        onPress={() => {
          navigation.navigate('Astrologers');
        }}
        title={'Call Now'}
      />
      <CustomButton
        style={{
          width: scale(140),
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: colors.tertiary_btn,
        }}
        leftIcon={<ChatIcon colors={['#ffffff']} height={20} width={20} />}
        onPress={() => {
          navigation.navigate('Astrologers');
        }}
        title={'Chat Now'}
      />
    </ScreenLayout>
  );
};

export default Home;

const introCardData = [
  {
    id: 1,
    name: 'Pt. Raveena Tandon',
    rate: '10 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=9',
    specialty: 'Specialist in Vedic Gyan',
  },
  {
    id: 2,
    name: 'Acharya Ved Prakash',
    rate: '12 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=8',
    specialty: 'Expert in Love & Marriage Solutions',
  },
  {
    id: 3,
    name: 'Guru Anand Joshi',
    rate: '15 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=7',
    specialty: 'Career & Finance Consultant',
  },
  {
    id: 4,
    name: 'Mata Sushila Devi',
    rate: '8 Rs / Min',
    avatar: 'https://i.pravatar.cc/300?img=6',
    specialty: 'Spiritual & Reiki Healer',
  },
];

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
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: colors.primaryText,
  },
});
