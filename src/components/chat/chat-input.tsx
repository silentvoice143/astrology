import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import SendSvg from '../../assets/icons/send-svg';
import DocumentSvg from '../../assets/icons/document-svg';
import CustomInput from '../custom-input-v2';
import {textStyle} from '../../constants/text-style';
import {colors} from '../../constants/colors';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
interface Props {
  onSend: (text: string) => void;
}

const ChatInput: React.FC<Props> = ({onSend}) => {
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
        <CustomInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          inputStyle={[styles.inputText, textStyle.fs_abyss_16_400]}
        />
      </View>

      <Pressable
        onPress={handleSend}
        style={text ? styles.sendButton : styles.kundliButton}>
        {text ? <SendSvg /> : <DocumentSvg />}
      </Pressable>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flex: 1,
    marginRight: scale(10),
    borderRadius: scale(25),
  },
  inputText: {
    color: colors.primaryText,
    paddingVertical: verticalScale(6),
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
  },
  kundliButton: {
    backgroundColor: '#B5C7EB',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(14),
  },
});
