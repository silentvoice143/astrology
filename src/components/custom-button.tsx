import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type CustomButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loaderColor?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconStyle?: StyleProp<ViewStyle>;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  loaderColor = '#fff',
  leftIcon,
  rightIcon,
  iconStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: disabled ? '#ccc' : '#007bff',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {/* Left: Spinner if loading, otherwise leftIcon */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={loaderColor}
          style={{marginRight: 8}}
        />
      ) : (
        leftIcon && (
          <View style={[{marginRight: 8}, iconStyle]}>{leftIcon}</View>
        )
      )}

      {/* Title */}
      <Text
        style={[
          {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
          },
          textStyle,
        ]}>
        {title}
      </Text>

      {/* Right icon */}
      {rightIcon && (
        <View style={[{marginLeft: 8}, iconStyle]}>{rightIcon}</View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
