import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import ReviewAvatar from './ReviewAvatar';
import {textStyle} from '../../constants/text-style';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {Review} from '../../utils/types';
import {colors} from '../../constants/colors';

interface ReviewItemProps {
  review: Review;
  renderStars: (rating: number) => React.ReactNode[];
}

const ReviewItem: React.FC<ReviewItemProps> = ({review, renderStars}) => {
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <ReviewAvatar phoneNumber={review.phoneNumber} size={40} />
        <View style={styles.reviewContent}>
          <Text style={[styles.phoneNumber, textStyle.fs_mont_14_500]}>
            {review.phoneNumber}
          </Text>
          <Text style={[styles.reviewDate, textStyle.fs_mont_12_400]}>
            {review.date}
          </Text>
        </View>
        <View style={styles.reviewRating}>
          <View style={styles.starsContainer}>
            {renderStars(review.rating)}
          </View>
          {review.isFreeRating && (
            <View style={styles.freeRatingContainer}>
              <Text style={[styles.freeRatingText, textStyle.fs_abyss_10_400]}>
                Free Rating
              </Text>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ⓘ</Text>
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.moreOptions}>
          <Text style={styles.moreOptionsText}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewItem: {
    backgroundColor: colors.secondary_surface_2,
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewContent: {
    flex: 1,
  },
  phoneNumber: {
    color: colors.primary_surface,
    marginBottom: verticalScale(2),
  },
  reviewDate: {
    color: colors.secondaryText,
  },
  reviewRating: {
    alignItems: 'flex-end',
    marginRight: scale(8),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(4),
  },
  freeRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeRatingText: {
    color: colors.secondaryText,
  },
  infoIcon: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: colors.secondary_surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(4),
  },
  infoIconText: {
    color: colors.secondaryText,
    fontSize: scaleFont(10),
    fontWeight: 'bold',
  },
  moreOptions: {
    padding: scale(4),
  },
  moreOptionsText: {
    color: colors.secondaryText,
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
});

export default ReviewItem;
