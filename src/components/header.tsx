import {View, Text, Pressable, StyleSheet, Image} from 'react-native';
import React from 'react';
import MenuIcon from '../assets/icons/menu-icon';
import {scale, verticalScale} from '../utils/sizer';

const Header = () => {
  return (
    <View style={styles.container}>
      {/* Background Image positioned absolutely and centered */}
      <Image
        source={require('../assets/imgs/bg-img.png')}
        style={styles.bgImage}
        resizeMode="contain"
      />

      {/* Foreground content */}
      <Pressable>
        <MenuIcon />
      </Pressable>
      <Pressable
        style={{
          height: 60,
          width: 60,
          borderRadius: 30,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Text>SK</Text>
      </Pressable>
    </View>
  );
};

export default Header;

const IMAGE_WIDTH = scale(216); // adjust this to your desired width
const IMAGE_HEIGHT = verticalScale(80); // adjust this to your desired height

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    transform: [{translateX: -IMAGE_WIDTH / 2}],
    zIndex: 3, // send behind other elements
  },
});
