import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
import React, {useState} from 'react';
import CustomInputV1 from '../components/custom-input-v1';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import CustomButton from '../components/custom-button';
import {colors} from '../constants/colors';

const Login = () => {
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
        <Text style={[textStyle.fs_mont_36_700]}>Login</Text>
        <Text style={[textStyle.fs_mont_16_400]}>Welcome to Astrologer</Text>

        <CustomInputV1
          preText="+91"
          containerStyle={{marginTop: verticalScale(60)}}
          label="Phone Number"
          onChangeText={text => setPhone(text)}
          value={phone}
          keyboardType="numeric"
          maxLength={10}
        />
        <CustomButton
          style={{
            marginTop: verticalScale(40),
            backgroundColor: colors.primarybtn,
          }}
          textStyle={{color: colors.primaryText}}
          onPress={() => {}}
          title="Login"
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

export default Login;

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
