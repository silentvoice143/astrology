import React, {useRef, useState, useImperativeHandle, forwardRef} from 'react';
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
} from 'react-native';
import CustomButton from './custom-button';
import {useAppDispatch} from '../hooks/redux-hook';
import {logout} from '../store/reducer/auth';
import WalletIcon from '../assets/icons/walletIcon';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import {useNavigation} from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export type SidebarRef = {
  open: () => void;
  close: () => void;
};

const navItems = [
  {title: 'Home', href: 'Home'},
  // {title: 'Daily Horoscope', href: 'DailyHoroscope'},
  {title: 'Kundli', href: 'Kundli'},
  {title: 'Astrologers', href: 'Astrologers'},
  {title: 'Chat History', href: 'ChatHistory', params: {type: 'user'}},
  // {title: 'Ask a Question', href: 'AskQuestion'},
  // {title: 'Reports', href: 'Reports'},
  {title: 'Settings', href: 'Settings'},
  // {title: 'Help & Support', href: 'Support'},
];

const Sidebar = forwardRef<SidebarRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

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
    try {
      await dispatch(logout());
    } catch (err) {
      console.log(err);
    }
  };

  if (!visible) return null;

  const handleNavigation = (href: string) => {
    close();
    navigation.navigate(href);
  };

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
            <Image
              source={{uri: 'https://i.pravatar.cc/300?img=5'}}
              style={styles.avatar}
            />
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text style={styles.username}>John Doe</Text>
              <View style={styles.walletContainer}>
                <WalletIcon />
                <Text style={styles.walletText}>₹500</Text>
              </View>
            </View>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.navSection}>
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => {
                  handleNavigation(item?.href);
                }}>
                <Text style={styles.navText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <View style={styles.logoutWrapper}>
            <CustomButton
              title="Logout"
              onPress={handleLogout}
              style={styles.logoutButton}
              textStyle={{}}
            />
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
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  userSection: {
    backgroundColor: colors.secondary_surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: scale(16),
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  walletContainer: {
    backgroundColor: colors.primary_surface,
    width: scale(100),
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
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
    paddingVertical: 14,
    borderBottomColor: '#eee',
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
  logoutButton: {
    backgroundColor: colors.secondarybtn, // Replace with your primary color
    borderRadius: 8,
    paddingVertical: 14,
  },
});
