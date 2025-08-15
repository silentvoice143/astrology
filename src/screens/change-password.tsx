import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import {textStyle} from '../constants/text-style';
import {themeColors} from '../constants/colors';
import Toast from 'react-native-toast-message';
import {passwordReset} from '../store/reducer/settings';
import {useAppDispatch} from '../hooks/redux-hook';

type FormFields = 'currentPassword' | 'newPassword' | 'confirmPassword';
type PasswordField = 'current' | 'new' | 'confirm';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

const ChangePassword = () => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const validateCurrentPassword = (password: string): string => {
    if (!password.trim()) return 'Current password is required';
    return '';
  };

  const validateNewPassword = (password: string): string => {
    if (!password.trim()) return 'New password is required';
    if (password.length < 8) return 'Must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Must contain lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Must contain uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Must contain a number';
    if (!/(?=.*[@$!%*?&])/.test(password))
      return 'Must contain special character';
    return '';
  };

  const validateConfirmPassword = (
    confirmPass: string,
    newPass: string,
  ): string => {
    if (!confirmPass.trim()) return 'Please confirm new password';
    if (confirmPass !== newPass) return 'Passwords do not match';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {
      currentPassword: validateCurrentPassword(formData.currentPassword),
      newPassword: validateNewPassword(formData.newPassword),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.newPassword,
      ),
    };

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword = 'New password must differ from current password';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleInputChange = (field: FormFields, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const togglePasswordVisibility = (field: PasswordField) => {
    setShowPasswords(prev => ({...prev, [field]: !prev[field]}));
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const body = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };
      const payload = await dispatch(passwordReset(body)).unwrap();

      if (payload.success) {
        Toast.show({
          type: 'success',
          text1: 'Password changed successfully',
        });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to change password',
        text2: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    field: FormFields,
    placeholder: string,
    showPasswordField: PasswordField,
  ) => (
    <View style={{marginBottom: 20}}>
      <Text
        style={[
          textStyle.fs_mont_16_600,
          {marginBottom: 8, color: themeColors.text?.primary},
        ]}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: errors[field]
            ? '#FF4444'
            : themeColors.border.primary || '#E0E0E0',
          borderRadius: 8,
          backgroundColor: themeColors.surface.background,
        }}>
        <TextInput
          style={[
            textStyle.fs_abyss_16_400,
            {
              flex: 1,
              paddingHorizontal: 15,
              paddingVertical: 12,
              color: themeColors.text?.primary,
            },
          ]}
          value={formData[field]}
          onChangeText={value => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={themeColors.text?.muted || '#999'}
          secureTextEntry={!showPasswords[showPasswordField]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => togglePasswordVisibility(showPasswordField)}
          style={{paddingHorizontal: 15, paddingVertical: 12}}>
          <Text style={{color: themeColors.text.primary, fontSize: 14}}>
            {showPasswords[showPasswordField] ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>
      {errors[field] && (
        <Text style={{color: '#FF4444', fontSize: 12, marginTop: 5}}>
          {errors[field]}
        </Text>
      )}
    </View>
  );

  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.background}>
      <ScrollView
        contentContainerStyle={{padding: 20, paddingBottom: 40}}
        showsVerticalScrollIndicator={false}>
        <View style={{marginBottom: 30}}>
          <Text
            style={[
              textStyle.fs_mont_28_600,
              {color: themeColors.text?.primary, marginBottom: 8},
            ]}>
            Change Password
          </Text>
          <Text
            style={[
              textStyle.fs_abyss_16_400,
              {color: themeColors.text?.secondary, lineHeight: 22},
            ]}>
            Please enter your current password and choose a new secure password.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: themeColors.surface.background,
            padding: 20,
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
          {renderPasswordInput(
            'Current Password',
            'currentPassword',
            'Enter current password',
            'current',
          )}
          {renderPasswordInput(
            'New Password',
            'newPassword',
            'Enter new password',
            'new',
          )}
          {renderPasswordInput(
            'Confirm New Password',
            'confirmPassword',
            'Confirm new password',
            'confirm',
          )}

          <View
            style={{
              backgroundColor: themeColors.surface.background,
              padding: 15,
              borderRadius: 8,
              marginBottom: 25,
            }}>
            <Text
              style={[
                textStyle.fs_mont_14_600,
                {color: themeColors.text?.primary, marginBottom: 8},
              ]}>
              Password Requirements:
            </Text>
            <Text
              style={[
                textStyle.fs_abyss_12_400,
                {color: themeColors.text?.secondary, lineHeight: 18},
              ]}>
              • At least 8 characters{'\n'}• One uppercase letter (A-Z)
              {'\n'}• One lowercase letter (a-z){'\n'}• One number (0-9)
              {'\n'}• One special character (@$!%*?&)
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading
                ? themeColors.button.muted
                : themeColors.button.primary,
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{marginRight: 10}}
              />
            )}
            <Text style={[textStyle.fs_mont_18_600, {color: '#FFFFFF'}]}>
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default ChangePassword;
