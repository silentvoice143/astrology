import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Platform} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors, themeColors} from '../constants/colors';
import HomeIcon from '../assets/icons/home-icon';
import AstrologerIcon from '../assets/icons/astrologer-icon';
import HistoryIcon from '../assets/icons/history-icon';
import KundliIcon from '../assets/icons/kundli-icon-2';
import PeopleIcon from '../assets/icons/people-icon';
import StoreIcon from '../assets/icons/store-icon';
import {useUserRole} from '../hooks/use-role';
import {useAppSelector} from '../hooks/redux-hook';
import {RootState} from '../store';

const BottomNavigationBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const role = useUserRole();
  const {queueRequestCount} = useAppSelector(
    (state: RootState) => state.session,
  );

  const navItems = [
    {label: 'Home', route: 'Home', icon: HomeIcon},
    {label: 'Kundli', route: 'KundliForm', icon: KundliIcon},
    role === 'USER'
      ? {
          label: 'Astrologers',
          route: 'Astrologers',
          icon: AstrologerIcon,
        }
      : {
          label: 'Requests',
          route: 'session-request',
          icon: PeopleIcon,
          showBadge: true,
        },
    {label: 'History', route: 'ChatHistory', icon: HistoryIcon},
    {label: 'Remedies', route: 'Remedies', icon: StoreIcon},
  ];

  return (
    <View style={styles.container}>
      {navItems.map(item => {
        const isActive = route.name === item?.route;
        const IconComponent = item?.icon;

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={styles.tabItem}>
            <View style={styles.iconWrapper}>
              {IconComponent && (
                <IconComponent
                  size={20}
                  strokeWidth={2}
                  color={isActive ? colors.primaryText : '#999'}
                />
              )}
              {/* Badge */}

              {item?.showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {queueRequestCount > 99 ? '99+' : queueRequestCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigationBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface.background,
    paddingVertical: 10,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  tabItem: {
    alignItems: 'center',
    padding: 6,
  },
  iconWrapper: {
    position: 'relative',
  },
  label: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  activeText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: Platform.OS === 'ios' ? 1 : 0,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
