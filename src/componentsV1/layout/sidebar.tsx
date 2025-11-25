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

import {COLORS} from '../../constants/colors';
import HomeIcon from '../../assets/icons/home-icon';
import HoroscopeIcon from '../../assets/icons/horoscope-icon';
import KundliBookIcon from '../../assets/icons/kundli-book-icon';
import AstrologerIcon from '../../assets/icons/astrologer-icon';
import ChatIcon from '../../assets/icons/chat-icon';
import WalletIcon from '../../assets/icons/walletIcon';
import HelpIcon from '../../assets/icons/customer-support-icon';
import AboutIcon from '../../assets/icons/about-icon';
import SettingIcon from '../../assets/icons/setting-icon';
import LogoutIcon from '../../assets/icons/logout-icon';

import {useNavigation} from '@react-navigation/native';
import {scale} from '../../utils/sizer';

const SCREEN_WIDTH = Dimensions.get('window').width;

export type SidebarRef = {
  open: () => void;
  close: () => void;
};

const Sidebar = forwardRef<SidebarRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<any>();

  const navItems = [
    {title: 'Home', href: 'Home', icon: <HomeIcon size={20} />},
    {title: 'Horoscope', href: 'Horoscope', icon: <HoroscopeIcon size={20} />},
    {title: 'Kundli', href: 'KundliForm', icon: <KundliBookIcon size={20} />},
    {
      title: 'Astrologers',
      href: 'Astrologers',
      icon: <AstrologerIcon size={20} />,
    },
    {title: 'Chat History', href: 'ChatHistory', icon: <ChatIcon size={20} />},
    {title: 'Wallet', href: 'Wallet', icon: <WalletIcon size={20} />},
    {
      title: 'Customer Support',
      href: 'customer-support',
      icon: <HelpIcon size={20} />,
    },
    {title: 'Setting', href: 'Setting', icon: <SettingIcon size={20} />},
    {title: 'About', href: 'about', icon: <AboutIcon size={20} />},
    {title: 'Logout', href: '', icon: <LogoutIcon size={20} color="red" />},
  ];

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
        useNativeDriver: false,
      }),
    ]).start(() => setVisible(false));
  };

  const handleNavigation = (href: string) => {
    close();
    if (href) navigation.navigate(href);
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.overlay, {opacity: overlayAnim}]}>
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[styles.sidebar, {transform: [{translateX: sidebarAnim}]}]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* User Info */}
          <View style={styles.userSection}>
            <Image
              source={require('../../assets/imgs/profile-demo.jpg')}
              style={styles.avatar}
            />
            <View style={{flex: 1}}>
              <Text style={styles.username}>Astro Priya</Text>
              <Text style={styles.balanceText}>Balance: ₹ 1200.00</Text>
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navSection}>
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => handleNavigation(item.href)}>
                {item.icon}
                <Text style={styles.navText}>{item.title}</Text>
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
    zIndex: 9999,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: '#fff',
    zIndex: 99999,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  userSection: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(40),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.theme.secondary,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    marginRight: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.theme.white,
  },
  balanceText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.theme.gray.text,
  },
  navSection: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  navItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.theme.primary,
  },
  navText: {
    fontSize: 16,
    color: COLORS.theme.gray.text,
  },
});
