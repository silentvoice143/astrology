// components/Sidebar.tsx
import React, {useRef, useState, useImperativeHandle, forwardRef} from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Text,
  Easing,
} from 'react-native';
import CustomButton from './custom-button';
import {useAppDispatch} from '../hooks/redux-hook';
import {logout} from '../store/reducer/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;

export type SidebarRef = {
  open: () => void;
  close: () => void;
};

const Sidebar = forwardRef<SidebarRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const dispatch = useAppDispatch();

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const open = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0.5,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => setVisible(false));
  };

  if (!visible) return null;

  const handleLogout = async () => {
    try {
      await dispatch(logout());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={close}
      />

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{translateX: sidebarAnim}],
          },
        ]}>
        <CustomButton title="Logout" onPress={handleLogout} />
        <TouchableOpacity onPress={close} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

export default Sidebar;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', // translucent black
    zIndex: 9,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 11,
  },
  sidebarText: {
    fontSize: 20,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'black',
    borderRadius: 6,
  },
  closeText: {
    color: 'white',
    textAlign: 'center',
  },
});
