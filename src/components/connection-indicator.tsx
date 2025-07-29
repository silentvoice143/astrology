import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isConnecting: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  isConnecting,
}) => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      blinkAnim.setValue(1); // Reset opacity to 1 when not connecting
    }
  }, [isConnecting]);

  if (isConnecting) {
    return (
      <Animated.View
        style={[styles.dotBase, styles.dotConnecting, {opacity: blinkAnim}]}
      />
    );
  }

  if (isConnected) {
    return <View style={[styles.dotBase, styles.dotConnected]} />;
  }

  return <View style={[styles.dotBase, styles.dotDisconnected]} />;
};

const styles = StyleSheet.create({
  dotBase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    margin: 5,
    alignSelf: 'center',
  },
  dotConnecting: {
    backgroundColor: 'orange',
  },
  dotConnected: {
    backgroundColor: 'green',
  },
  dotDisconnected: {
    backgroundColor: 'red',
  },
});

export default ConnectionStatusIndicator;
