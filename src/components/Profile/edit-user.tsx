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
import EditIcon from '../../assets/icons/edit-icon';
import ScreenLayout from '../../components/screen-layout';
import {scale, verticalScale} from '../../utils/sizer';
import {themeColors} from '../../constants/colors';
import {useUserRole} from '../../hooks/use-role';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {textStyle} from '../../constants/text-style';
import CustomDateTimePicker from '../../components/custom-date-time-picker';
import ControlledTagSelector from '../../components/controlled-tag-selector';
import LocationAutoComplete from '../../components/location-input-modal-based';
import CustomInputV2 from '../../components/custom-input-v2';
import {useNavigation} from '@react-navigation/native';
import {UserPersonalDetail} from '../../utils/types';
import CustomButton from '../../components/custom-button';
import {formatTimeToDateString} from '../../utils/utils';
import {launchImageLibrary} from 'react-native-image-picker';
import {postUserDetail, uploadProfileImage} from '../../store/reducer/user';
import {setUser} from '../../store/reducer/auth';
import Toast from 'react-native-toast-message';

const genderTags = [
  {id: 'MALE', label: 'Male'},
  {id: 'FEMALE', label: 'Female'},
  {id: 'OTHER', label: 'Other'},
];

const UserProfileEdit = () => {
  const role = useUserRole();
  const {user} = useAppSelector(state => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [date, setDate] = useState(new Date(user.birthDate));
  const [time, setTime] = useState(
    user.birthTime
      ? new Date(formatTimeToDateString(user.birthTime))
      : new Date(),
  );
  const now = new Date();
  const [personalDetail, setPersonalDetail] = useState<UserPersonalDetail>({
    name: user?.name,
    gender: user?.gender,
    birthDate: user?.birthDate,
    birthTime: user?.birthTime ?? now.toTimeString().split(' ')[0],
    birthPlace: 'heaven',
    latitude: 34,
    longitude: 45,
  });

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [profileImageUri, setProfileImageUri] = useState(user.imgUri ?? '');

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      async response => {
        if (response.didCancel) {
        } else if (response.errorCode) {
        } else if (response.assets && response.assets.length > 0) {
          const pickedImage = response.assets[0];
          const imageUri = pickedImage.uri || '';
          setProfileImageUri(imageUri);

          // ✅ Upload the image right after picking it
          await handleCaptureImage(imageUri);
        }
      },
    );
  };

  const handleChange = ({key, value}: {key: string; value: any}) => {
    setPersonalDetail(prev => ({...prev, [key]: value}));
  };

  const handleSubmit = () => {
    const validationErrors: string[] = [];

    if (!personalDetail.name.trim()) {
      validationErrors.push('Please enter your name.');
    }
    if (!personalDetail.gender) {
      validationErrors.push('Please select your gender.');
    }
    if (!personalDetail.birthPlace || personalDetail.birthPlace.trim() === '') {
      validationErrors.push('Please select your place of birth.');
    }
    if (!personalDetail.birthTime) {
      validationErrors.push('Please select your birth time.');
    }
    if (!personalDetail.birthDate || personalDetail.birthDate.trim() === '') {
      validationErrors.push('Please select your date of birth.');
    } else {
      const selectedDate = new Date(personalDetail.birthDate);
      const today = new Date();
      // Normalize both dates to midnight
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        validationErrors.push('Date of birth must be in the past.');
      }
    }
    if (
      typeof personalDetail.latitude !== 'number' ||
      typeof personalDetail.longitude !== 'number'
    ) {
      validationErrors.push('Invalid birth place coordinates.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // No errors — clear error list, dispatch, navigate
    setErrors([]);
    const formattedDetails = {
      ...personalDetail,
      gender: personalDetail.gender?.toUpperCase() || '',
    };

    handlePostUserData(formattedDetails);
  };

  const handlePostUserData = async (user: UserPersonalDetail) => {
    setIsSaving(true);
    try {
      const payload = await dispatch(postUserDetail(user)).unwrap();

      if (payload?.success) {
        dispatch(setUser(payload.user));
        navigation.navigate('Profile');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error while saving user data',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCaptureImage = async (filePath: string) => {
    if (!filePath) return;

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: 'file://' + filePath,
        name: `image-${user.id}-${new Date().toISOString()}.jpg`,
        type: 'image/jpeg',
      });

      const payload = await dispatch(uploadProfileImage(formData)).unwrap();

      if (payload?.success) {
        Toast.show({
          type: 'success',
          text1: 'Profile image changed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Upload profile image failed',
        text2: 'Please try again later.',
      });
    }
  };

  const profileImage =
    user?.gender === 'MALE' || !user?.gender
      ? require('../../assets/imgs/male.jpg')
      : require('../../assets/imgs/female.jpg');
  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.background}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(20),
          }}>
          <View style={{marginBottom: verticalScale(20)}}>
            <View style={{position: 'relative', alignItems: 'center'}}>
              <TouchableWithoutFeedback
                onPress={() => {
                  handlePickImage();
                }}>
                <View
                  style={{
                    position: 'relative',
                    height: scale(80),
                    width: scale(80),
                  }}>
                  {profileImageUri ? (
                    <Image
                      source={{uri: profileImageUri}}
                      style={styles.avatar}
                    />
                  ) : (
                    <Image source={profileImage} style={styles.avatar} />
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      zIndex: 1,
                      padding: scale(4),
                      borderRadius: scale(10),
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderColor: themeColors.border.primary,
                    }}>
                    <EditIcon size={16} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <CustomInputV2
            label="Name"
            placeholder="Enter your name"
            value={personalDetail.name}
            onChangeText={val => handleChange({key: 'name', value: val})}
          />
          <CustomDateTimePicker
            label="Date of Birth"
            value={date}
            onChange={newDate => {
              setDate(newDate);
              handleChange({
                key: 'birthDate',
                value: newDate.toISOString().split('T')[0],
              });
            }}
            mode="date"
            placeholder="Choose date"
            showError={!date}
            errorMessage="Please select a date"
          />
          <CustomDateTimePicker
            label="Select Time"
            value={time}
            mode="time"
            onChange={newTime => {
              setTime(newTime);
              handleChange({
                key: 'birthTime',
                value: newTime.toTimeString().split(' ')[0],
              });
            }}
            placeholder="Pick time"
          />

          <ControlledTagSelector
            label="Gender"
            tags={genderTags}
            selectedTags={personalDetail.gender ? [personalDetail.gender] : []}
            onChange={(selectedIds: string[]) => {
              const selectedId = selectedIds[0] || '';
              handleChange({key: 'gender', value: selectedId});
            }}
            valueType="id"
            multiSelect={false}
            contentContainerStyle={{paddingHorizontal: 0}}
          />

          <LocationAutoComplete
            label="Place of Birth"
            value={personalDetail?.birthPlace}
            onSelectLocation={location => {
              setPersonalDetail(prev => ({
                ...prev,
                birthPlace: location.name,
                latitude: Number(location.lat),
                longitude: Number(location.lon),
              }));
            }}
          />
          <View style={{gap: scale(4), marginTop: verticalScale(20)}}>
            <CustomButton
              loading={isSaving}
              title={isSaving ? 'Updating..' : 'Save'}
              onPress={() => {
                handleSubmit();
              }}
            />
          </View>
          {errors.length > 0 && (
            <View style={{marginTop: verticalScale(20)}}>
              <Text
                style={[
                  textStyle.fs_abyss_14_400,
                  {color: 'red', marginBottom: 8},
                ]}>
                Please fix the following errors:
              </Text>
              {errors.map((error, idx) => (
                <Text
                  key={idx}
                  style={[
                    textStyle.fs_abyss_14_400,
                    {color: 'red', marginBottom: 4},
                  ]}>
                  • {error}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default UserProfileEdit;

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
