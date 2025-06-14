import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import PersonalDetailModal from '../personal-detail-modal';
import {scale} from '../../utils/sizer';
import {colors} from '../../constants/colors'; // Optional: use your theme/colors

const BasicDetails = () => {
  const [showModal, setShowModal] = useState(false);

  const [details, setDetails] = useState({
    fullName: 'John Doe',
    gender: 'Male',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30 AM',
    placeOfBirth: 'New Delhi, India',
  });

  const handleUpdate = (updatedDetails: typeof details) => {
    setDetails(updatedDetails);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Basic Details</Text>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <DetailRow label="Full Name" value={details.fullName} />
        <DetailRow label="Gender" value={details.gender} />
        <DetailRow label="Date of Birth" value={details.dateOfBirth} />
        <DetailRow label="Time of Birth" value={details.timeOfBirth} />
        <DetailRow label="Place of Birth" value={details.placeOfBirth} />
      </View>

      <PersonalDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        existingDetails={details}
        onSubmit={handleUpdate}
      />
    </View>
  );
};

const DetailRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: scale(16),
  },
  card: {
    backgroundColor: '#fff',
    padding: scale(16),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText ?? '#222',
  },
  editText: {
    fontSize: 14,
    color: colors.primary ?? '#007bff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: scale(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scale(6),
  },
  label: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
    maxWidth: '60%',
    textAlign: 'right',
  },
});

export default BasicDetails;
