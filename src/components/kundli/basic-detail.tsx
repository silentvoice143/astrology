import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import PersonalDetailModal from '../personal-detail-modal';
import {scale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import {useAppSelector, useAppDispatch} from '../../hooks/redux-hook';
import {setKundliPerson, resetToDefaultUser} from '../../store/reducer/kundli';
import {UserPersonalDetail} from '../../utils/types';

const BasicDetails = ({active}: {active: number}) => {
  const [openedForOther, setOpenedForOther] = useState(false);
  const dispatch = useAppDispatch();
  const defaultUser = useAppSelector(state => state.kundli.defaultUser);
  const kundliPerson = useAppSelector(state => state.kundli.kundliPerson);

  const [showModal, setShowModal] = useState(false);

  const isDefaultUser =
    kundliPerson.name === defaultUser.name &&
    kundliPerson.birthDate === defaultUser.birthDate &&
    kundliPerson.birthTime === defaultUser.birthTime;

  const handleUpdate = (updatedDetails: UserPersonalDetail) => {
    dispatch(setKundliPerson(updatedDetails));
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Basic Details</Text>
          <TouchableOpacity
            onPress={() => {
              setOpenedForOther(false); // ← This is the fix
              setShowModal(true);
            }}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <DetailRow label="Full Name" value={kundliPerson.name || '-'} />
        <DetailRow label="Gender" value={kundliPerson.gender || '-'} />
        <DetailRow
          label="Date of Birth"
          value={kundliPerson.birthDate || '-'}
        />
        <DetailRow
          label="Time of Birth"
          value={kundliPerson.birthTime || '-'}
        />
        <DetailRow
          label="Place of Birth"
          value={kundliPerson.birthPlace || '-'}
        />
      </View>

      <PersonalDetailModal
        isOpen={showModal}
        onClose={() => {
          if (openedForOther) {
            dispatch(resetToDefaultUser());
            setOpenedForOther(false);
          }
          setShowModal(false);
        }}
        existingDetails={kundliPerson}
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
    color: colors.primaryText ?? '#007bff',
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
  buttonRow: {
    marginTop: scale(16),
    flexDirection: 'column',
    gap: scale(8),
  },
});

export default BasicDetails;
