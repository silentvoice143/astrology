import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularRatingProps } from '../../utils/types';
import { verticalScale } from '../../utils/sizer';
import { colors } from '../../constants/colors';
import { textStyle } from '../../constants/text-style';

const CircularRating: React.FC<CircularRatingProps> = ({ rating, size = 70 }) => {
  return (
    <View style={[styles.ratingContainer, { width: size, height: size }]}>
      <View style={styles.ratingCircle}>
        <View
          style={[
            styles.ratingBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {/* Progress Ring */}
          <View
            style={[
              styles.ratingProgress,
              {
                width: size - 4,
                height: size - 4,
                borderRadius: (size - 4) / 2,
                borderWidth: 3,
                borderColor: colors.grey300,
                borderTopColor: colors.primary_orange,
                borderRightColor: rating >= 2.5 ? colors.primary_orange : colors.grey300,
                borderBottomColor: rating >= 3.75 ? colors.primary_orange : colors.grey300,
                borderLeftColor: rating >= 1.25 ? colors.primary_orange : colors.grey300,
              },
            ]}
          />

          {/* Rating Number and Stars */}
          <View style={styles.ratingTextContainer}>
            <Text style={[textStyle.fs_mont_18_700, styles.ratingNumber]}>
              {rating}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.ratingStar, textStyle.fs_abyss_10_400,
                    { color: star <= rating ? colors.starGold : colors.grey300 },
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CircularRating;

const styles = StyleSheet.create({
  ratingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBackground: {
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.grey300,
  },
  ratingProgress: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingNumber: {
    color: colors.primary_orange,
    marginBottom: verticalScale(2),
  },
  starsRow: {
    flexDirection: 'row',
  },
  ratingStar: {
    marginHorizontal: 0.5,
  },
});
