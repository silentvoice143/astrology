import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Switch,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import EditIcon from '../assets/icons/edit-icon';
import HomeIcon from '../assets/icons/home-icon';
import ChatIcon from '../assets/icons/chat-icon';
import VideoCallIcon from '../assets/icons/video-call-icon';
import CallIcon from '../assets/icons/call-icon';
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

const genderTags = [
  {id: 'MALE', label: 'Male'},
  {id: 'FEMALE', label: 'Female'},
  {id: 'OTHER', label: 'Other'},
];

const ProfilePage = () => {
  const role = useUserRole();
  const isAstrologer = role === 'ASTROLOGER';
  const {user, astrologer_detail} = useAppSelector(state => state.auth);
  const navigation = useNavigation<any>();

  const profileImage =
    user?.gender === 'MALE' || !user?.gender
      ? require('../assets/imgs/male.jpg')
      : require('../assets/imgs/female.jpg');

  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.background}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={{}}>
            {user.imgUri ? (
              <Image source={{uri: user.imgUri}} style={styles.profileImage} />
            ) : (
              <Image source={profileImage} style={styles.profileImage} />
            )}
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: verticalScale(20),
              right: scale(20),
              padding: moderateScale(10),
            }}
            onPress={() => {
              navigation.navigate('ProfileEdit');
            }}>
            <EditIcon size={16} color="black" />
          </TouchableOpacity>
          <View style={{justifyContent: 'center'}}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.phone}>{`+91 ${user?.mobile}`}</Text>
          </View>
        </View>
        {isAstrologer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About Me</Text>
            </View>
            <View style={styles.aboutBox}>
              <Text style={styles.aboutText}>
                {astrologer_detail?.about ?? '___'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Text style={styles.detailText}>Name: {user?.name}</Text>
          <Text style={styles.detailText}>
            Expertise: {astrologer_detail?.expertise}
          </Text>
          <Text style={styles.detailText}>
            Experience: {astrologer_detail?.experienceYears} Years
          </Text>
          <Text style={styles.detailText}>
            Languages: {astrologer_detail?.languages}
          </Text>

          {!isAstrologer && (
            <Text style={styles.detailText}>
              DOB: {user?.birthPlace ?? '__'}
            </Text>
          )}
        </View>
        {/* Address */}
        {!isAstrologer && (
          <View style={styles.section}>
            <View style={styles.cardBox}>
              <Text style={styles.cardTitle}>
                <HomeIcon size={14} color="red" /> Address
              </Text>
              <Text style={styles.cardText}>{user?.birthPlace ?? '__'}</Text>
            </View>
          </View>
        )}
        {/* Services */}
        {isAstrologer && (
          <View style={styles.section}>
            <View style={styles.cardBox}>
              <Text style={styles.cardTitle}>Services</Text>

              <View style={styles.serviceItem}>
                <View style={styles.serviceType}>
                  <ChatIcon size={14} />

                  <Text style={styles.serviceText}>Chat</Text>
                </View>
                <Text style={styles.servicePrice}>
                  {astrologer_detail?.pricePerMinuteChat} ₹/min
                </Text>
              </View>
              <View style={styles.serviceItem}>
                <View style={styles.serviceType}>
                  <CallIcon size={14} />

                  <Text style={styles.serviceText}>Audio Call</Text>
                </View>
                <Text style={styles.servicePrice}>
                  {astrologer_detail?.pricePerMinuteVoice} ₹/min
                </Text>
              </View>
              <View style={styles.serviceItem}>
                <View style={styles.serviceType}>
                  <VideoCallIcon size={14} />
                  <Text style={styles.serviceText}>Video Call</Text>
                </View>
                <Text style={styles.servicePrice}>
                  {astrologer_detail?.pricePerMinuteVideo} ₹/min
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(16),
    marginRight: scale(16),
    borderWidth: 1,
    borderColor: themeColors.border.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    gap: scale(20),
    backgroundColor: themeColors.surface.background,
    paddingVertical: 16,
  },
  profileImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: themeColors.border.primary,
  },
  name: {
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  phone: {
    fontSize: scaleFont(14),
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statusLabel: {
    fontWeight: '600',
    color: '#000',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  aboutBox: {
    backgroundColor: themeColors.surface.secondarySurface,
    padding: 12,
    borderRadius: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  detailText: {
    fontSize: 14,
    color: themeColors.text.secondary,
    marginVertical: 2,
  },
  cardBox: {
    borderWidth: 1,
    borderColor: themeColors.border.primary,
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    fontWeight: '700',
    color: themeColors.status.error.base,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: themeColors.text.subdued,
    fontSize: 14,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: themeColors.status.error.light,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  serviceType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 4,
  },
  servicePrice: {
    backgroundColor: themeColors.status.error.base,
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
  },
});

export default ProfilePage;
