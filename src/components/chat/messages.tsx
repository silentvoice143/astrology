import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { colors } from '../../constants/colors';

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
      <Text style={styles.messageText}>{message}</Text>
      {time && <Text style={styles.timeText}>{time}</Text>}
    </View>
  );
};

export default Messages;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '75%',
    marginVertical: 6,
    padding: 10,
    borderRadius: 12,
  },
  sentContainer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary_surface || '#DCF8C6',
    borderTopRightRadius: 0,
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary_surface || '#FFFFFF',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timeText: {
    fontSize: 10,
    color: '#555',
    textAlign: 'right',
    marginTop: 4,
  },
});
