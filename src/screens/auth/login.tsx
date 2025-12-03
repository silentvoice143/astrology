import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import Input from '../../componentsV1/common/input';
import CustomButton from '../../componentsV1/common/custom-button';
import {useAppDispatch} from '../../hooks/redux-hook';
import {loginUserPassword} from '../../store/reducer/auth/action';
import EyeOpenIcon from '../../assets/svgs/eye-open-icon';
import EyeCloseIcon from '../../assets/svgs/eye-close-icon';

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
  const [showPass, setShowPass] = useState(false);

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
    <KeyboardAvoidingView style={{flex: 1}}>
      <View style={{backgroundColor: COLORS.theme.white, flex: 1}}>
        <Image
          style={{position: 'absolute', top: -50, left: 0}}
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
            secureTextEntry={showPass ? false : true}
            error={errors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                {!showPass ? (
                  <EyeOpenIcon size={20} color={COLORS.theme.gray.text} />
                ) : (
                  <EyeCloseIcon size={20} color={COLORS.theme.gray.text} />
                )}
              </TouchableOpacity>
            }
          />
          <CustomButton
            disabled={loading}
            style={{marginTop: verticalScale(20)}}
            title={loading ? 'Login...' : 'Login'}
            onPress={handleLogin}
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
                navigation.navigate('CustomerSupport');
                // navigation.navigate('HomeNew');
              }}>
              <Text style={styles.footerLink}> Need Help</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
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
