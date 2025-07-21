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
import {colors, themeColors} from '../constants/colors';
import {useUserRole} from '../hooks/use-role';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {textStyle} from '../constants/text-style';
import CustomDateTimePicker from '../components/custom-date-time-picker';
import ControlledTagSelector from '../components/controlled-tag-selector';
import LocationAutoComplete from '../components/location-input-modal-based';
import CustomInputV2 from '../components/custom-input-v2';
import {useNavigation} from '@react-navigation/native';
import {UserPersonalDetail} from '../utils/types';
import CustomButton from '../components/custom-button';
import CloseIcon from '../assets/icons/close-icon';
import {formatTimeToDateString} from '../utils/utils';
import {launchImageLibrary} from 'react-native-image-picker';
import {postUserDetail, uploadProfileImage} from '../store/reducer/user';
import {setUser} from '../store/reducer/auth';
import Toast from 'react-native-toast-message';
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
