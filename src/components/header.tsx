import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import MenuIcon from '../assets/icons/menu-icon';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import BackIcon from '../assets/icons/back-icon';
import LinearGradient from 'react-native-linear-gradient';
import NotificationIcon from '../assets/icons/notification-icon';

const headerTitle = [
  {title: 'Home', href: 'Home'},
  {title: 'Kundli', href: 'Kundli'},
  {title: 'Astrologers', href: 'Astrologers'},
  {title: 'Chat History', href: 'ChatHistory', params: {type: 'user'}},
  {title: 'Settings', href: 'Settings'},
];

const Header = ({
  headerBackgroundColor,
  onMenuClick,
}: {
  headerBackgroundColor?: string;
  onMenuClick: () => void;
}) => {
  const route = useRoute(); // <-- ✅ Get the current route
  const animatedBg = useRef(new Animated.Value(0)).current;
  const currentHeader = headerTitle.find(item => item.href === route.name);
  const showRouteTitle = route.name !== 'Home';

  const showMenuIcon =
    route.name !== 'Home' &&
    route.name !== 'Astrologers' &&
    route.name !== 'ChatHistory';
  const headerText = currentHeader?.title || route.name;
  const navigation = useNavigation<any>();

  const getName = (name: string) => {
    switch (name) {
      case 'KundliForm':
        return 'Kundli Form';
      default:
        return name;
    }
  };

  return (
    <LinearGradient
      colors={[
        colors.primary_surface,
        route.name === 'Kundli'
          ? colors.primary_surface
          : colors.secondary_surface,
      ]}
      style={{
        borderBottomWidth: !showMenuIcon ? 0 : 1,
        borderColor: colors.backgroundLight,
      }}>
      <Animated.View style={[styles.container]}>
        {/* Background Image */}
        {/* <Image
          source={require('../assets/imgs/bg-img.png')}
          style={[styles.bgImage]}
          resizeMode="contain"
        /> */}

        <View style={{flexDirection: 'row'}}>
          {/* <Text>hello</Text> */}
          <TouchableOpacity
            style={{
              height: moderateScale(40),
              width: moderateScale(40),
              backgroundColor: 'red',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: scale(8),
            }}
            onPress={() => {
              {
                showMenuIcon ? navigation.goBack() : onMenuClick();
              }
              console.log('opening sidebar');
            }}>
            {showMenuIcon ? (
              <BackIcon color={colors.whiteText} />
            ) : (
              <MenuIcon color={colors.whiteText} />
            )}
          </TouchableOpacity>

          <View style={{marginTop: moderateScale(8)}}>
            {showRouteTitle && (
              <Text style={styles.title}>{getName(headerText)}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={{padding: scale(4)}}>
          <View
            style={{
              zIndex: 999,
              position: 'absolute',
              right: scale(8),
              borderRadius: scale(6),
              top: verticalScale(8),
              height: moderateScale(10),
              width: moderateScale(10),
              backgroundColor: colors.success.base,
            }}></View>
          <NotificationIcon size={32} />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

export default Header;

const styles = StyleSheet.create({
  title: {
    ...textStyle.fs_mont_16_400,
    color: colors.primaryText ?? '#000',
    textAlign: 'center',
  },

  container: {
    paddingHorizontal: scale(20),
    height: verticalScale(80),
    // backgroundColor: colors.secondary_surface,
    gap: scale(8),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: '60%',
    width: scale(216),
    height: verticalScale(80),
    transform: [{translateX: -scale(216) / 2}],
    zIndex: 3,
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
