import {View, Text, Image, StyleSheet, Pressable, Alert} from 'react-native';
import React, {useState} from 'react';
import CustomInputV1 from '../../components/custom-input-v1';
import {moderateScale, scale, verticalScale} from '../../utils/sizer';
import {textStyle} from '../../constants/text-style';
import CustomButton from '../../components/custom-button';
import {colors, themeColors} from '../../constants/colors';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../hooks/redux-hook';
import {loginUser, setMobile} from '../../store/reducer/auth';
import Toast from 'react-native-toast-message';
import {loginUserPassword} from '../../store/reducer/auth/action';

const Login = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

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

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    console.log('login..................');

    try {
      setLoading(true);
      const mobile = formData.phone.trim();

      const payload = {mobile, password: formData.password};
      const response = await dispatch(loginUserPassword(payload)).unwrap();
      console.log('Login response:', response);
      if (response.success) {
      }
    } catch (err: any) {
      // Toast.show({type: 'error', text1: err?.message || 'Login failed'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/imgs/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome Back</Text>
      <CustomInputV1
        preText={'+91'}
        containerStyle={{marginTop: verticalScale(60)}}
        label="Phone Number"
        placeholder="Enter phone number"
        onChangeText={text => handleInputChange('phone', text)}
        value={formData.phone}
        keyboardType="numeric"
        maxLength={10}
        errorMessage={errors.phone}
      />
      <CustomInputV1
        label="Password"
        placeholder="Enter password"
        containerStyle={{marginTop: verticalScale(16)}}
        onChangeText={text => handleInputChange('password', text)}
        value={formData.password}
        secureTextEntry
        errorMessage={errors.password}
      />

      <CustomButton
        onPress={handleLogin}
        title="Login"
        style={{
          marginTop: verticalScale(24),
          backgroundColor: themeColors.button.primary,
        }}
        loading={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}> Register</Text>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Forgot Password?</Text>
        <Pressable onPress={() => navigation.navigate('CustomerSupport')}>
          <Text style={styles.footerLink}> Need Help</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(40),
    backgroundColor: themeColors.surface.background,
  },
  logo: {
    width: scale(100),
    height: scale(100),
    alignSelf: 'center',
    marginTop: verticalScale(40),
  },
  title: {
    fontSize: moderateScale(24),
    textAlign: 'center',
    marginTop: verticalScale(16),
    color: themeColors.text.primary,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(24),
  },
  footerText: {
    fontSize: moderateScale(14),
    color: themeColors.text.secondary,
  },
  footerLink: {
    fontSize: moderateScale(14),
    color: themeColors.text.primary,
    fontWeight: 'bold',
  },
});
