import React, {useState, useRef} from 'react';
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import SearchIcon from '../assets/icons/search-icon';

interface AnimatedSearchInputProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  iconPosition?: 'left' | 'right';
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  iconStyle?: ViewStyle;
  animationDuration?: number;
  focusedBorderColor?: string;
  unfocusedBorderColor?: string;
  focusedBorderWidth?: number;
  unfocusedBorderWidth?: number;
  focusedShadowOpacity?: number;
  enableShadow?: boolean;
  shadowColor?: string;
}

const AnimatedSearchInput: React.FC<AnimatedSearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onFocus,
  onBlur,
  iconName = 'search',
  iconSize = 20,
  iconColor = '#666',
  iconPosition = 'left',
  containerStyle = {},
  inputContainerStyle = {},
  inputStyle = {},
  iconStyle = {},
  animationDuration = 200,
  focusedBorderColor = '#007AFF',
  unfocusedBorderColor = '#E0E0E0',
  focusedBorderWidth = 2,
  unfocusedBorderWidth = 1,
  focusedShadowOpacity = 0.2,
  enableShadow = false,
  shadowColor,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleFocus = e => {
    setIsFocused(true);

    // Animate border and shadow
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(scaleValue, {
        toValue: 1.02,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ]).start();

    onFocus && onFocus(e);
  };

  const handleBlur = e => {
    setIsFocused(false);

    // Animate back to normal state
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ]).start();

    onBlur && onBlur(e);
  };

  const animatedBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [unfocusedBorderColor, focusedBorderColor],
  });

  const animatedBorderWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [unfocusedBorderWidth, focusedBorderWidth],
  });

  const animatedShadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, enableShadow ? focusedShadowOpacity : 0],
  });

  const animatedElevation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, enableShadow ? 4 : 0],
  });

  // Use shadowColor prop or derive from border color
  const finalShadowColor = shadowColor || focusedBorderColor;

  const renderIcon = () => (
    <View style={[styles.icon, iconStyle]}>
      <SearchIcon />
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: animatedBorderColor,
            borderWidth: animatedBorderWidth,
            shadowOpacity: animatedShadowOpacity,
            elevation: animatedElevation,
            transform: [{scale: scaleValue}],
          },
          inputContainerStyle,
        ]}>
        {iconPosition === 'left' && renderIcon()}

        <TextInput
          style={[
            styles.textInput,
            iconPosition === 'left' && styles.textInputWithLeftIcon,
            iconPosition === 'right' && styles.textInputWithRightIcon,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />

        {iconPosition === 'right' && renderIcon()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove default padding
  },
  textInputWithLeftIcon: {
    marginLeft: 8,
  },
  textInputWithRightIcon: {
    marginRight: 8,
  },
  icon: {
    opacity: 0.7,
  },
});

export default AnimatedSearchInput;

// Usage Example:
//
// import AnimatedSearchInput from './AnimatedSearchInput';
//
// const App = () => {
//   const [searchText, setSearchText] = useState('');
//
//   return (
//     <View style={{ padding: 20, paddingTop: 60 }}>
//       <AnimatedSearchInput
//         placeholder="Search here for pandits"
//         value={searchText}
//         onChangeText={setSearchText}
//         iconPosition="left"
//         focusedBorderColor="#FFD700"
//         unfocusedBorderColor="#F0E68C"
//         enableShadow={true}
//         containerStyle={{ marginBottom: 20 }}
//         inputContainerStyle={{ backgroundColor: '#FFFEF7' }}
//         iconStyle={{ opacity: 0.8 }}
//       />
//
//       <AnimatedSearchInput
//         placeholder="Search with custom shadow..."
//         value={searchText}
//         onChangeText={setSearchText}
//         iconPosition="right"
//         focusedBorderColor="#4ECDC4"
//         enableShadow={true}
//         shadowColor="#4ECDC4"
//         focusedShadowOpacity={0.3}
//         iconStyle={{ transform: [{ scale: 1.1 }] }}
//       />
//     </View>
//   );
// };
