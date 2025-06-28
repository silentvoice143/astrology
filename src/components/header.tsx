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

  // useEffect(() => {
  //   Animated.timing(animatedBg, {
  //     toValue: headerBackgroundColor === 'transparent' ? 0 : 1,
  //     duration: 200,
  //     useNativeDriver: false,
  //   }).start();
  // }, [headerBackgroundColor]);

  // const backgroundColor = animatedBg.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ['#FFFFFF', colors.secondary_surface],
  // });

  return (
    <LinearGradient
      colors={[
        colors.primary_surface,
        route.name === 'Kundli'
          ? colors.primary_surface
          : colors.secondary_surface_2,
      ]}
      style={{borderBottomWidth: 1, borderColor: colors.backgroundLight}}>
      <Animated.View style={[styles.container]}>
        {/* Background Image */}
        <Image
          source={require('../assets/imgs/bg-img.png')}
          style={[styles.bgImage]}
          resizeMode="contain"
        />
        {/* Left: Menu Button */}
        <View>
          <TouchableOpacity
            style={{
              height: moderateScale(40),
              width: moderateScale(40),
              // backgroundColor: 'white',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              {
                showMenuIcon ? navigation.goBack() : onMenuClick();
              }
              console.log('opening sidebar');
            }}>
            {showMenuIcon ? <BackIcon /> : <MenuIcon />}
          </TouchableOpacity>
        </View>
        {/* Center: Route Title (if not Home) */}
        <View style={{zIndex: 10, marginTop: moderateScale(8)}}>
          {showRouteTitle && <Text style={styles.title}>{headerText}</Text>}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

export default Header;

const styles = StyleSheet.create({
  title: {
    ...textStyle.fs_mont_16_400,
    color: colors.primaryText ?? '#000',
    flex: 1,
    textAlign: 'center',
  },

  container: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    // backgroundColor: colors.secondary_surface,
    gap: scale(8),
    alignItems: 'center',
    flexDirection: 'row',
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
