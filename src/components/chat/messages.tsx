import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../constants/colors';
import {textStyle} from '../../constants/text-style';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';

interface MessagesProps {
  type: 'send' | 'reply';
  message: string;
  time?: string;
}

const Messages: React.FC<MessagesProps> = ({type, message, time}) => {
  const isSend = type === 'send';

  return (
    <View
      style={[
        styles.messageContainer,
        isSend ? styles.sentContainer : styles.receivedContainer,
      ]}>
      <Text style={[styles.messageText, textStyle.fs_abyss_16_400]}>
        {message}
      </Text>
      {time && (
        <Text style={[styles.timeText, textStyle.fs_abyss_10_400]}>{time}</Text>
      )}
    </View>
  );
};

export default Messages;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '75%',
    marginVertical: verticalScale(6),
    padding: scale(10),
    borderRadius: scale(12),
  },
  sentContainer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.messageSend,
    borderTopRightRadius: 0,
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.messageReceived,
    borderRadius: scale(12),
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: scaleFont(16),
    color: colors.primaryText,
  },
  timeText: {
    fontSize: scaleFont(10),
    color: colors.secondaryText,
    textAlign: 'right',
    marginTop: verticalScale(4),
  },
});
