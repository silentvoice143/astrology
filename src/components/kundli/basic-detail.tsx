import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import PersonalDetailModal from '../personal-detail-modal';
import {scale, verticalScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import {useAppSelector, useAppDispatch} from '../../hooks/redux-hook';
import {
  setKundliPerson,
  resetToDefaultUser,
  getPersonKundliDetail,
} from '../../store/reducer/kundli';
import {UserPersonalDetail} from '../../utils/types';
import EditIcon from '../../assets/icons/edit-icon';
import {textStyle} from '../../constants/text-style';
import {useRoute} from '@react-navigation/native';

const BasicDetails = ({active}: {active: number}) => {
  const [openedForOther, setOpenedForOther] = useState(false);
  const dispatch = useAppDispatch();
  const kundliPerson = useAppSelector(state => state.kundli.kundliPerson);
  const [showModal, setShowModal] = useState(false);
  const route = useRoute();

  const [kundliDetail, setKundliDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const fetchKundliDetails = async () => {
    setLoading(true);
    console.log('fetching kundli data');
    try {
      const payload = await dispatch(
        getPersonKundliDetail({
          ...kundliPerson,
          birthPlace: 'Varanasi',
          latitude: 25.317645,
          longitude: 82.973915,
        }),
      ).unwrap();
      console.log(payload, '---kundli details');
      if (payload.success) {
        setKundliDetail(payload.data.data);
      }
    } catch (err) {
      console.error('Error fetching kundli details:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchKundliDetails();
  }, [dispatch, kundliPerson]);

  const handleUpdate = (updatedDetails: UserPersonalDetail) => {
    dispatch(setKundliPerson(updatedDetails));
    setShowModal(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={{
        paddingVertical: verticalScale(20),
        paddingBottom: verticalScale(40),
      }}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{kundliPerson.name}</Text>
        </View>

        {route.name === 'chat' && (
          <View style={styles.headerRow}>
            <Text style={[textStyle.fs_mont_20_500]}>Details</Text>
            <TouchableOpacity
              onPress={() => {
                setOpenedForOther(false); // ← This is the fix
                setShowModal(true);
              }}>
              <EditIcon size={18} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.divider} />

        <DetailRow label="Full Name" value={kundliPerson.name || '__'} />
        <DetailRow label="Gender" value={kundliPerson.gender || '__'} />
        <DetailRow
          label="Date of Birth"
          value={kundliPerson.birthDate || '__'}
        />
        <DetailRow
          label="Time of Birth"
          value={kundliPerson.birthTime || '__'}
        />
        <DetailRow
          label="Place of Birth"
          value={kundliPerson.birthPlace || '__'}
        />
        {kundliDetail &&
          Object.entries(kundliDetail).map(([key, value]) => {
            if (typeof value !== 'object' && value !== null) {
              return (
                <DetailRow
                  key={key}
                  label={key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                  value={String(value)}
                />
              );
            }
            return null;
          })}
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
    </ScrollView>
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
    backgroundColor: colors.primary_card_2,
    padding: scale(16),
    borderRadius: scale(12),

    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  title: {
    ...textStyle.fs_abyss_36_400,
    color: colors.primary_surface_2 ?? '#222',
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
