import {View, Text} from 'react-native';
import React, {useState} from 'react';
import CustomModal from './modal';
import CustomInputV2 from './custom-input-v2';
import CustomDateTimePicker from './custom-date-time-picker';
import CustomButton from './custom-button';
import {scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import LocationAutoComplete from './location-input-modal-based';

interface PersonalDetialModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDetails?: {
    fullName: string;
    gender: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  };
  onSubmit?: (details: any) => void;
}

const PersonalDetailModal = ({isOpen, onClose}: PersonalDetialModalProps) => {
  const [personalDetail, setPersonalDetail] = useState({name: ''});
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const handleChange = ({key, value}: {key: string; value: any}) => {
    setPersonalDetail({...personalDetail, [key]: value});
  };

  const handleLocation = (location: any) => {
    console.log(location, '----------location');
  };

  return (
    <CustomModal
      showCloseButton={false}
      footer={
        <View style={{gap: scale(4)}}>
          <CustomButton title="Submit" onPress={() => {}} />
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
        onChange={setDate}
        mode="date"
        placeholder="Choose date"
        showError={!date}
        errorMessage="Please select a date"
      />
      <CustomDateTimePicker
        label="Select Time"
        value={time}
        mode="time"
        onChange={setTime}
        placeholder="Pick time"
        // This picker supports seconds on iOS out of the box
      />
      {/* <CustomInputV2
        label="Place of birth"
        placeholder="Enter place"
        value={personalDetail.name}
        onChangeText={val => handleChange({key: 'name', value: val})}
      /> */}
      <LocationAutoComplete
        label="Place of Birth"
        onSelectLocation={handleLocation}
      />
    </CustomModal>
  );
};

export default PersonalDetailModal;
