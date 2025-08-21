import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Text,
  Easing,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {logout, setBalance} from '../store/reducer/auth';
import WalletIcon from '../assets/icons/walletIcon';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import {useNavigation} from '@react-navigation/native';
import {clearSession} from '../store/reducer/session';
import HomeIcon from '../assets/icons/home-icon';
import AstrologerIcon from '../assets/icons/astrologer-icon';
import ChatIcon from '../assets/icons/chat-icon';
import AboutIcon from '../assets/icons/about-icon';
import HelpIcon from '../assets/icons/customer-support-icon';
import SettingIcon from '../assets/icons/setting-icon';
import KundliBookIcon from '../assets/icons/kundli-book-icon';
import LogoutIcon from '../assets/icons/logout-icon';
import PeopleIcon from '../assets/icons/people-icon';
import {useUserRole} from '../hooks/use-role';
import HoroscopeIcon from '../assets/icons/horoscope-icon';
import {useWebSocket} from '../hooks/use-socket-new';
import {useTranslation} from 'react-i18next';
import {getTransactionHistory} from '../store/reducer/payment';
import Toast from 'react-native-toast-message';

const SCREEN_WIDTH = Dimensions.get('window').width;

export type SidebarRef = {
  open: () => void;
  close: () => void;
};

const navItems = [
  {
    title: 'Home',
    href: 'Home',
    icon: <HomeIcon size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'Horoscope',
    href: 'Horoscope',
    icon: <HoroscopeIcon strokeWidth={2} size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'Kundli',
    href: 'KundliForm',
    icon: <KundliBookIcon strokeWidth={2} size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'Astrologers',
    href: 'Astrologers',
    icon: <AstrologerIcon size={20} />,
    allowed: ['USER'],
  },
  {
    title: 'Requests',
    href: 'session-requests',
    icon: <PeopleIcon size={20} />,
    allowed: ['ASTROLOGER'],
  },
  {
    title: 'Chat History',
    href: 'ChatHistory',
    params: {type: 'user'},
    icon: <ChatIcon size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'Wallet',
    href: 'Wallet',
    params: {type: 'user'},
    icon: <WalletIcon size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'Customer Support',
    href: 'customer-support',
    icon: <HelpIcon size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },

  {
    title: 'Setting',
    href: 'Setting',
    icon: <SettingIcon size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'About',
    href: 'about',
    icon: <AboutIcon size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
  {
    title: 'Logout',
    href: '',
    icon: <LogoutIcon color={themeColors.status.error.base} size={20} />,
    allowed: ['USER', 'ASTROLOGER'],
  },
];

const Sidebar = forwardRef<SidebarRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(state => state.auth);
  const {disconnect} = useWebSocket(user.id);
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const profileImage =
    user?.gender === 'MALE' || !user?.gender
      ? require('../assets/imgs/male.jpg')
      : require('../assets/imgs/female.jpg');

  const open = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0.5,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => setVisible(false));
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await dispatch(logout());
      dispatch(clearSession());
      disconnect();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (href: string) => {
    close();
    navigation.navigate(href);
  };

  const filteredNavitem = navItems.filter(item => item.allowed?.includes(role));

  const getTransactionDetails = async () => {
    try {
      setLoading(true);
      const payload = await dispatch(
        getTransactionHistory({userId: user, query: `?page=1`}),
      ).unwrap();

      if (payload.success) {
        dispatch(setBalance({balance: payload?.wallet?.balance ?? 0}));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to get transactions',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to get transactions',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getTransactionDetails();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.overlay, {opacity: overlayAnim}]}>
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[styles.sidebar, {transform: [{translateX: sidebarAnim}]}]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* User Info */}
          <View style={styles.userSection}>
            <TouchableOpacity
              onPress={() => {
                close();
                navigation.navigate('Profile');
              }}>
              {user.imgUri ? (
                <Image source={{uri: user.imgUri}} style={styles.avatar} />
              ) : (
                <Image source={profileImage} style={styles.avatar} />
              )}
            </TouchableOpacity>

            <View style={styles.userInfoTextAndWalletContainer}>
              <View style={styles.usernameWrapper}>
                <Text
                  style={styles.username}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {user?.name ?? 'N/A'}
                </Text>
              </View>
              <View style={styles.walletContainer}>
                <WalletIcon />
                {loading ? (
                  <ActivityIndicator size={12} />
                ) : (
                  <Text style={styles.walletText}>
                    ₹ {user?.walletBalance.toFixed(2) ?? 0}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.navSection}>
            {filteredNavitem.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => {
                  if (item.title === 'Logout') {
                    handleLogout();
                  } else {
                    handleNavigation(item?.href);
                  }
                }}>
                <View>{item?.icon}</View>
                <Text style={styles.navText}>{t(item.title)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
});

export default Sidebar;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#fff',
    zIndex: 11,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  userSection: {
    backgroundColor: themeColors.surface.primarySurface,
    flexDirection: 'row', // Align avatar and user info horizontally
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(16),
    marginRight: scale(16),
  },
  // New style for the container holding username and wallet
  userInfoTextAndWalletContainer: {
    flex: 1, // Allows this container to take remaining space
    justifyContent: 'center',
  },
  // New style for username wrapper to handle truncation
  usernameWrapper: {
    flexShrink: 1, // Allows the username text to shrink and truncate
    marginBottom: 4, // Space between username and wallet
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.text.light,
    // numberOfLines and ellipsizeMode are applied directly in JSX
  },
  walletContainer: {
    backgroundColor: colors.primary_surface,
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    alignSelf: 'flex-start', // Ensures it doesn't stretch beyond its content
  },
  walletText: {
    ...textStyle.fs_abyss_16_400,
    color: colors.secondaryText,
  },
  navSection: {
    marginTop: verticalScale(10),
    paddingHorizontal: scale(20),
  },
  navItem: {
    flexDirection: 'row',
    gap: scale(12),
    paddingVertical: 14,
    borderBottomColor: colors.secondary_surface_2,
    borderBottomWidth: 1,
  },
  navText: {
    ...textStyle.fs_abyss_16_400,
    color: '#333',
  },
  logoutWrapper: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
  },
});
