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
import LinearGradient from 'react-native-linear-gradient';
import {colors as col} from '../constants/colors';

type GradientButtonProps = {
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
  colors?: string[]; // gradient colors
  start?: {x: number; y: number};
  end?: {x: number; y: number};
};

const GradientButton: React.FC<GradientButtonProps> = ({
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
  colors = [col.primary_card, col.secondary_Card],
  start = {x: 0, y: 0},
  end = {x: 1, y: 0},
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{borderRadius: 8, overflow: 'hidden'}, style]}>
      <LinearGradient
        colors={disabled ? ['#ccc', '#ccc'] : colors}
        start={start}
        end={end}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Left Icon or Loader */}
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

        {/* Text */}
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

        {/* Right Icon */}
        {rightIcon && (
          <View style={[{marginLeft: 8}, iconStyle]}>{rightIcon}</View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;
