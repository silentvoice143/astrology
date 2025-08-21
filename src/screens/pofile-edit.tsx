import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import EditIcon from '../assets/icons/edit-icon';
import ScreenLayout from '../components/screen-layout';
import {moderateScale, scale, scaleFont, verticalScale} from '../utils/sizer';
import {themeColors} from '../constants/colors';
import {useUserRole} from '../hooks/use-role';

import AstrologerProfileEdit from '../components/Profile/edit-astrologer';
import UserProfileEdit from '../components/Profile/edit-user';

const ProfileEdit = () => {
  const role = useUserRole();

  return role === 'ASTROLOGER' ? (
    <AstrologerProfileEdit />
  ) : (
    <UserProfileEdit />
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  avatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(16),
    marginRight: scale(16),
    borderWidth: 1,
    borderColor: themeColors.border.primary,
  },
});
