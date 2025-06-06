import React, {useState, useEffect} from 'react';
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

type CustomInputV2Props = {
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

const CustomInputV2: React.FC<CustomInputV2Props> = ({
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
  const labelAnim = useState(new Animated.Value(value ? 1 : 0))[0];

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

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
    outputRange: ['#ccc', '#6200ee'],
  });

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -10],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.wrapper}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        {preText && <Text style={styles.preText}>{preText}</Text>}
        <View style={styles.inputWrapper}>
          {label && (
            <Animated.Text
              style={[
                styles.label,
                labelStyle,
                {
                  top: labelTop,
                  fontSize: labelFontSize,
                },
              ]}>
              {label}
            </Animated.Text>
          )}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureText}
            style={[styles.input, inputStyle]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
        </View>
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
    marginVertical: 12,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  icon: {
    paddingHorizontal: 6,
  },
  preText: {
    fontSize: 16,
    color: '#666',
    paddingRight: 6,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    color: '#888',
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: '#000',
    borderBottomWidth: 0,
  },
  underline: {
    height: 2,
    marginTop: 2,
    borderRadius: 1,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 4,
  },
});

export default CustomInputV2;
