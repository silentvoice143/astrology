import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import {colors, themeColors} from '../constants/colors';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import CustomButton from '../components/custom-button';
import AnimatedSearchInput from '../components/custom-searchbox';
import {Transaction} from '../utils/types';
import WalletTransactionCard from '../components/wallet/transaction-card';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {RootState} from '../store';
import {getTransactionHistory} from '../store/reducer/payment';
import Toast from 'react-native-toast-message';
import AboutIcon from '../assets/icons/about-icon';
import RazorpayCheckout from 'react-native-razorpay';
import CustomInputV1 from '../components/custom-input-v1';
import {getWithdrawalRequest, postTopUp} from '../store/reducer/payment/action';
import {useUserRole} from '../hooks/use-role';
import {showToast} from '../components/toast';

const Wallet = () => {
  const onEndReachedCalledDuringMomentum = useRef(false);
  const {id} = useAppSelector((state: RootState) => state.auth.user);
  const [amount, setAmount] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState(0);
  const role = useUserRole();
  const {name, mobile} = useAppSelector(store => store.auth);
  const [transactions, setTransations] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useAppDispatch();

  const getTransactionDetails = async (page: number = 1) => {
    if (loading || !hasMore) return;
    try {
      const payload = await dispatch(
        getTransactionHistory({userId: id, query: `?page=${page}`}),
      ).unwrap();

      if (payload.success) {
        setWalletBalance(payload?.wallet?.balance ?? 0);
        if (page === 1) {
          setTransations(payload?.wallet?.transactions);
        } else {
          setTransations(prev => [...prev, ...payload?.wallet?.transactions]);
        }
        setCurrentPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to get transactions',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to get transactions',
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentHandler = async (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid amount.',
      });
      return;
    }

    try {
      const payload = await dispatch(postTopUp(amount)).unwrap();

      if (payload.success) {
        const orderDetails = JSON.parse(payload?.order);
        const options: any = {
          description: 'Credits towards consultation',
          image: 'https://astrosevaa-admin.vercel.app/assets/logo-C7bpBiI4.png',
          currency: 'INR',
          key: 'rzp_test_yauCWFzZA5Tbj3',
          amount: orderDetails.amount_due,
          name: 'ASTROSEVAA',
          order_id: orderDetails.id,
          prefill: {
            email: '',
            contact: mobile,
            name: name,
          },
          theme: {color: colors.primarybtn},
          method: {
            netbanking: true,
            card: true,
            upi: true,
            wallet: true,
            emi: false,
            paylater: true,
          },
        };

        RazorpayCheckout.open(options)
          .then((data: any) => {
            Toast.show({
              type: 'success',
              text1: `Payment Successful`,
              text2: `Payment ID: ${data.razorpay_payment_id}`,
            });
            setAmount('');
            getTransactionDetails(1);
          })
          .catch((error: any) => {
            Toast.show({
              type: 'error',
              text1: 'Payment Failed',
              text2: `${error.code} | ${error.description}`,
            });
            setAmount('');
            getTransactionDetails(1);
          });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to initiate top-up',
        });
      }
    } catch (error) {
      console.error('TopUp Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment initiation failed',
      });
    }
  };

  const handelWithdraw = async (amount: number) => {
    try {
      const payload = await dispatch(getWithdrawalRequest(amount)).unwrap();
      if (payload?.success) {
        Toast.show({
          type: 'success',
          text1: payload?.msg,
        });
        setAmount('');
        getTransactionDetails(1);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message,
      });
    }
  };

  useEffect(() => {
    getTransactionDetails(1);
  }, []);

  return (
    <ScreenLayout>
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingVertical: verticalScale(20),
          flex: 1,
        }}>
        <View
          style={{
            backgroundColor: colors.primary_surface_2,
            padding: moderateScale(20),
            borderRadius: moderateScale(10),
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              style={[textStyle.fs_abyss_14_400, {color: colors.whiteText}]}>
              Total Balance
            </Text>
            <Text
              style={[textStyle.fs_abyss_24_400, {color: colors.whiteText}]}>
              ₹{Math.abs(walletBalance)}
            </Text>
          </View>
          {role === 'USER' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: verticalScale(12),
              }}>
              <View style={{flex: 1, marginRight: scale(8)}}>
                <CustomInputV1
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  inputStyle={{
                    fontSize: scale(14),
                    paddingVertical: 6,
                    color: '#fff',
                  }}
                />
              </View>
              <CustomButton
                style={{
                  backgroundColor: colors.primary_surface,
                  borderRadius: scale(24),
                  paddingHorizontal: scale(16),
                  paddingVertical: verticalScale(10),
                }}
                textStyle={{color: colors.primaryText, fontWeight: '600'}}
                title="Add Balance"
                onPress={() => {
                  const numericAmount = parseFloat(amount);
                  paymentHandler(numericAmount);
                }}
              />
            </View>
          )}
          {role === 'ASTROLOGER' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: verticalScale(12),
              }}>
              <View style={{flex: 1, marginRight: scale(8)}}>
                <CustomInputV1
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  inputStyle={{
                    fontSize: scale(14),
                    paddingVertical: 6,
                    color: '#fff',
                  }}
                />
              </View>
              <CustomButton
                style={{
                  backgroundColor: colors.primary_surface,
                  borderRadius: scale(24),
                  paddingHorizontal: scale(16),
                  paddingVertical: verticalScale(10),
                  marginTop: verticalScale(4),
                }}
                textStyle={{color: colors.primaryText, fontWeight: '600'}}
                title="Withdraw"
                onPress={() => {
                  const numericAmount = parseFloat(amount);
                  handelWithdraw(numericAmount);
                }}
              />
            </View>
          )}
        </View>
        <View style={{marginTop: verticalScale(24), flex: 1}}>
          <Text style={[textStyle.fs_abyss_20_400]}>Transactions</Text>
          <View style={[{marginVertical: verticalScale(20)}]}>
            <AnimatedSearchInput
              placeholder={'Search for transactions..'}
              unfocusedBorderColor={colors.primaryText}
              enableShadow={true}
              focusedBorderColor={colors.primaryText}
            />
          </View>

          <View style={{flex: 1}}>
            <FlatList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <WalletTransactionCard transaction={item} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{
                paddingBottom: scale(16),
                paddingHorizontal: scale(4),
              }}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (!onEndReachedCalledDuringMomentum.current && hasMore) {
                  getTransactionDetails(currentPage + 1);
                  onEndReachedCalledDuringMomentum.current = true;
                }
              }}
              onMomentumScrollBegin={() => {
                onEndReachedCalledDuringMomentum.current = false;
              }}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loading ? (
                  <View
                    style={{
                      flex: 1,
                      minHeight: 400,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <ActivityIndicator
                      size="small"
                      style={{marginVertical: 10}}
                    />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View
                    style={{
                      height: verticalScale(400),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <AboutIcon color={themeColors.status.info.dark} />
                    <Text style={[textStyle.fs_mont_16_500]}>
                      No Transaction Yet
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: scale(16),
  },

  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#000',
  },
  description: {
    fontSize: scale(12),
    color: '#666',
    marginTop: verticalScale(4),
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: scale(11),
    color: '#999',
  },
  amount: {
    fontSize: scale(15),
    fontWeight: '600',
    marginTop: verticalScale(12),
  },
});
