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
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isConnecting || isConnected) {
      // Create wave animations with staggered timing
      const createWaveAnimation = (
        animatedValue: Animated.Value,
        delay: number,
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      Animated.parallel([
        createWaveAnimation(wave1, 0),
        createWaveAnimation(wave2, 200),
        createWaveAnimation(wave3, 400),
      ]).start();
    } else {
      // Reset all waves when disconnected
      wave1.setValue(0);
      wave2.setValue(0);
      wave3.setValue(0);
    }
  }, [isConnecting, isConnected, wave1, wave2, wave3]);

  // If connecting or connected → show wave animation
  if (isConnecting || isConnected) {
    const color = isConnected ? 'green' : 'orange';
    return (
      <View style={styles.waveContainer}>
        <View style={[styles.dotBase, {backgroundColor: color, zIndex: 10}]} />
        {[wave1, wave2, wave3].map((wave, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveRing,
              {
                borderColor: color,
                opacity: wave.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7 - index * 0.2, 0],
                }),
                transform: [
                  {
                    scale: wave.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2.5],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  }

  // If disconnected
  return <View style={[styles.dotBase, styles.dotDisconnected]} />;
};

const styles = StyleSheet.create({
  waveContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dotBase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    margin: 5,
    alignSelf: 'center',
  },
  dotDisconnected: {
    backgroundColor: 'red',
  },
  waveRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

export default ConnectionStatusIndicator;
