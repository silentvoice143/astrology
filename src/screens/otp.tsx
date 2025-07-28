import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
import React, {useState} from 'react';
import CustomInputV1 from '../components/custom-input-v1';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import CustomButton from '../components/custom-button';
import {colors} from '../constants/colors';
import OtpInput from '../components/otp-input';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {verifyOtp} from '../store/reducer/auth';
import {UserPersonalDetail} from '../utils/types';

const Otp = () => {
  const {otp, mobile} = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const payload = await dispatch(
        verifyOtp({mobile: mobile, otp: otpInput}),
      ).unwrap();
      if (payload?.success) {
        const user = payload?.user;
        const personalDetail: UserPersonalDetail = {
          name: user.name,
          gender: user.gender,
          birthDate: user.birthDate,
          birthTime: user.birthTime,
          birthPlace: user.birthPlace,
          latitude: user.latitude,
          longitude: user.longitude,
        };
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.mainContainer}>
      <Text
        style={[
          {position: 'absolute', top: 20, left: 40},
          textStyle.fs_abyss_24_400,
        ]}>
        {otp}
      </Text>
      <View
        style={{
          marginTop: verticalScale(40),
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <Image
          style={{height: moderateScale(160), width: moderateScale(158)}}
          source={require('../assets/imgs/logo.png')}
        />
      </View>
      <View style={styles.formWrapper}>
        <Text style={[textStyle.fs_mont_36_700]}>Otp Verification</Text>
        <Text style={[textStyle.fs_mont_16_400]}>
          Verify your otp sent to +91 1234567890
        </Text>
        <OtpInput
          containerStyle={{marginTop: verticalScale(64)}}
          onOtpChange={text => {
            setOtpInput(text);
          }}
        />
        <CustomButton
          loaderColor={colors.primaryText}
          loading={loading}
          style={{
            marginTop: verticalScale(40),
            backgroundColor: colors.primarybtn,
          }}
          textStyle={{color: colors.primaryText}}
          onPress={() => {
            handleVerify();
          }}
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
