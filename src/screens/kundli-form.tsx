import {View, Text, ScrollView} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import CustomDateTimePicker from '../components/custom-date-time-picker';
import ControlledTagSelector from '../components/controlled-tag-selector';
import LocationAutoComplete from '../components/location-input-modal-based';
import CustomInputV2 from '../components/custom-input-v2';
import {UserPersonalDetail} from '../utils/types';
import {scale, verticalScale} from '../utils/sizer';
import CustomButton from '../components/custom-button';
import {textStyle} from '../constants/text-style';
import {colors} from '../constants/colors';
import {useAppDispatch} from '../hooks/redux-hook';
import {postUserDetail} from '../store/reducer/user';
import {setKundliPerson} from '../store/reducer/kundli';
import {useNavigation} from '@react-navigation/native';

const genderTags = [
  {id: 'MALE', label: 'Male'},
  {id: 'FEMALE', label: 'Female'},
  {id: 'OTHER', label: 'Other'},
];

const KundliForm = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const now = new Date();
  const [personalDetail, setPersonalDetail] = useState<UserPersonalDetail>({
    name: '',
    gender: '',
    birthDate: now.toISOString().split('T')[0],
    birthTime: now.toTimeString().split(' ')[0],
    birthPlace: 'heaven',
    latitude: 34,
    longitude: 45,
  });
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

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
    dispatch(setKundliPerson(formattedDetails));
    navigation.navigate('Kundli');
  };

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(20),
          }}>
          <View style={{marginBottom: verticalScale(20)}}>
            <Text
              style={[textStyle.fs_abyss_32_400, {color: colors.primaryText}]}>
              Fill Details
            </Text>
            <Text
              style={[textStyle.fs_abyss_14_400, {color: colors.primaryText}]}>
              Fill all the details to proceed
            </Text>
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
              title="Submit"
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

export default KundliForm;
