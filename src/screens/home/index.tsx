import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Button,
} from 'react-native';
import React from 'react';
import Input from '../../componentsV1/common/input';
import MenuIcon from '../../assets/icons/menu-icon';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import SearchIcon from '../../assets/icons/search-icon';
import CustomButton from '../../componentsV1/common/custom-button';
import {ScrollView} from 'react-native-gesture-handler';

const HomeNew = () => {
  const [scrolled, setScrolled] = React.useState(false);
  return (
    <View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 9999,
          height: verticalScale(80),
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: scale(20),
          justifyContent: 'space-between',
          backgroundColor: scrolled ? COLORS.theme.primary : 'transparent',
          borderBottomEndRadius: scale(16),
          borderBottomLeftRadius: scale(16),
        }}>
        <TouchableOpacity>
          <MenuIcon color={COLORS.theme.white} />
        </TouchableOpacity>
        <Pressable>
          <View
            style={{
              height: scale(60),
              width: scale(60),
              borderRadius: scale(30),
              backgroundColor: COLORS.theme.white,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: COLORS.theme.secondary,
            }}>
            <Text>SK</Text>
          </View>
        </Pressable>
      </View>
      <ScrollView
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;
          setScrolled(y > 10);
        }}
        scrollEventThrottle={16}>
        <View style={{paddingTop: verticalScale(80)}}>
          <View style={{position: 'relative'}}>
            <Image
              style={{
                position: 'absolute',
                top: verticalScale(-80),
                left: 0,
                right: 0,
                borderBottomRightRadius: scale(16),
                borderBottomLeftRadius: scale(16),
                width: '100%',
              }}
              source={require('../../assets/imgs/home-design-1.png')}
            />
            <Input
              containerStyle={{
                marginHorizontal: scale(20),
                marginTop: verticalScale(20),
              }}
              inputContainerStyle={{borderRadius: scale(80)}}
              leftIcon={<SearchIcon />}
              placeholder="Search for service"
            />

            <Image
              style={{marginTop: verticalScale(16)}}
              source={require('../../assets/imgs/home-demo-img.png')}
            />
          </View>

          {/* // Booking card  */}

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
            <View
              style={{
                flexDirection: 'row',
                gap: scale(16),
              }}>
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
          <View
            style={{
              paddingHorizontal: scale(20),
              marginTop: verticalScale(28),
            }}>
            <Image
              style={{}}
              source={require('../../assets/imgs/banner1.png')}
            />
            <View
              style={{
                marginTop: verticalScale(28),
                gap: verticalScale(16),
                marginBottom: verticalScale(20),
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
                <View
                  style={{
                    height: scale(60),
                    width: scale(60),
                    backgroundColor: COLORS.theme.secondary,
                    borderRadius: scale(30),
                  }}></View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeNew;
