import {View, Text} from 'react-native';
import React, {useState} from 'react';
import CustomModal from '../modal';
import CustomInputV2 from '../custom-input-v2';
import CustomInputV1 from '../custom-input-v1';

const PersonalDetailModal = ({isOpen, onClose}) => {
  const [personalDetail, setPersonalDetail] = useState({name: ''});
  const handleChange = ({key, value}) => {
    setPersonalDetail({...personalDetail, [key]: value});
  };
  return (
    <CustomModal
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
    </CustomModal>
  );
};

export default PersonalDetailModal;
