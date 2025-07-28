import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import EditIcon from '../../assets/icons/edit-icon';
import ScreenLayout from '../../components/screen-layout';
import {scale, verticalScale} from '../../utils/sizer';
import {themeColors} from '../../constants/colors';
import {useUserRole} from '../../hooks/use-role';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {textStyle} from '../../constants/text-style';
import CustomInputV2 from '../../components/custom-input-v2';
import {useNavigation} from '@react-navigation/native';
import {AstrologerFormPayload} from '../../utils/types';
import CustomButton from '../../components/custom-button';
import {launchImageLibrary} from 'react-native-image-picker';
import {editAstrologerUser} from '../../store/reducer/user';
import {setAstrologer, setUser} from '../../store/reducer/auth';
import Toast from 'react-native-toast-message';

const AstrologerProfileEdit = () => {
  const role = useUserRole();
  const {user, astrologer_detail} = useAppSelector(state => state.auth);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [astrologerFields, setAstrologerFields] = useState({
    name: user?.name,
    mobile: user?.mobile || '',
    expertise: astrologer_detail?.expertise || '',
    about: astrologer_detail?.about || '',
    experienceYears: astrologer_detail?.experienceYears || 0,
    languages: astrologer_detail?.languages || '',
    pricePerMinuteChat: astrologer_detail?.pricePerMinuteChat || 0.0,
    pricePerMinuteVoice: astrologer_detail?.pricePerMinuteVoice || 0.0,
    pricePerMinuteVideo: astrologer_detail?.pricePerMinuteVideo || 0.0,
  });
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const [profileImageUri, setProfileImageUri] = useState(user.imgUri ?? '');
  const [imageFileToUpload, setImageFileToUpload] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
        } else if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: `Failed to pick image. Please try again.'`,
            position: 'bottom',
            visibilityTime: 2000,
          });
        } else if (response.assets && response.assets.length > 0) {
          const pickedImage = response.assets[0];
          const imageUri = pickedImage.uri || '';

          setProfileImageUri(imageUri);

          // Prepare imageFile to send in formData later
          const file = {
            uri: imageUri,
            name: pickedImage.fileName || `image-${user.id}.jpg`,
            type: pickedImage.type || 'image/jpeg',
          };
          setImageFileToUpload(file);
        }
      },
    );
  };

  const validateFields = () => {
    const newErrors: string[] = [];

    if (!astrologerFields.name?.trim()) newErrors.push('Name is required');
    if (!astrologerFields.mobile?.trim()) newErrors.push('Mobile is required');
    if (!astrologerFields.expertise?.trim())
      newErrors.push('Expertise is required');
    if (!astrologerFields.about?.trim()) newErrors.push('About is required');

    if (astrologerFields.experienceYears <= 0)
      newErrors.push('Experience must be greater than 0');

    if (!astrologerFields.languages?.trim())
      newErrors.push('Languages are required');

    if (astrologerFields.pricePerMinuteChat <= 0)
      newErrors.push('Chat price must be greater than 0');

    if (astrologerFields.pricePerMinuteVoice <= 0)
      newErrors.push('Voice price must be greater than 0');

    if (astrologerFields.pricePerMinuteVideo <= 0)
      newErrors.push('Video price must be greater than 0');

    return newErrors;
  };
  const handleFormSubmit = async () => {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      Toast.show({
        type: 'error',
        text1: 'Please correct the form',
        text2: validationErrors[0], // Show first error
      });
      return;
    }
    const astrologerData: AstrologerFormPayload = {
      name: astrologerFields.name,
      mobile: astrologerFields.mobile,
      expertise: astrologerFields.expertise,
      languages: astrologerFields.languages,
      experienceYears: astrologerFields.experienceYears,
      pricePerMinuteChat: astrologerFields.pricePerMinuteChat,
      pricePerMinuteVoice: astrologerFields.pricePerMinuteVoice,
      pricePerMinuteVideo: astrologerFields.pricePerMinuteVideo,
      about: astrologerFields.about,
    };

    const imageFile = imageFileToUpload;

    setIsSaving(true);
    try {
      if (astrologer_detail?.id) {
        const payload = await dispatch(
          editAstrologerUser({
            id: astrologer_detail?.id,
            astrologerData,
            imageFile: imageFile ? imageFile : undefined,
          }),
        ).unwrap();

        if (payload.success) {
          const userDetail: any = payload.astrologer?.user!;

          const astro = payload.astrologer;
          const astrologer_detail: any = astro
            ? {
                id: astro.id ?? '',
                about: astro.about ?? '',
                blocked: astro.blocked ?? false,
                experienceYears: astro.experienceYears ?? 0,
                expertise: astro.expertise ?? '',
                imgUri: astro.imgUri ?? '',
                languages: astro.languages ?? '',
                pricePerMinuteChat: astro.pricePerMinuteChat ?? 0,
                pricePerMinuteVoice: astro.pricePerMinuteVoice ?? 0,
                pricePerMinuteVideo: astro.pricePerMinuteVideo ?? 0,
              }
            : null;

          dispatch(setUser(userDetail));
          dispatch(setAstrologer(astrologer_detail));
          navigation.navigate('Profile');
          Toast.show({
            type: 'success',
            text1: 'Astrologer updated successfully',
          });
        }
      } else {
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Form submission error',
      });
    } finally {
      setIsSaving(false);
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
          <CustomInputV2
            label="Mobile"
            value={astrologerFields.mobile}
            onChangeText={val =>
              setAstrologerFields(prev => ({...prev, mobile: val}))
            }
          />
          <CustomInputV2
            label="Expertise"
            value={astrologerFields.expertise}
            onChangeText={val =>
              setAstrologerFields(prev => ({...prev, expertise: val}))
            }
          />
          <CustomInputV2
            label="About"
            multiline
            value={astrologerFields.about}
            onChangeText={val =>
              setAstrologerFields(prev => ({...prev, about: val}))
            }
          />
          <CustomInputV2
            label="Experience (Years)"
            keyboardType="number-pad"
            value={astrologerFields.experienceYears.toString()}
            onChangeText={val =>
              setAstrologerFields(prev => ({
                ...prev,
                experienceYears: parseInt(val) || 0,
              }))
            }
          />
          <CustomInputV2
            label="Languages (comma-separated)"
            value={astrologerFields.languages}
            onChangeText={val =>
              setAstrologerFields(prev => ({...prev, languages: val}))
            }
          />
          <CustomInputV2
            label="Chat Price ₹/min"
            keyboardType="numeric"
            value={astrologerFields.pricePerMinuteChat.toString()}
            onChangeText={val =>
              setAstrologerFields(prev => ({
                ...prev,
                pricePerMinuteChat: parseFloat(val) || 0,
              }))
            }
          />
          <CustomInputV2
            label="Voice Price ₹/min"
            keyboardType="numeric"
            value={astrologerFields.pricePerMinuteVoice.toString()}
            onChangeText={val =>
              setAstrologerFields(prev => ({
                ...prev,
                pricePerMinuteVoice: parseFloat(val) || 0,
              }))
            }
          />
          <CustomInputV2
            label="Video Price ₹/min"
            value={astrologerFields.pricePerMinuteVideo.toString()}
            onChangeText={val =>
              setAstrologerFields(prev => ({
                ...prev,
                pricePerMinuteVideo: parseFloat(val) || 0,
              }))
            }
            keyboardType="numeric"
          />
          <View style={{gap: scale(4), marginTop: verticalScale(20)}}>
            <CustomButton
              loading={isSaving}
              title={isSaving ? 'Updating..' : 'Save'}
              onPress={() => {
                handleFormSubmit();
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

export default AstrologerProfileEdit;

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
