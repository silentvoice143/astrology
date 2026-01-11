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
import {useAppDispatch} from '../../hooks/redux-hook';
import {getBanner} from '../../store/reducer/general';
import Carousel from 'react-native-reanimated-carousel';
import Skeleton from '../../components/skeleton';
import notifee, {AndroidImportance} from '@notifee/react-native';

const width = Dimensions.get('window').width - 40;

const HomeNew = () => {
  const [banner, setBanner] = useState<{imgUrl: string; id: string}[]>([]);
  const [loading, setLoading] = useState<{banner: boolean}>({banner: false});
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    getBannerData();
  }, []);

  return (
    <PageWithHeader rounded={true} scrollHeader>
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
              top: verticalScale(-110),
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

          <View
            style={{
              marginTop: verticalScale(16),
              borderBottomRightRadius: scale(16),
              borderBottomLeftRadius: scale(16),
              overflow: 'hidden',
            }}>
            <Image
              source={require('../../assets/imgs/banner-home.jpeg')}
              style={{
                width: '100%',
                height: verticalScale(200),
                resizeMode: 'cover',
              }}
            />
          </View>
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
            {/* <CustomButton
              style={{flex: 1, backgroundColor: COLORS.theme.secondary}}
              textStyle={{color: COLORS.theme.black}}
              title="Test"
              onPress={() => showTestNotification()}
            /> */}
            <CustomButton
              style={{flex: 1, backgroundColor: COLORS.theme.secondary}}
              textStyle={{color: COLORS.theme.black}}
              title="Online"
              onPress={() =>
                navigation.navigate('Booking', {
                  screen: 'BookAppointment',
                  params: {category: '', mode: 'ONLINE'},
                })
              }
            />

            <CustomButton
              style={{flex: 1, backgroundColor: COLORS.theme.white}}
              textStyle={{color: COLORS.theme.black}}
              title="Offline"
              onPress={
                async () =>
                  navigation.navigate('Booking', {
                    screen: 'BookAppointment',
                    params: {category: '', mode: 'OFFLINE'},
                  })
                // await notifee.displayNotification({
                //   title: 'New Message',
                //   body: 'This is a test message',
                //   android: {
                //     channelId: 'high_importance_channel', // make sure channel exists
                //     smallIcon: 'ic_launcher',
                //     sound: 'notification_sound', // file in res/raw without extension
                //   },
                // })
              }
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
                    // <Image
                    //   style={{
                    //     width: '100%',
                    //     height: verticalScale(120),
                    //     borderRadius: scale(16),
                    //   }}
                    //   source={require('../../assets/imgs/banner1.png')}
                    // />
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
                      navigation.navigate('Booking', {
                        screen: 'BookAppointment',
                        params: {category: item.title, mode: 'ONLINE'},
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
