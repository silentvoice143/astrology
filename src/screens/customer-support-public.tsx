import {View, Text, TouchableOpacity, Linking, Alert} from 'react-native';
import React from 'react';
import ScreenLayout from '../components/screen-layout';
import {textStyle} from '../constants/text-style';
import {themeColors} from '../constants/colors';

const CustomerSupportPublic = () => {
  const supportNumber = '+91 9064844148'; // Replace with your actual support number

  const handleCallPress = () => {
    const phoneNumber = `tel:${supportNumber}`;

    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneNumber);
        } else {
          Alert.alert(
            'Phone Not Available',
            'Phone calls are not supported on this device',
          );
        }
      })
      .catch(err => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Unable to open phone dialer');
      });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: themeColors.surface.background,
      }}>
      {/* Header */}
      <Text
        style={[
          textStyle.fs_abyss_32_400,
          {
            marginBottom: 30,
            textAlign: 'center',
          },
        ]}>
        Customer Support
      </Text>

      {/* Support Info */}
      <View
        style={{
          backgroundColor: themeColors.surface.highlight || '#f5f5f5',
          padding: 30,
          borderRadius: 12,
          alignItems: 'center',
          width: '100%',
          maxWidth: 350,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
        <Text
          style={[
            textStyle.fs_abyss_18_400 || {fontSize: 18},
            {
              marginBottom: 20,
              textAlign: 'center',
              color: themeColors.text?.secondary || '#666',
            },
          ]}>
          Need help? Our support team is here for you.
        </Text>

        <Text
          style={[
            textStyle.fs_abyss_16_400 || {fontSize: 16},
            {
              marginBottom: 15,
              textAlign: 'center',
              color: themeColors.text?.primary || '#333',
            },
          ]}>
          Call us at:
        </Text>

        {/* Phone Number Display */}
        <Text
          style={[
            textStyle.fs_mont_28_600 || {fontSize: 28, fontWeight: '600'},
            {
              marginBottom: 25,
              color: themeColors.text.primary || '#007AFF',
              textAlign: 'center',
            },
          ]}>
          {supportNumber}
        </Text>

        {/* Call Button */}
        <TouchableOpacity
          onPress={handleCallPress}
          style={{
            backgroundColor: themeColors.button.primary || '#007AFF',
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderRadius: 8,
            width: '100%',
            alignItems: 'center',
          }}
          activeOpacity={0.8}>
          <Text
            style={[
              textStyle.fs_mont_16_400 || {fontSize: 18, fontWeight: '600'},
              {
                color: '#FFFFFF',
              },
            ]}>
            Call Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Support Hours */}
      <View
        style={{
          marginTop: 30,
          alignItems: 'center',
        }}>
        <Text
          style={[
            textStyle.fs_mont_16_600 || {fontSize: 16, fontWeight: '600'},
            {
              marginBottom: 10,
              color: themeColors.text?.primary || '#333',
            },
          ]}>
          Support Hours
        </Text>
        <Text
          style={[
            textStyle.fs_abyss_14_400 || {fontSize: 14},
            {
              textAlign: 'center',
              color: themeColors.text?.secondary || '#666',
              lineHeight: 20,
            },
          ]}>
          Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
          Saturday: 10:00 AM - 4:00 PM{'\n'}
          Sunday: Closed
        </Text>
      </View>
    </View>
  );
};

export default CustomerSupportPublic;
