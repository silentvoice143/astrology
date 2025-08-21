import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import ScreenLayout from '../components/screen-layout';
import AnimatedSearchInput from '../components/custom-searchbox';
import CustomButton from '../components/custom-button';
import ChatIcon from '../assets/icons/chat-icon';
import CallIcon from '../assets/icons/call-icon';
import {textStyle} from '../constants/text-style';
import {scale, scaleFont, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import SlidingCard from '../components/home/card-carosel';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';

import QuickNavigation from '../components/home/quick-navigation';
import FirstChatFreePopup from '../components/free-chat-popup';
import {setFreeChatModalShown} from '../store/reducer/auth';
import {
  getAllAstrologers,
  getOnlineAstrologer,
} from '../store/reducer/astrologers';
import {Astrologers as AstrologersType, UserDetail} from '../utils/types';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import {useSharedValue} from 'react-native-reanimated';
import IntroCard from '../components/home/intro-card';
import {getBanner} from '../store/reducer/general';
import {useUserRole} from '../hooks/use-role';
import SkeletonItem from '../components/skeleton';

const width = Dimensions.get('window').width - 40;
const data = [...new Array(6).keys()];

const Home = () => {
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState<{imgUrl: string; id: string}[]>([]);
  const navigation = useNavigation<any>();
  const [isFirstChatModalOpen, setIsFirstChatModalOpen] = useState(false);
  const {freeChatUsed} = useAppSelector(state => state.auth.user);
  const {freeChatModalShown} = useAppSelector(state => state.auth);
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
  const {onlineAstrologerDetails} = useAppSelector(state => state.astrologer);
  const [onlineAstrologerDetailsApi, setOnlineAstrologerDetailApi] = useState<
    {
      name: string;
      expertise: string;
      about: string;
      imgUri: string;
      id: string;
      userId: string;
      online: boolean;
    }[]
  >([]);
  const dispatch = useAppDispatch();
  // console.log(onlineAstrologerDetails, '----details');
  // const [loading, setLoading] = useState(false);
  const role = useUserRole();
  const [loading, setLoading] = useState<{
    banner: boolean;
    astrologer: boolean;
    onlineAstrologer: boolean;
  }>({
    banner: false,
    astrologer: false,
    onlineAstrologer: false,
  });
  const [astrologersData, setAstrologersData] = useState<
    {
      name: string;
      expertise: string;
      about: string;
      imgUri: string;
      id: string;
      userId: string;
      online: boolean;
    }[]
  >([]);
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const fetchAstrologersData = async (pageNumber = 1, append = false) => {
    if (loading.astrologer) return;
    try {
      setLoading(prev => ({...prev, astrologer: true}));

      const payload = await dispatch(getAllAstrologers(`?page=1`)).unwrap();

      if (payload.success) {
        const newData =
          payload.astrologers.map((item: AstrologersType) => ({
            name: item?.user?.name,
            expertise: item?.expertise,
            about: item?.about,
            id: item?.id,
            imgUri: item?.user?.imgUri,
            userId: item?.user?.id,
            online: item?.online,
          })) || [];
        setAstrologersData(newData);
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({...prev, astrologer: false}));
    }
  };

  const fetchOnlineAstrologersData = async () => {
    if (loading.astrologer) return;
    try {
      setLoading(prev => ({...prev, onlineAstrologer: true}));

      const payload = await dispatch(getOnlineAstrologer()).unwrap();
      // console.log(payload, '---------online astrologers');
      if (payload.success) {
        const newData =
          payload.astrologers.map((item: AstrologersType) => ({
            name: item?.user?.name,
            expertise: item?.expertise,
            about: item?.about,
            id: item?.id,
            imgUri: item?.user?.imgUri,
            userId: item?.user?.id,
            online: item?.online,
          })) || [];
        setOnlineAstrologerDetailApi(newData);
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({...prev, onlineAstrologer: false}));
    }
  };

  const getBannerData = async () => {
    if (loading.banner) return;
    try {
      setLoading(prev => ({...prev, banner: true}));

      const payload = await dispatch(getBanner()).unwrap();

      if (payload.success) {
        setBanner(payload.bannars);
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({...prev, banner: false}));
    }
  };

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
        navigation.navigate('Astrologers', {sort: 'marriage'});
        break;
      case 'tarot':
        navigation.navigate('Astrologers', {sort: 'tarot'});
        break;
    }
  };

  useEffect(() => {
    if (
      freeChatUsed ||
      isFirstChatModalOpen ||
      freeChatModalShown ||
      role === 'ASTROLOGER'
    )
      return;
    const timeout = setTimeout(() => {
      setIsFirstChatModalOpen(true);
      dispatch(setFreeChatModalShown());
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasFetchedInitialData) {
      fetchOnlineAstrologersData();
      fetchAstrologersData();
      getBannerData();
      setHasFetchedInitialData(true);
    }
  }, [hasFetchedInitialData]);

  const sortedAstrologerData = astrologersData.sort((a, b) => {
    return (b.online === true ? 1 : 0) - (a.online === true ? 1 : 0);
  });

  const finalAstrologerList = React.useMemo(() => {
    // 1. Use socket data if it exists and initial data has been fetched
    if (
      hasFetchedInitialData &&
      onlineAstrologerDetails &&
      onlineAstrologerDetails.length > 0
    ) {
      return onlineAstrologerDetails.map(item => ({
        name: item?.user?.name,
        expertise: item?.expertise,
        about: item?.about,
        id: item?.id,
        imgUri: item?.user?.imgUri,
        userId: item?.user?.id,
        online: item?.online,
      }));
    }

    // 2. Use API's online astrologers if available
    if (onlineAstrologerDetailsApi && onlineAstrologerDetailsApi.length > 0) {
      return onlineAstrologerDetailsApi;
    }

    // 3. Fallback to all astrologers list (sorted)
    return sortedAstrologerData;
  }, [
    onlineAstrologerDetails,
    onlineAstrologerDetailsApi,
    sortedAstrologerData,
    hasFetchedInitialData,
  ]);

  return (
    <ScreenLayout>
      {isFirstChatModalOpen && (
        <FirstChatFreePopup
          isOpen={isFirstChatModalOpen}
          onClose={() => {
            setIsFirstChatModalOpen(false);
          }}
          onClaimPress={() => {
            navigation.navigate('Astrologers');
          }}
        />
      )}

      <ScrollView
        // keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        style={HomeStyle.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
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
          {loading.banner ? (
            <View
              style={{
                paddingHorizontal: scale(20),
                marginVertical: verticalScale(20),
                height: verticalScale(120),
                overflow: 'hidden',
                borderRadius: scale(24),
              }}>
              <SkeletonItem
                width={width}
                height={verticalScale(120)}
                borderRadius={8}
              />
            </View>
          ) : (
            banner.length > 0 && (
              <View
                style={{
                  paddingHorizontal: scale(20),
                  marginVertical: verticalScale(20),
                }}>
                <Carousel
                  ref={ref}
                  height={verticalScale(120)}
                  width={width}
                  data={banner}
                  onProgressChange={progress}
                  autoPlay={true}
                  scrollAnimationDuration={2000}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 1,
                    parallaxScrollingOffset: 10,
                    parallaxAdjacentItemScale: 0.8,
                  }}
                  renderItem={({index, item}) => (
                    <Image
                      source={{uri: item?.imgUrl}}
                      resizeMode="cover"
                      style={{
                        height: verticalScale(120),
                        width: '100%',
                        borderRadius: scale(16),
                      }}
                    />
                  )}
                />
              </View>
            )
          )}

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
              Live Astrologers
            </Text>
            {loading?.astrologer ? (
              <View
                style={{
                  paddingHorizontal: scale(20),
                  marginVertical: verticalScale(20),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <SkeletonItem
                  height={verticalScale(300)}
                  width={width * 0.7}
                  borderRadius={8}
                />
              </View>
            ) : (
              <SlidingCard data={finalAstrologerList} />
            )}
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
            {loading.astrologer ? (
              <SkeletonItem
                height={width / 2 - verticalScale(60)}
                width={width}
                borderRadius={12}
              />
            ) : (
              <Carousel
                ref={ref}
                height={width / 2}
                width={width}
                data={astrologersData}
                onProgressChange={progress}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 1,
                  parallaxScrollingOffset: 10,
                  parallaxAdjacentItemScale: 0.8,
                }}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      flex: 1,

                      justifyContent: 'center',
                    }}>
                    <IntroCard
                      id={item.id}
                      name={item.name}
                      rate={'21'}
                      avatar={item.imgUri}
                      specialty={item.expertise}
                    />
                  </View>
                )}
              />
            )}
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
