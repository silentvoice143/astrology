import React, {useState} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import {scale, scaleFont, verticalScale} from '../utils/sizer';

type CustomInputProps = TextInputProps & {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  preText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureToggle?: boolean;
  showError?: boolean;
  errorMessage?: string;
  placeholder?: string;
  editable?: boolean; // ✅ New prop
};

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  labelStyle,
  preText,
  leftIcon,
  rightIcon,
  secureToggle = false,
  showError = false,
  errorMessage,
  placeholder,
  editable = true, // ✅ Default true
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(secureToggle);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {color: focused ? '#007bff' : '#000'},
            labelStyle,
          ]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {borderColor: focused ? '#007bff' : '#ccc'},
        ]}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

        {preText && <Text style={styles.preText}>{preText}</Text>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secure}
          placeholder={placeholder}
          editable={editable} // ✅ Used here
          style={[styles.input, inputStyle]}
          {...props}
        />

        {secureToggle && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Text style={styles.toggle}>{secure ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        )}

        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>

      {showError && errorMessage && (
        <Text style={styles.error}>{errorMessage}</Text>
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: scaleFont(14),
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: scaleFont(16),
    color: '#000',
  },
  icon: {
    marginHorizontal: 4,
  },
  preText: {
    marginRight: 8,
    fontSize: 16,
    color: '#666',
  },
  toggle: {
    marginLeft: 8,
    color: '#007bff',
    fontWeight: '500',
  },
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
});
