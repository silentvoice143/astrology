import {View, Text} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomModal from './modal';
import CustomInputV2 from './custom-input-v2';
import CustomDateTimePicker from './custom-date-time-picker';
import CustomButton from './custom-button';
import {scale} from '../utils/sizer';
import {colors} from '../constants/colors';
import LocationAutoComplete from './location-input-modal-based';
import {UserPersonalDetail} from '../utils/types';
import ControlledTagSelector from './controlled-tag-selector';

interface PersonalDetialModalProps {
  parent: string;
  isSaving?: boolean;
  isOpen: boolean;
  onClose: () => void;
  existingDetails?: UserPersonalDetail;
  onSubmit: (details: UserPersonalDetail) => void;
  showClosebtn?: boolean;
}

const genderTags = [
  {id: 'MALE', label: 'Male'},
  {id: 'FEMALE', label: 'Female'},
  {id: 'OTHER', label: 'Other'},
];

const PersonalDetailModal = ({
  parent,
  isSaving,
  isOpen,
  onClose,
  onSubmit,
  existingDetails,
  showClosebtn,
}: PersonalDetialModalProps) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const now = new Date();
  const [personalDetail, setPersonalDetail] = useState<UserPersonalDetail>({
    name: '',
    gender: '',
    birthDate: now.toISOString().split('T')[0],
    birthTime: now.toTimeString().split(' ')[0],
    birthPlace: 'hell',
    latitude: 34,
    longitude: 45,
  });

  // 🔁 Populate state from existingDetails on modal open
  useEffect(() => {
    if (isOpen && existingDetails) {
      const {name, gender, birthDate, birthTime, birthPlace} = existingDetails;

      const parsedDate = new Date(birthDate);
      const parsedTime = new Date(`1970-01-01T${birthTime}`);

      setDate(parsedDate);
      setTime(parsedTime);

      setPersonalDetail(prev => ({
        ...prev,
        name: name,
        gender: gender?.toUpperCase(),
        birthDate: birthDate,
        birthTime: birthTime,
        birthPlace: birthPlace,
      }));
    }
  }, [isOpen, existingDetails]);

  const handleChange = ({key, value}: {key: string; value: any}) => {
    setPersonalDetail(prev => ({...prev, [key]: value}));
  };

  return (
    <CustomModal
      parent={parent}
      showCloseButton={showClosebtn}
      footer={
        <View style={{gap: scale(4)}}>
          <CustomButton
            loading={isSaving}
            title="Submit"
            onPress={() => {
              const formattedDetails = {
                ...personalDetail,
                gender: personalDetail.gender?.toUpperCase() || '',
              };
              onSubmit(formattedDetails);
            }}
          />
        </View>
      }
      header={{
        title: 'Personal Details',
        description: 'Please enter your details',
      }}
      visible={isOpen}
      onClose={onClose}>
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
    </CustomModal>
  );
};

export default PersonalDetailModal;
