import React from 'react';
import { StyleSheet } from 'react-native';
import Avatar from '../avatar';
import { scale } from '../../utils/sizer';
import { ReviewAvatarProps } from '../../utils/types';
import { colors } from '../../constants/colors';
import { textStyle } from '../../constants/text-style';

const ReviewAvatar: React.FC<ReviewAvatarProps> = ({
  phoneNumber,
  size = 40,
}) => {
  const firstDigit = phoneNumber.charAt(0);

  return (
    <Avatar
      fallbackText={firstDigit}
      size={size}
      borderColor="transparent"
      borderWidth={0}
      containerStyle={styles.reviewAvatarContainer}
      textStyle={textStyle.fs_mont_14_700}
    />
  );
};

const styles = StyleSheet.create({
  reviewAvatarContainer: {
    marginRight: scale(12),
    backgroundColor: colors.primary_orange,
  },
  reviewAvatarTextStyle: {
    color: colors.background,
  },
});

export default ReviewAvatar;
