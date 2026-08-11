import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import Input from '../../componentsV1/common/input';
import CustomButton from '../../componentsV1/common/custom-button';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {colors, COLORS} from '../../constants/colors';
import SearchIcon from '../../assets/icons/search-icon';
import {categories} from './categories-data'; // Move array into separate file
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {getBanner, getTopBanner} from '../../store/reducer/general';
import Carousel from 'react-native-reanimated-carousel';
import Skeleton from '../../components/skeleton';
import notifee, {AndroidImportance} from '@notifee/react-native';
import SlidingCard from '../../components/home/card-carosel';
import SkeletonItem from '../../components/skeleton';
import {
  getAllAstrologers,
  getOnlineAstrologer,
  setOnlineAstrologerDetails,
} from '../../store/reducer/astrologers';
import {Astrologers as AstrologersType, UserDetail} from '../../utils/types';
import {textStyle} from '../../constants/text-style';
import {useWebSocket} from '../../hooks/use-socket-new';
import SlidingAstrologerCard from '../../components/home/card-carosel-astrologer';
import FirstChatFreePopup from '../../components/free-chat-popup';
import {setFreeChatModalShown} from '../../store/reducer/auth';
import {useUserRole} from '../../hooks/use-role';
const width = Dimensions.get('window').width - 40;

const HomeNew = () => {
  const [banner, setBanner] = useState<{imgUrl: string; id: string}[]>([]);
  const [topBanner, setTopBanner] = useState<{imgUrl: string; id: string}>();
  // const [loading, setLoading] = useState<{ banner: boolean }>({ banner: false });
  const [loading, setLoading] = useState<{
    banner: boolean;
    astrologer: boolean;
    onlineAstrologer: boolean;
    topbanner: boolean;
  }>({
    topbanner: false,
    banner: false,
    astrologer: false,
    onlineAstrologer: false,
  });
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user, isAuthenticated, token} = useAppSelector(
    (state: any) => state.auth,
  );
  const {isConnected} = useWebSocket(user?.id);

  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
  const {onlineAstrologerDetails} = useAppSelector(state => state.astrologer);
  const [onlineAstrologerDetailsApi, setOnlineAstrologerDetailApi] = useState<
    any[]
  >([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    isLastPage: false,
  });

  const [astrologerData, setAstrologerData] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isFirstChatModalOpen, setIsFirstChatModalOpen] = useState(false);
  const role = useUserRole();

  const {freeChatModalShown} = useAppSelector(state => state.auth);

  const freeChatUsed = user?.freeChatUsed;

  useEffect(() => {
    if (
      freeChatUsed ||
      isFirstChatModalOpen ||
      freeChatModalShown ||
      role === 'ASTROLOGER'
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsFirstChatModalOpen(true);
      dispatch(setFreeChatModalShown());
    }, 500);

    return () => clearTimeout(timeout);
  }, [freeChatUsed, isFirstChatModalOpen, freeChatModalShown, role, dispatch]);

  const getTopBannerData = async () => {
    if (loading.topbanner) return;
    try {
      setLoading(prev => ({...prev, topbanner: true}));

      const payload = await dispatch(getTopBanner()).unwrap();

      if (payload.success) {
        setTopBanner(payload.bannar);
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({...prev, topbanner: false}));
    }
  };

  const getBannerData = async () => {
    if (loading.banner) return;
    try {
      setLoading(prev => ({...prev, banner: true}));

      const payload = await dispatch(getBanner()).unwrap();

      if (payload.success) {
        console.log('BANNER PAYLOAD', payload.bannars);
        setBanner(payload.bannars);
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({...prev, banner: false}));
    }
  };

  async function showTestNotification() {
    await notifee.displayNotification({
      title: 'Test Notification',
      body: 'This is a test notification 🔔',
      android: {
        channelId: 'high_importance_channel',
        smallIcon: 'ic_launcher', // must exist in android/app/src/main/res
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  const fetchAllAstrologer = async (page: number = 1, limit: number = 1) => {
    try {
      if (pagination.isLastPage || loadingMore) return;
      setLoadingMore(true);
      const params = `?page=${page}&limit=${limit}`;

      const response = await dispatch(getAllAstrologers(params)).unwrap();

      console.log(response.astrologers, '----all astrologers');

      if (response?.success) {
        setAstrologerData(prev => [...prev, ...(response?.astrologers || [])]);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          isLastPage: response.isLastPage,
        });
      }
    } catch (error) {
      console.log(error, '----fetch astrologer error');
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchOnlineAstrologersData = async () => {
    if (loading.astrologer) return;
    try {
      setLoading(prev => ({...prev, onlineAstrologer: true}));

      const payload = await dispatch(getOnlineAstrologer()).unwrap();

      if (payload.success) {
        setOnlineAstrologerDetailApi(payload?.astrologers);
        dispatch(setOnlineAstrologerDetails(payload?.astrologers || []));
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({...prev, onlineAstrologer: false}));
    }
  };

  const finalAstrologerList = React.useMemo(() => {
    // 1. Use socket data if it exists and initial data has been fetched
    if (
      hasFetchedInitialData &&
      onlineAstrologerDetails &&
      onlineAstrologerDetails.length > 0
    ) {
      return onlineAstrologerDetails;
    }

    // 2. Use API's online astrologers if available
    if (onlineAstrologerDetailsApi && onlineAstrologerDetailsApi.length > 0) {
      return onlineAstrologerDetailsApi;
    }
    return [];
  }, [
    onlineAstrologerDetails,
    onlineAstrologerDetailsApi,
    hasFetchedInitialData,
  ]);

  useEffect(() => {
    if (!hasFetchedInitialData) {
      fetchOnlineAstrologersData();
      getBannerData();
      getTopBannerData();
      fetchAllAstrologer();
      setHasFetchedInitialData(true);
    }
  }, [hasFetchedInitialData]);
  console.log(
    isFirstChatModalOpen,
    freeChatModalShown,
    freeChatUsed,
    '-----------------modal start',
  );
  return (
    <PageWithHeader rounded={true} scrollHeader>
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
      {/* HERO BANNER */}
      <View style={{flex: 1, backgroundColor: COLORS.theme.white}}>
        <View
          style={{
            position: 'relative',
            borderBottomLeftRadius: scale(16),
            borderBottomRightRadius: scale(16),
            backgroundColor: COLORS.theme.white,
          }}>
          <Image
            style={{
              position: 'absolute',
              top: verticalScale(-100),
              width: '100%',
              height: verticalScale(190),
              borderBottomLeftRadius: scale(16),
              borderBottomRightRadius: scale(16),
            }}
            source={require('../../assets/imgs/home-design-1.png')}
          />

          <Input
            containerStyle={{
              marginHorizontal: scale(20),
              // marginTop: verticalScale(20),
            }}
            inputContainerStyle={{
              borderRadius: scale(80),
              backgroundColor: COLORS.theme.white,
            }}
            leftIcon={<SearchIcon />}
            placeholder="Search for service"
          />

          <View
            style={{
              // marginTop: verticalScale(16),
              // borderBottomRightRadius: scale(16),
              // borderBottomLeftRadius: scale(16),
              overflow: 'hidden',
            }}>
            <Image
              source={{uri: topBanner?.imgUrl}}
              style={{
                width: '100%',
                height: verticalScale(200),
                // resizeMode: 'cover',
              }}
            />
          </View>
        </View>

        {/* BOOKING CARD */}
        <View
          style={{
            marginTop: verticalScale(20),
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

          <View style={{flexDirection: 'column', gap: scale(16)}}>
            <CustomButton
              style={{flex: 1, backgroundColor: COLORS.theme.secondary}}
              textStyle={{color: COLORS.theme.black}}
              title="Chat with Astrologer"
              onPress={() =>
                navigation.navigate('Astrologers', {
                  screen: 'AstrologerList',
                })
              }
            />

            <CustomButton
              style={{flex: 1, backgroundColor: COLORS.theme.white}}
              textStyle={{color: COLORS.theme.black}}
              title="Call with Astrologer"
              onPress={async () =>
                navigation.navigate('Astrologers', {
                  screen: 'AstrologerList',
                })
              }
            />
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: scale(20),
            marginVertical: verticalScale(10),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: 1,
              width: '80%',
              backgroundColor: COLORS.theme.primaryLight,
            }}></View>
        </View>

        {/* Our Astrologer  */}
        {finalAstrologerList.length > 0 && (
          <View>
            <Text
              style={[
                {
                  fontSize: scaleFont(18),
                  fontWeight: '700',
                  color: colors.primaryText,
                },
                {
                  marginBottom: verticalScale(24),
                  fontWeight: 600,
                  textAlign: 'center',
                },
              ]}>
              Live Astrologers
            </Text>

            <SlidingCard data={finalAstrologerList} />
          </View>
        )}

        {/* Banner*/}
        <View
          style={{
            paddingHorizontal: scale(20),
            marginTop: verticalScale(28),
            marginBottom: verticalScale(80),
          }}>
          {loading.banner ? (
            <View
              style={{
                height: verticalScale(120),
                overflow: 'hidden',
                borderRadius: scale(24),
              }}>
              <Skeleton
                width={width}
                height={verticalScale(120)}
                borderRadius={8}
              />
            </View>
          ) : (
            banner.length > 0 && (
              <View style={{}}>
                <Carousel
                  // ref={ref}
                  height={verticalScale(120)}
                  width={width}
                  data={banner}
                  // onProgressChange={progress}
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

          <View style={{marginTop: verticalScale(28), gap: verticalScale(16)}}>
            {[0, 4, 8].map(start => (
              <View
                key={start}
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                {categories.slice(start, start + 4).map((item, idx) => (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Astrologers', {
                        screen: 'AstrologerList',
                      })
                    }
                    key={idx}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}>
                    <View
                      style={{
                        height: scale(60),
                        width: scale(60),
                        borderRadius: scale(30),
                        backgroundColor: COLORS.theme.secondary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        borderWidth: 2,
                        borderColor: COLORS.theme.primary,
                      }}>
                      {/* <Text style={{fontSize: scaleFont(24)}}>{item.icon}</Text> */}
                      <Image
                        source={item.img}
                        style={{
                          position: 'absolute',
                          height: '100%',
                          width: '100%',
                        }}
                      />
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
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </PageWithHeader>
  );
};

export default HomeNew;
