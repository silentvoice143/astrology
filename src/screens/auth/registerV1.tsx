import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {scale, scaleFont, verticalScale} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';
import Input from '../../componentsV1/common/input';
import CustomButton from '../../componentsV1/common/custom-button';
import Toast from 'react-native-toast-message';
import {registerUser} from '../../store/reducer/auth/action';
import {useAppDispatch} from '../../hooks/redux-hook';
import EyeOpenIcon from '../../assets/svgs/eye-open-icon';
import EyeCloseIcon from '../../assets/svgs/eye-close-icon';

type formDataType = {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState<formDataType>({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<formDataType>({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: formDataType = {
      fullName: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    console.log(newErrors, '<<<< VALIDATED ERRORS');

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleInputChange = (field: keyof formDataType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      console.log('calling this api', formData);
      setLoading(true);
      const payload = await dispatch(
        registerUser({
          name: formData.fullName.trim(),
          mobile: formData.phone,
          password: formData.password,
        }),
      ).unwrap();

      if (payload.success) {
        Toast.show({
          type: 'error',
          text1: 'Registration Successful',
        });
        navigation.navigate('Login');
      }
    } catch (err: any) {
      console.log(err, '<<<< REGISTER ERROR');
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
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
            Astrosevaa
          </Text>
          <View
            style={{
              paddingHorizontal: scale(20),
              marginTop: verticalScale(100),
              // backgroundColor: 'red',
            }}>
            <Input
              label="Full Name"
              placeholder="Enter full name"
              onChangeText={text => handleInputChange('fullName', text)}
              value={formData.fullName}
              maxLength={30}
              error={errors.fullName}
            />
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
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    {!showPass ? (
                      <EyeOpenIcon size={20} color={COLORS.theme.gray.text} />
                    ) : (
                      <EyeCloseIcon size={20} color={COLORS.theme.gray.text} />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              }
            />
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              onChangeText={text => handleInputChange('confirmPassword', text)}
              value={formData.confirmPassword}
              secureTextEntry={showConfirmPass ? false : true}
              error={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPass(!showConfirmPass)}>
                  <TouchableOpacity
                    onPress={() => setShowConfirmPass(!showConfirmPass)}>
                    {!showConfirmPass ? (
                      <EyeOpenIcon size={20} color={COLORS.theme.gray.text} />
                    ) : (
                      <EyeCloseIcon size={20} color={COLORS.theme.gray.text} />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              }
            />
            <CustomButton
              disabled={loading}
              style={{marginTop: verticalScale(20)}}
              title={loading ? 'Register...' : 'Register'}
              onPress={handleRegister}
            />
          </View>
          <View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> Login</Text>
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
      </ScrollView>
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

export default Register;
