import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import React, {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import Input from '../../componentsV1/common/input';
import CustomButton from '../../componentsV1/common/custom-button';

const Login = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  };
  return (
    <View style={{backgroundColor: COLORS.theme.white, flex: 1}}>
      <Image
        style={{position: 'absolute', top: 0, left: 0}}
        source={require('../../assets/imgs/design-2.png')}
      />
      <Text
        style={{
          fontSize: scaleFont(16),
          color: COLORS.theme.white,
          marginTop: verticalScale(54),
          marginLeft: scale(20),
        }}>
        Welcome To
      </Text>
      <Text
        style={{
          fontSize: scaleFont(32),
          fontWeight: 500,
          color: COLORS.theme.white,
          marginLeft: scale(20),
        }}>
        Astroseva
      </Text>
      <View
        style={{
          paddingHorizontal: scale(20),
          marginTop: verticalScale(160),
          // backgroundColor: 'red',
        }}>
        <Input
          preText={'+91'}
          label="Phone Number"
          placeholder="Enter phone number"
          onChangeText={text => handleInputChange('phone', text)}
          value={formData.phone}
          keyboardType="numeric"
          maxLength={10}
          error={errors.phone}
        />
        <Input
          label="Password"
          placeholder="Enter password"
          onChangeText={text => handleInputChange('password', text)}
          value={formData.password}
          secureTextEntry
          error={errors.password}
        />
        <CustomButton
          style={{marginTop: verticalScale(20)}}
          title="Login"
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Home',
            })
          }
        />
      </View>
      <View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}> Register</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Forgot Password?</Text>
          <Pressable
            onPress={() => {
              // navigation.navigate('CustomerSupport')
              navigation.navigate('HomeNew');
            }}>
            <Text style={styles.footerLink}> Need Help</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(24),
  },
  footerText: {
    fontSize: scaleFont(14),
    color: COLORS.theme.black,
  },
  footerLink: {
    fontSize: scaleFont(14),
    color: COLORS.theme.primary,
    fontWeight: 'bold',
  },
});

export default Login;
