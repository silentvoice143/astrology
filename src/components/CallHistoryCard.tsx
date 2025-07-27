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
import {colors, themeColors} from '../constants/colors';
import CallIcon from '../assets/icons/call-icon';
import {CallSession} from '../utils/types';
import VideoCallIcon from '../assets/icons/video-call-icon';
import {formatedDate, formatRelativeDate} from '../utils/utils';

interface CallHistoryCardProps {
  data: CallSession;
}

const CallHistoryCard: React.FC<CallHistoryCardProps> = ({data}) => {
  const getCallIcon = (type: string) => {
    if (type === 'VIDEO') {
      return <VideoCallIcon size={scale(20)} />;
    } else {
      return <CallIcon size={scale(20)} />;
    }
  };
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar
          image={{uri: data?.user?.imgUri}}
          size={55}
          borderColor={colors.secondarybtn}
          borderWidth={2}
          containerStyle={styles.avatar}
        />

        <View style={styles.textContainer}>
          <Text style={[styles.name, textStyle.fs_abyss_16_400]}>
            {data?.user?.name}
          </Text>
          <Text style={[styles.time, textStyle.fs_mont_12_400]}>
            {formatedDate(data.startedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.time, textStyle.fs_mont_12_400]}>
          {formatRelativeDate(data.startedAt)}
        </Text>
        <View style={styles.callInfo}>
          <Text style={[styles.callIcon]}>
            {getCallIcon(data?.sessionType)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary_surface,
    borderRadius: scale(16),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(10),
    borderColor: themeColors.border.primary,
    borderWidth: 1,
    flexDirection: 'row',
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
