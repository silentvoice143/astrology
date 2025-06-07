import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
import React, {useState} from 'react';
import CustomInputV1 from '../components/custom-input-v1';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import CustomButton from '../components/custom-button';
import {colors} from '../constants/colors';
import OtpInput from '../components/otp-input';

const Otp = () => {
  const [phone, setPhone] = useState('');
  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          marginTop: verticalScale(40),
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <Image
          style={{height: moderateScale(110), width: moderateScale(158)}}
          source={require('../assets/imgs/logo.png')}
        />
      </View>
      <View style={styles.formWrapper}>
        <Text style={[textStyle.fs_mont_36_700]}>Otp Verification</Text>
        <Text style={[textStyle.fs_mont_16_400]}>
          Verify your otp sent to +91 1234567890
        </Text>
        <OtpInput
          onOtpChange={text => {
            console.log(text);
          }}
        />
        <CustomButton
          style={{
            marginTop: verticalScale(40),
            backgroundColor: colors.primarybtn,
          }}
          textStyle={{color: colors.primaryText}}
          onPress={() => {}}
          title="Verify"
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: verticalScale(80),
        }}>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryText,

              textAlign: 'center',
            }}>
            Terms & Conditions
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Otp;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(80),
  },
  formWrapper: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(40),
    justifyContent: 'center',
  },
});
