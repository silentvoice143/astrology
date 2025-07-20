import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Dimensions,
  ViewStyle,
} from 'react-native';
import {themeColors} from '../constants/colors';

const {width} = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
  onClose?: () => void;
};

const toastColors = {
  success: themeColors.status.success.base,
  error: themeColors.status.error.base,
  info: themeColors.status.warning.base,
};

let toastRef: ((config: ToastProps) => void) | null = null;

export const showToast = (config: ToastProps) => {
  if (toastRef) {
    toastRef(config);
  }
};

const Toast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [onClose, setOnClose] = useState<() => void>();
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    toastRef = show;
    return () => {
      toastRef = null;
    };
  }, []);

  const show = ({
    message,
    type = 'info',
    duration = 3000,
    position = 'bottom',
    onClose,
  }: ToastProps) => {
    setMessage(message);
    setType(type);
    setPosition(position);
    setOnClose(() => onClose);
    setVisible(true);

    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hide();
    }, duration);
  };

  const hide = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onClose?.();
    });
  };

  if (!visible) return null;

  const containerStyle: ViewStyle = {
    backgroundColor: toastColors[type],
    transform: [{translateY}],
    position: 'absolute',
    [position]: 40,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: width * 0.8,
    elevation: 5,
  };

  return (
    <Animated.View style={containerStyle}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default Toast;
