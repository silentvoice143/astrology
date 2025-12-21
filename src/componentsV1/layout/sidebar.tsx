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

import AstrologerIcon from '../../assets/icons/astrologer-icon';
import ChatIcon from '../../assets/icons/chat-icon';
import WalletIcon from '../../assets/icons/walletIcon';
import HelpIcon from '../../assets/icons/customer-support-icon';
import AboutIcon from '../../assets/icons/about-icon';
import SettingIcon from '../../assets/icons/setting-icon';
import LogoutIcon from '../../assets/icons/logout-icon';

import {useNavigation, useRoute} from '@react-navigation/native';
import {scale} from '../../utils/sizer';
import {useAppSelector} from '../../hooks/redux-hook';

const SCREEN_WIDTH = Dimensions.get('window').width;

export type SidebarRef = {
  open: () => void;
  close: () => void;
};

const Sidebar = forwardRef<SidebarRef, {onLogout?: () => void}>(
  ({onLogout}, ref) => {
    const [visible, setVisible] = useState(false);
    const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<any>();
    const {user} = useAppSelector((state: any) => state.auth);

    const navItems = [
      {
        title: 'Home',
        type: 'reset',
        route: 'MainTabs',
        params: {screen: 'Home'},
        icon: <HomeIcon size={20} />,
        screen: 'Home',
      },
      // {
      //   title: 'Astrologers',
      //   type: 'navigate',
      //   route: 'Astrologers',
      //   icon: <AstrologerIcon size={20} />,
      // },
      {
        title: 'Chat & Call',
        type: 'navigate',
        route: 'Call_Chat',
        icon: <ChatIcon size={20} />,
        screen: 'Call_Chat',
      },
      {
        title: 'Wallet',
        type: 'navigate',
        route: 'Wallet',
        icon: <WalletIcon size={20} />,
        screen: 'Wallet',
      },
      {
        title: 'Customer Support',
        type: 'navigate',
        route: 'CustomerSupport',
        icon: <HelpIcon size={20} />,
        screen: 'CustomerSupport',
      },
      {
        title: 'Setting',
        type: 'navigate',
        route: 'Setting',
        icon: <SettingIcon size={20} />,
        screen: 'Setting',
      },
      {
        title: 'About',
        type: 'navigate',
        route: 'About',
        icon: <AboutIcon size={20} />,
        screen: 'About',
      },
      {
        title: 'Logout',
        type: 'logout',
        icon: <LogoutIcon size={20} color="red" />,
      },
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

    // const handleNavigation = (href: string) => {
    //   close();
    //   if (href) navigation.navigate(href);
    // };

    const getCurrentRouteName = () => {
      const state = navigation.getState();
      const route = state.routes[state.index];

      // Handle nested navigators (MainTabs)
      if (route.state) {
        return route.state.routes[route.state.index].name;
      }

      return route.name;
    };
    const route = useRoute();
    const handleNavigation = (item: any) => {
      const currentRoute = route.name;

      if (item.screen === currentRoute) {
        close();
        return;
      }
      close();

      switch (item?.type) {
        case 'navigate':
          navigation.navigate(item.route, item.params);
          break;

        case 'reset':
          navigation.reset({
            index: 0,
            routes: [
              {
                name: item.route,
                params: item.params,
              },
            ],
          });
          break;

        case 'logout':
          onLogout?.();
          break;
      }
    };

    const profileImage =
      user?.gender === 'MALE' || !user?.gender
        ? require('../../assets/imgs/male.jpg')
        : require('../../assets/imgs/female.jpg');

    if (!visible) return null;

    return (
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.overlay, {opacity: overlayAnim}]}>
          <TouchableOpacity
            style={{flex: 1}}
            activeOpacity={1}
            onPress={close}
          />
        </Animated.View>

        <Animated.View
          style={[styles.sidebar, {transform: [{translateX: sidebarAnim}]}]}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* User Info */}
            <View style={styles.userSection}>
              <TouchableOpacity onPress={() => handleNavigation('Profile')}>
                {user.imgUri ? (
                  <Image
                    source={{
                      uri:
                        user?.imgUri ||
                        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fuser%2F&psig=AOvVaw1W1xaGjiVF_9TB2i4QJoO5&ust=1765144303563000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKDr2Y75qZEDFQAAAAAdAAAAABAEhttps://via.placeholder.com/150',
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <Image source={profileImage} style={styles.avatar} />
                )}
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <Text style={styles.username}>{user.name}</Text>
                <Text style={styles.balanceText}>
                  Balance: ₹ {user?.walletBalance.toFixed(2) ?? 0}
                </Text>
              </View>
            </View>

            {/* Navigation */}
            <View style={styles.navSection}>
              {navItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.navItem}
                  onPress={() =>
                    item.title === 'Logout'
                      ? onLogout?.()
                      : handleNavigation(item)
                  }>
                  {item.icon}
                  <Text style={styles.navText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    );
  },
);

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
    backgroundColor: COLORS.theme.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.theme.primary,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    marginRight: 16,
    borderColor: COLORS.theme.primary,
    borderWidth: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.theme.primary,
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
