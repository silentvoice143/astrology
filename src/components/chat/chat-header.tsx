import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import Avatar from '../avatar';
import {scale, verticalScale} from '../../utils/sizer';
import BackIcon from '../../assets/icons/back-icon';
import {colors} from '../../constants/colors';
import { textStyle } from '../../constants/text-style';

interface ChatHeaderProps {
  name: string;
  profileImage: ImageSourcePropType;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  profileImage,
  onBackPress,
  onMenuPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress}>
        <BackIcon color="#000" />
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <Avatar image={profileImage} size={scale(40)} />
        <Text style={[styles.nameText,textStyle.fs_mont_16_500]}>{name}</Text>
      </View>

      <View style={styles.actionIcons}>
        {/* <TouchableOpacity onPress={onMenuPress} style={styles.iconSpacing}>
          <Text>...</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(12),
    backgroundColor: colors.messageReceived,
    justifyContent: 'space-between',
    elevation:3
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: scale(10),
  },
  nameText: {
    color: '#000',
    marginLeft: scale(10),
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: scale(16),
  },
});
