import React, {useRef, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TextInputProps,
} from 'react-native';

type OtpInputProps = {
  otpLength?: number;
  onOtpChange: (otp: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  focusBoxStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  inputProps?: TextInputProps;
};

const OtpInput: React.FC<OtpInputProps> = ({
  otpLength = 4,
  onOtpChange,
  containerStyle,
  boxStyle,
  focusBoxStyle,
  textStyle,
  inputProps,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onOtpChange(newOtp.join(''));

    if (text && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array(otpLength)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref!)}
            keyboardType="number-pad"
            maxLength={1}
            value={otp[index]}
            onChangeText={text => handleChange(text, index)}
            onFocus={() => setFocusedIndex(index)}
            onKeyPress={e => handleKeyPress(e, index)}
            style={[
              styles.box,
              boxStyle,
              focusedIndex === index && styles.focusBox,
              focusedIndex === index && focusBoxStyle,
              textStyle,
            ]}
            {...inputProps}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
  focusBox: {
    borderColor: '#d50075',
  },
});

export default OtpInput;
