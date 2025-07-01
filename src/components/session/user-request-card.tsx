import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../../constants/colors';
import {textStyle} from '../../constants/text-style';
import {scale, verticalScale} from '../../utils/sizer';

type UserDetail = {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  mobile: string;
  walletBalance: number;
  role: string;
};

type Props = {
  data: UserDetail;
  onAccept: () => void;
  onSkip: () => void;
};

const UserRequestCard: React.FC<Props> = ({data, onAccept, onSkip}) => {
  return (
    <View style={styles.card}>
      <Detail label="Name" value={data.name} />
      <Detail label="Gender" value={data.gender} />
      <Detail label="Date of Birth" value={data.birthDate} />
      <Detail label="Time of Birth" value={data.birthTime} />
      <Detail label="Place of Birth" value={data.birthPlace} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.accept]}
          onPress={onAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.skip]} onPress={onSkip}>
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Detail = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: scale(16),
    marginVertical: verticalScale(10),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    ...textStyle.fs_mont_14_700,
    color: colors.primaryText,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
    flexWrap: 'wrap',
  },
  label: {
    ...textStyle.fs_mont_14_700,
    color: colors.primaryText,
    marginRight: scale(4),
  },
  value: {
    ...textStyle.fs_abyss_14_400,
    color: colors.secondaryText,
    flexShrink: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(16),
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: scale(4),
  },
  accept: {
    backgroundColor: colors.success.base,
  },
  skip: {
    backgroundColor: colors.error.base,
  },
  buttonText: {
    ...textStyle.fs_mont_14_700,
    color: '#fff',
  },
});

export default UserRequestCard;
