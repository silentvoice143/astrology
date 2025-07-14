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
import {colors, themeColors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import BackIcon from '../assets/icons/back-icon';
import LinearGradient from 'react-native-linear-gradient';
import NotificationIcon from '../assets/icons/notification-icon';
import ChevronLeftIcon from '../assets/icons/chevron-left';

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
  const currentHeader = headerTitle.find(item => item.href === route.name);
  const showRouteTitle = route.name !== 'Home';

  const showMenuIcon =
    route.name !== 'Home' &&
    route.name !== 'Astrologers' &&
    route.name !== 'ChatHistory' &&
    route.name !== 'Remedies' &&
    route.name !== 'KundliForm';
  const headerText = currentHeader?.title || route.name;
  const navigation = useNavigation<any>();

  const getName = (name: string) => {
    switch (name) {
      case 'KundliForm':
        return 'Kundli Form';
      case 'about':
        return 'About Us';
      case 'remedies':
        return 'Remedies';
      case 'TermsAndConditions':
        return 'Terms & Conditions';
      case 'customer-support':
        return 'Customer Support';
      default:
        return name;
    }
  };

  const exceptionArray = [
    'Kundli',
    'KundliForm',
    'Wallet',
    'remedies',
    'ChatHistory',
    'Profile',
    'Horoscope',
  ];

  const headerWhite = exceptionArray.includes(route.name);

  if (headerBackgroundColor) {
    // ✅ If headerbgcolor prop exists, use plain View
    return (
      <View
        style={{
          backgroundColor: headerBackgroundColor,
          borderBottomWidth: 1,
          borderColor: themeColors.surface.border,
        }}>
        <View style={[styles.container]}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: 10,
              height: moderateScale(40),
              width: moderateScale(40),
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: scale(8),
            }}
            onPress={() => {
              showMenuIcon ? navigation.goBack() : onMenuClick();
              console.log('opening sidebar');
            }}>
            {showMenuIcon ? (
              <ChevronLeftIcon size={32} color={themeColors.text.primary} />
            ) : (
              <MenuIcon color={themeColors.text.primary} />
            )}
          </TouchableOpacity>
          <View style={{flexDirection: 'row'}}>
            <View style={{marginTop: moderateScale(8)}}>
              {showRouteTitle && (
                <Text style={styles.title}>{getName(headerText)}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[
        colors.primary_surface,
        headerWhite ? colors.primary_surface : colors.secondary_surface,
      ]}
      style={{
        borderBottomWidth: !headerWhite ? 0 : 1,
        borderColor: themeColors.surface.border,
      }}>
      <View style={[styles.container]}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 10,
            height: moderateScale(40),
            width: moderateScale(40),
            // backgroundColor: 'red',
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
            <ChevronLeftIcon size={32} color={themeColors.text.primary} />
          ) : (
            <MenuIcon color={themeColors.text.primary} />
          )}
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          {/* <Text>hello</Text> */}

          <View style={{marginTop: moderateScale(8)}}>
            {showRouteTitle && (
              <Text style={styles.title}>{getName(headerText)}</Text>
            )}
          </View>
        </View>

        {/* <TouchableOpacity style={{padding: scale(4)}}>
          <View
            style={{
              zIndex: 999,
              position: 'absolute',
              right: scale(4),
              borderRadius: scale(6),
              top: verticalScale(4),
              height: moderateScale(8),
              width: moderateScale(8),
              backgroundColor: colors.success.base,
            }}></View>
          <NotificationIcon size={20} />
        </TouchableOpacity> */}
      </View>
    </LinearGradient>
  );
};

export default Header;

const styles = StyleSheet.create({
  title: {
    ...textStyle.fs_mont_16_700,
    color: colors.primaryText ?? '#000',
    textAlign: 'center',
  },

  container: {
    paddingHorizontal: scale(10),
    height: verticalScale(80),
    // backgroundColor: colors.secondary_surface,
    gap: scale(8),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    backgroundColor: themeColors.surface.background,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
