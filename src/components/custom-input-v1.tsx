import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import {themeColors} from '../constants/colors';

type CustomInputV1Props = {
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
} & TextInputProps;

const CustomInputV1: React.FC<CustomInputV1Props> = ({
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
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [secureText, setSecureText] = useState(secureToggle);
  const borderColorAnim = useState(new Animated.Value(0))[0];

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColors.border.primary, themeColors.border.secondary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputRow}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        {preText && <Text style={styles.preText}>{preText}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureText}
          style={[styles.input, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {secureToggle ? (
          <TouchableOpacity
            onPress={() => setSecureText(prev => !prev)}
            style={styles.icon}>
            {rightIcon}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.icon}>{rightIcon}</View>
        )}
      </View>
      <Animated.View
        style={[styles.underline, {backgroundColor: borderColor}]}
      />
      {showError && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    color: themeColors.text.primary,
    fontSize: 16,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
  preText: {
    color: 'gray',
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: 'black',
  },
  underline: {
    height: 2,
    marginTop: 4,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 4,
    fontSize: 13,
  },
});

export default CustomInputV1;
