import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
  StatusBar,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAppSelector} from '../../hooks/redux-hook';
import {COLORS} from '../../constants/colors';
const {height, width} = Dimensions.get('window');
export default function SplashScreen({}) {
  // const route = useRoute();
  // const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(1)).current;
  const {isAuthenticated} = useAppSelector((state: any) => state.auth);
  const publicRoute = ['Login', 'Register'];
  const isPublic = (route: string) => {
    return publicRoute.includes(route);
  };

  useEffect(() => {
    // Run animation then fade out
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 50,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // isAuthenticated && isPublic(route?.name)
        //   ? navigation.reset({
        //       index: 0,
        //       routes: [{name: 'MainTabs'}],
        //     })
        //   : '';
      });
    }, 2000); // Animation duration
  }, []);

  return (
    <Animated.View style={[styles.container, {opacity}]}>
      <StatusBar
        backgroundColor={COLORS.theme.primary}
        barStyle="dark-content"
        animated={true}
      />
      <LottieView
        source={require('../../assets/animation/astro-animation.json')}
        autoPlay
        loop={false}
        style={{height: height * 1.2, width: width}}
      />
      {/* <Text>Loading...</Text> */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height,
    width: width,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
