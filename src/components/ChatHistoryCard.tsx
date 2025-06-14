import React from 'react';
import {View, Text, StyleSheet, ImageSourcePropType} from 'react-native';
import {scale, verticalScale, scaleFont} from '../utils/sizer';
import Avatar from './avatar';
import {textStyle} from '../constants/text-style';
import {colors} from '../constants/colors';

interface ChatHistoryCardProps {
  name: string;
  message: string;
  time: string;
  avatar: ImageSourcePropType;
}

const ChatHistoryCard: React.FC<ChatHistoryCardProps> = ({
  name,
  message,
  time,
  avatar,
}) => {
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
          <Text style={[styles.message, textStyle.fs_mont_14_400]}>
            {message}
          </Text>
        </View>
      </View>
      <Text style={[styles.time, textStyle.fs_mont_12_400]}>{time}</Text>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  },
  message: {
    color: colors.secondaryText,
    marginTop: verticalScale(2),
  },
  time: {
    color: colors.secondaryText,
    marginLeft: scale(6),
    alignSelf: 'flex-start',
  },
});

export default ChatHistoryCard;
