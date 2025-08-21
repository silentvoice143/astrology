import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import CustomInputV1 from '../../components/custom-input-v1';
import {moderateScale, scale, verticalScale} from '../../utils/sizer';
import {textStyle} from '../../constants/text-style';
import CustomButton from '../../components/custom-button';
import {colors, themeColors} from '../../constants/colors';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../hooks/redux-hook';
import {registerUser} from '../../store/reducer/auth/action';
import Toast from 'react-native-toast-message';
// import {registerUser} from '../../store/slices/authSlice'; // Uncomment if needed

type formDataType = {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

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

  const [loading, setLoading] = useState(false);

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
      console.log('calling this api');
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
        navigateToLogin();
      }
    } catch (err: any) {
      console.log(err, '<<<< REGISTER ERROR');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.mainContainer}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('../../assets/imgs/logo.png')}
          />
        </View>

        <View style={styles.formWrapper}>
          <Text style={[textStyle.fs_mont_36_700]}>Register</Text>
          <Text style={[textStyle.fs_mont_16_400]}>
            Create your Astrosevaa account
          </Text>

          <CustomInputV1
            showError={!!errors.fullName}
            containerStyle={{marginTop: verticalScale(40)}}
            label="Full Name"
            placeholder="Enter your full name"
            onChangeText={text => handleInputChange('fullName', text)}
            value={formData.fullName}
            errorMessage={errors.fullName}
          />

          <CustomInputV1
            showError={!!errors.phone}
            preText="+91"
            containerStyle={{marginTop: verticalScale(20)}}
            label="Phone Number"
            placeholder="Enter your phone number"
            onChangeText={text => handleInputChange('phone', text)}
            value={formData.phone}
            keyboardType="phone-pad"
            errorMessage={errors.phone}
            maxLength={10}
          />

          <CustomInputV1
            showError={!!errors.password}
            containerStyle={{marginTop: verticalScale(20)}}
            label="Password"
            placeholder="Enter password"
            onChangeText={text => handleInputChange('password', text)}
            value={formData.password}
            secureTextEntry
            errorMessage={errors.password}
          />

          <CustomInputV1
            showError={!!errors.confirmPassword}
            containerStyle={{marginTop: verticalScale(20)}}
            label="Confirm Password"
            placeholder="Confirm your password"
            onChangeText={text => handleInputChange('confirmPassword', text)}
            value={formData.confirmPassword}
            secureTextEntry
            errorMessage={errors.confirmPassword}
          />

          <CustomButton
            loaderColor={colors.primaryText}
            loading={loading}
            style={styles.registerButton}
            textStyle={{color: themeColors.text.light}}
            onPress={handleRegister}
            title="Register"
          />

          <Pressable onPress={navigateToLogin} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.termsContainer}>
          <Pressable style={styles.termsButton}>
            <Text style={styles.termsText}>Terms & Conditions</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Register;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(40),
  },
  logoContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logo: {
    height: moderateScale(60),
    width: moderateScale(54),
  },
  formWrapper: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(40),
    justifyContent: 'center',
  },
  registerButton: {
    marginTop: verticalScale(30),
    backgroundColor: themeColors.button.primary,
  },
  loginLink: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  loginLinkText: {
    color: themeColors.text.secondary,
    fontSize: moderateScale(14),
  },
  loginLinkBold: {
    color: themeColors.text.primary,
    fontWeight: 'bold',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    color: colors.primaryText,
    textAlign: 'center',
  },
});
