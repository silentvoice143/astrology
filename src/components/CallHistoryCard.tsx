import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import {scale, verticalScale} from '../utils/sizer';
import Avatar from './avatar';
import {textStyle} from '../constants/text-style';
import {colors} from '../constants/colors';

interface CallHistoryCardProps {
  name: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  time: string;
  avatar: ImageSourcePropType;
  onCallPress?: () => void;
}

const CallHistoryCard: React.FC<CallHistoryCardProps> = ({
  name,
  callType,
  duration,
  time,
  avatar,
  onCallPress,
}) => {
  const getCallIcon = () => {
    switch (callType) {
      case 'incoming':
        return '↙️'; // You can replace with actual icons
      case 'outgoing':
        return '↗️';
      case 'missed':
        return '❌';
      default:
        return '📞';
    }
  };

  const getCallTypeColor = () => {
    switch (callType) {
      case 'incoming':
        return '#4CAF50';
      case 'outgoing':
        return colors.primarybtn;
      case 'missed':
        return '#F44336';
      default:
        return colors.secondaryText;
    }
  };

  const getCallTypeText = () => {
    switch (callType) {
      case 'incoming':
        return 'Incoming';
      case 'outgoing':
        return 'Outgoing';
      case 'missed':
        return 'Missed';
      default:
        return '';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar
          image={avatar}
          size={55}
          borderColor={colors.secondarybtn}
          borderWidth={2}
          containerStyle={styles.avatar}
        />

        <View style={styles.textContainer}>
          <Text style={[styles.name, textStyle.fs_abyss_16_400]}>{name}</Text>
          <View style={styles.callInfo}>
            <Text style={[styles.callIcon]}>{getCallIcon()}</Text>
            <Text
              style={[
                styles.callType,
                textStyle.fs_mont_14_400,
                {color: getCallTypeColor()},
              ]}>
              {getCallTypeText()}
            </Text>
            {callType !== 'missed' && (
              <Text style={[styles.duration, textStyle.fs_mont_14_400]}>
                • {duration}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.time, textStyle.fs_mont_14_400]}>{time}</Text>
        <TouchableOpacity style={styles.callButton} onPress={onCallPress}>
          <Text style={styles.callButtonIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(10),

    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Shadow (Android)
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginVertical: verticalScale(8),
  },
  avatar: {
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: colors.primaryText,
    marginBottom: verticalScale(2),
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: scale(12),
    marginRight: scale(6),
  },
  callType: {
    fontWeight: '500',
  },
  duration: {
    color: colors.secondaryText,
    marginLeft: scale(4),
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    color: colors.secondaryText,
    marginBottom: verticalScale(8),
  },
  callButton: {
    backgroundColor: colors.secondarybtn,
    borderRadius: scale(20),
    width: scale(36),
    height: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonIcon: {
    fontSize: scale(16),
  },
});

export default CallHistoryCard;
