// import React, {useState} from 'react';
// import {View, Text, Pressable, StyleSheet} from 'react-native';
// import SendSvg from '../../assets/icons/send-svg';
// import DocumentSvg from '../../assets/icons/document-svg';
// import CustomInput from '../custom-input-v2';
// import {textStyle} from '../../constants/text-style';
// import {colors} from '../../constants/colors';
// import {scale, verticalScale, scaleFont} from '../../utils/sizer';
// interface Props {
//   onSend: (text: string) => void;
// }

// const ChatInput: React.FC<Props> = ({onSend}) => {
//   const [text, setText] = useState('');

//   const handleSend = () => {
//     if (text.trim()) {
//       onSend(text.trim());
//       setText('');
//     }
//   };

//   return (
//     <View style={styles.inputRow}>
//       <View style={styles.inputWrapper}>
//         <CustomInput
//           value={text}
//           onChangeText={setText}
//           placeholder="Message"
//           inputStyle={[styles.inputText, textStyle.fs_abyss_16_400]}
//         />
//       </View>

//       <Pressable
//         onPress={handleSend}
//         style={text ? styles.sendButton : styles.kundliButton}>
//         {text ? <SendSvg /> : <DocumentSvg />}
//       </Pressable>
//     </View>
//   );
// };

// export default ChatInput;

// const styles = StyleSheet.create({
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: scale(10),
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//   },
//   inputWrapper: {
//     flex: 1,
//     marginRight: scale(10),
//     borderRadius: scale(25),
//   },
//   inputText: {
//     color: colors.primaryText,
//     paddingVertical: verticalScale(6),
//   },
//   sendButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: verticalScale(10),
//     paddingHorizontal: scale(16),
//     borderRadius: scale(20),
//   },
//   kundliButton: {
//     backgroundColor: '#B5C7EB',
//     paddingVertical: verticalScale(10),
//     paddingHorizontal: scale(16),
//     borderRadius: scale(20),
//   },
//   sendText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: scaleFont(14),
//   },
// });



// components/chat/chat-input.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { scale, verticalScale } from '../../utils/sizer';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [inputText, setInputText] = useState('');

  const handleTextChange = (text: string) => {
    setInputText(text);
    
    if (text.length > 0 && onStartTyping) {
      onStartTyping();
    } else if (text.length === 0 && onStopTyping) {
      onStopTyping();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || disabled) return;
    
    onSend(inputText.trim());
    setInputText('');
    
    if (onStopTyping) {
      onStopTyping();
    }
  };

  const handleSubmitEditing = () => {
    handleSend();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textInput,
          disabled && styles.textInputDisabled
        ]}
        value={inputText}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        maxLength={1000}
        editable={!disabled}
        onSubmitEditing={handleSubmitEditing}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!inputText.trim() || disabled) && styles.sendButtonDisabled
        ]}
        onPress={handleSend}
        disabled={!inputText.trim() || disabled}
      >
        <Text style={[
          styles.sendButtonText,
          (!inputText.trim() || disabled) && styles.sendButtonTextDisabled
        ]}>
          Send
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(16),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    maxHeight: verticalScale(100),
    marginRight: scale(12),
    fontSize: scale(16),
    textAlignVertical: 'top',
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    borderRadius: scale(20),
    justifyContent: 'center',
    minHeight: scale(44),
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: scale(16),
  },
  sendButtonTextDisabled: {
    color: '#666',
  },
});

export default ChatInput;