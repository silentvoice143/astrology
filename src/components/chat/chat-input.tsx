import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AnimatedSearchInput from '../custom-searchbox';
interface Props {
  onSend: (text: string) => void;
}

const ChatInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.inputRow}>
      <View style={styles.inputWrapper}>
        <AnimatedSearchInput
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          iconPosition="left"
          focusedBorderColor="#007AFF"
          unfocusedBorderColor="#ddd"
          enableShadow={false}
          inputContainerStyle={{
            backgroundColor: '#f9f9f9',
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
          inputStyle={{ fontSize: 16 }}
        />
      </View>

      <Pressable onPress={handleSend} style={styles.sendButton}>
        <Text style={styles.sendText}>Send</Text>
      </Pressable>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
