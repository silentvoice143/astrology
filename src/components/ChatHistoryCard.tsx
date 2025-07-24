import React from 'react';
import {View, Text, StyleSheet, ImageSourcePropType} from 'react-native';
import {scale, verticalScale, scaleFont} from '../utils/sizer';
import Avatar from './avatar';
import {textStyle} from '../constants/text-style';
import {colors, themeColors} from '../constants/colors';
import {
  formatDateString,
  formatedDate,
  formatRelativeDate,
  getTimeOnly,
} from '../utils/utils';

interface ChatHistoryCardProps {
  name: string;
  time: Date;
  avatar: ImageSourcePropType;
  active: boolean;
}

const ChatHistoryCard: React.FC<ChatHistoryCardProps> = ({
  name,
  time,
  avatar,
  active,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: active ? colors.glow_shadow : themeColors.border.primary,
        },
      ]}>
      <View style={styles.row}>
        <Avatar
          image={avatar}
          fallbackText={name.charAt(0)}
          size={55}
          borderColor={themeColors.border.secondary}
          borderWidth={2}
          containerStyle={styles.avatar}
        />

        <View style={styles.textContainer}>
          <Text style={[styles.name, textStyle.fs_abyss_16_400]}>{name}</Text>
          <Text style={[styles.name, textStyle.fs_abyss_12_400]}>
            {formatedDate(time)}
          </Text>
        </View>
      </View>
      <Text style={[styles.time, textStyle.fs_mont_12_400]}>
        {formatRelativeDate(time)}
      </Text>
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
