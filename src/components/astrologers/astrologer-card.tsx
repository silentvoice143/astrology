import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {scale, verticalScale, moderateScale} from '../../utils/sizer';
import {colors} from '../../constants/colors';
import LikeIcon from '../../assets/icons/like-icon';
import StarIcon from '../../assets/icons/star-icon';
import CallIcon from '../../assets/icons/call-icon';
import VideoCallIcon from '../../assets/icons/video-call-icon';
import ChatIcon from '../../assets/icons/chat-icon';
import {textStyle} from '../../constants/text-style';
import {formatPrice} from '../../utils/utils';

type AstrologerCardProps = {
  id: string;
  name: string;
  rate: string;
  rating: number;
  experience: string;
  languages: string;
  imageUri: string;
  onCallPress?: () => void;
  onVideoPress?: () => void;
  onChatPress?: () => void;
  pricePerMinuteChat: number;
  pricePerMinuteVideo: number;
  pricePerMinuteVoice: number;
  expertise: string;
  online: boolean;
};

const AstrologerCard: React.FC<AstrologerCardProps> = ({
  name,
  rate,
  rating,
  experience,
  expertise,
  languages,
  imageUri,
  onCallPress,
  onVideoPress,
  onChatPress,
  pricePerMinuteChat,
  pricePerMinuteVideo,
  pricePerMinuteVoice,
  online,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View>
          <View
            style={{
              position: 'absolute',
              right: -2,
              width: 12,
              height: 12,
              zIndex: 999,
              borderRadius: 6,
              backgroundColor: online ? colors.success.base : colors.error.base,
            }}></View>
          <Image source={{uri: imageUri}} style={styles.avatar} />
        </View>

        <View style={{flex: 1, marginLeft: scale(12)}}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {/* <LikeIcon /> */}
          </View>

          {rate && (
            <View style={styles.rateTag}>
              <Text style={styles.rateText}>{rate}</Text>
            </View>
          )}

          {rating && (
            <View style={styles.ratingRow}>
              <StarIcon color={colors.glow_shadow} />
              <Text style={styles.ratingText}>{rating} / 5</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailsSection}>
        {experience && (
          <View>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailValue}>{experience}</Text>
          </View>
        )}
        {expertise && (
          <View>
            <Text style={styles.detailLabel}>Expertise</Text>
            <Text style={styles.detailValue}>{expertise}</Text>
          </View>
        )}
        {languages && (
          <View>
            <Text style={styles.detailLabel}>Language</Text>
            <Text style={styles.detailValue}>{languages}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            disabled={true}
            onPress={onCallPress}
            style={styles.button}>
            <View
              style={{
                padding: moderateScale(4),
                backgroundColor: colors.secondary_Card,
                borderRadius: scale(12),
              }}>
              <CallIcon colors={[colors.whiteText]} height={16} width={16} />
            </View>
            <Text style={styles.buttonText}>
              {formatPrice(pricePerMinuteVoice, 'min')}
            </Text>
          </TouchableOpacity>
        </View>

        <View onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            disabled={true}
            onPress={onVideoPress}
            style={styles.button}>
            <View
              style={{
                padding: moderateScale(4),
                backgroundColor: colors.secondary_Card,
                borderRadius: scale(12),
              }}>
              <VideoCallIcon size={16} colors={[colors.whiteText]} />
            </View>

            <Text style={styles.buttonText}>
              {formatPrice(pricePerMinuteVideo, 'min')}
            </Text>
          </TouchableOpacity>
        </View>

        <View onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={onChatPress} style={styles.button}>
            <View
              style={{
                padding: moderateScale(4),
                backgroundColor: colors.secondary_Card,
                borderRadius: scale(12),
              }}>
              <ChatIcon height={16} width={16} colors={[colors.whiteText]} />
            </View>

            <Text style={styles.buttonText}>
              {formatPrice(pricePerMinuteChat, 'min')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AstrologerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: scale(14),
    marginVertical: verticalScale(10),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 4,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...textStyle.fs_abyss_16_400,
    color: colors.primaryText,
  },
  rateTag: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(4),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: 12,
    backgroundColor: '#f44336',
  },
  rateText: {
    ...textStyle.fs_abyss_12_400,
    color: colors.whiteText,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
    gap: scale(4),
  },
  ratingText: {
    ...textStyle.fs_abyss_14_400,
    color: colors.primaryText,
  },
  detailsSection: {
    marginTop: verticalScale(12),
  },
  detailLabel: {
    ...textStyle.fs_mont_14_700,
    color: colors.primaryText,
  },
  detailValue: {
    ...textStyle.fs_abyss_14_400,
    color: colors.secondaryText,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.primary_border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
  },
  buttonText: {
    marginLeft: scale(6),
    color: colors.primaryText,
    fontWeight: '600',
  },
});
