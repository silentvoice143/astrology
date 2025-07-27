import React, {useState} from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {useAppSelector} from '../hooks/redux-hook';
import ScreenLayout from '../components/screen-layout';
import CustomInput from '../components/custom-input-v2';
import {colors} from '../constants/colors';
import {scaleFont, verticalScale} from '../utils/sizer';

const Payment = () => {
  const {name, mobile} = useAppSelector(store => store.auth);
  const [amount, setAmount] = useState('');

  const handlePayment = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Please enter a valid amount.');
      return;
    }

    const options: any = {
      description: 'Credits towards consultation',
      image: 'https://i.imgur.com/3g7nmJC.jpg',
      currency: 'INR',
      key: 'rzp_test_yauCWFzZA5Tbj3',
      amount: numericAmount * 100, // amount in paise
      name: 'ASTROSEVAA',
      order_id: '',
      prefill: {
        email: '',
        contact: mobile,
        name: name,
      },
      theme: {color: colors.primarybtn},
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        Alert.alert(`Payment Success`, `ID: ${data.razorpay_payment_id}`);
      })
      .catch((error: any) => {
        Alert.alert(`Payment Failed`, `${error.code} | ${error.description}`);
      });
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Enter Amount to Pay</Text>

        <CustomInput
          label="Amount (INR)"
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.button} onPress={handlePayment}>
          <Text style={styles.buttonText}>Make Payment</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  button: {
    backgroundColor: colors.primarybtn,
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    marginTop: verticalScale(16),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
});
