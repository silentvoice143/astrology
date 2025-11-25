import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import {scale, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import MenuIcon from '../../assets/icons/menu-icon';
import NotificationIcon from '../../assets/icons/notification-icon';

interface AppHeaderProps {
  scrolled?: boolean;
  initials?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  rounded?: boolean;
  themeMode?: 'light' | 'dark'; // NEW
}

const AppHeader = ({
  scrolled = true,
  initials = 'SK',
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  rounded = false,
  themeMode = 'dark', // default theme
}: AppHeaderProps) => {
  const isLight = themeMode === 'light';

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomEndRadius: rounded ? scale(16) : 0,
          borderBottomLeftRadius: rounded ? scale(16) : 0,
        },
        {
          backgroundColor: scrolled
            ? isLight
              ? COLORS.theme.white
              : COLORS.theme.primary
            : 'transparent',
        },
      ]}>
      {/* Menu Icon */}
      <TouchableOpacity onPress={onMenuPress}>
        <MenuIcon color={isLight ? '#666' : COLORS.theme.white} />
      </TouchableOpacity>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Notification */}
        <TouchableOpacity
          style={[
            styles.notification,
            {backgroundColor: isLight ? '#F2F2F2' : COLORS.theme.white},
          ]}
          onPress={onNotificationPress}>
          <View style={styles.dot} />
          <NotificationIcon size={16} color={isLight ? '#444' : undefined} />
        </TouchableOpacity>

        {/* Profile Icon */}
        <Pressable onPress={onProfilePress}>
          <View
            style={[
              styles.profileCircle,
              {
                backgroundColor: isLight
                  ? COLORS.theme.white
                  : COLORS.theme.white,
                borderColor: isLight ? '#E0E0E0' : COLORS.theme.secondary,
              },
            ]}>
            <Text style={{color: isLight ? '#333' : '#000'}}>{initials}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 9999,
    height: verticalScale(80),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },

  notification: {
    height: scale(36),
    width: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(30),
    position: 'relative',
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 5,
    backgroundColor: COLORS.status.success.base,
    position: 'absolute',
    top: verticalScale(6),
    right: scale(6),
    zIndex: 999,
  },

  profileCircle: {
    height: scale(50),
    width: scale(50),
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});
