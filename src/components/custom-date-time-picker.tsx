import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {verticalScale} from '../utils/sizer';

type Mode = 'date' | 'time' | 'datetime';

interface CustomDateTimeInputProps {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  mode?: Mode;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  rightIcon?: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

const CustomDateTimePicker: React.FC<CustomDateTimeInputProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select',
  containerStyle,
  inputStyle,
  labelStyle,
  rightIcon,
  showError = false,
  errorMessage,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleOpenPicker = () => {
    setFocused(true);
    setShowPicker(true);
  };

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    setShowPicker(Platform.OS === 'ios'); // keep open on iOS, close on Android
    setFocused(false);
  };

  const formattedValue = () => {
    if (!value) return '';
    if (mode === 'time') return value.toLocaleTimeString();
    if (mode === 'datetime') return value.toLocaleString();
    return value.toLocaleDateString();
  };

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

      <TouchableOpacity
        style={[
          styles.inputWrapper,
          {borderColor: focused ? '#007bff' : '#ccc'},
        ]}
        onPress={handleOpenPicker}
        activeOpacity={0.8}>
        <Text
          style={[styles.input, {color: value ? '#000' : '#888'}, inputStyle]}>
          {value ? formattedValue() : placeholder}
        </Text>

        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </TouchableOpacity>

      {showError && errorMessage && (
        <Text style={styles.error}>{errorMessage}</Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode === 'datetime' ? 'date' : mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default CustomDateTimePicker;

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(12),
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 4,
  },
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
});
