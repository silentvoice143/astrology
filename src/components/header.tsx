import React, {useEffect, useRef} from 'react';
import {View, Text, Pressable, StyleSheet, Image, Animated} from 'react-native';
import MenuIcon from '../assets/icons/menu-icon';
import {scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';

const Header = ({headerBackgroundColor}: {headerBackgroundColor: string}) => {
  const animatedBg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedBg, {
      toValue: headerBackgroundColor === 'transparent' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [headerBackgroundColor]);

  const backgroundColor = animatedBg.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', colors.secondary_surface], // or your solid bg
  });

  return (
    <Animated.View style={[styles.container, {backgroundColor}]}>
      {/* Background Image */}
      <Image
        source={require('../assets/imgs/bg-img.png')}
        style={[styles.bgImage]}
        resizeMode="contain"
      />

      {/* Foreground content */}
      <Pressable>
        <MenuIcon />
      </Pressable>
      <Pressable style={styles.avatar}>
        <Text>SK</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: '60%',
    width: scale(216),
    height: verticalScale(80),
    transform: [{translateX: -scale(216) / 2}],
    zIndex: 3,
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
