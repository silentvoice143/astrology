import React from 'react';
import {View, Text, Image, StyleSheet, ImageSourcePropType} from 'react-native';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
import {textStyle} from '../../constants/text-style';
import {colors} from '../../constants/colors';

interface ProfileSectionItemProps {
  icon: ImageSourcePropType;
  title: string;
  description?: string;
}

const ProfileSectionItem: React.FC<ProfileSectionItemProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.icon} />
      </View>
      <View style={styles.content}>
        <Text style={[textStyle.fs_mont_16_600, styles.title]}>{title}</Text>
        <View style={styles.underline} />
        {description && (
          <Text style={[textStyle.fs_mont_14_400, styles.description]}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileSectionItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    backgroundColor: colors.background,
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#F2F4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  icon: {
    width: scale(28),
    height: scale(28),
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.primaryText,
    marginBottom: verticalScale(4),
  },
  underline: {
    height: verticalScale(2),
    width: scale(60),
    backgroundColor: colors.primary_orange,
    marginBottom: verticalScale(6),
    borderRadius: scale(1),
  },
  description: {
    color: colors.secondaryText,
    fontSize: scaleFont(13),
  },
});
