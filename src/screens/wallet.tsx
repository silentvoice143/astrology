import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import React from 'react';
import ScreenLayout from '../components/screen-layout';
import {colors} from '../constants/colors';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {textStyle} from '../constants/text-style';
import CustomButton from '../components/custom-button';
import AnimatedSearchInput from '../components/custom-searchbox';
import {Transaction} from '../utils/types';
import WalletTransactionCard from '../components/wallet/transaction-card';
import {useAppSelector} from '../hooks/redux-hook';
import {RootState} from '../store';

const transactions: Transaction[] = [
  {
    id: 'txn1',
    title: 'Money added',
    description: 'Money added to wallet',
    amount: 2000,
    type: 'credit',
    date: '04 March 2025',
  },
  {
    id: 'txn2',
    title: 'Payment sent',
    description: 'Sent to Akash Mehta',
    amount: -750,
    type: 'debit',
    date: '03 March 2025',
  },
  {
    id: 'txn3',
    title: 'Money added',
    description: 'Money added via UPI',
    amount: 1500,
    type: 'credit',
    date: '02 March 2025',
  },
  {
    id: 'txn4',
    title: 'Cashback received',
    description: 'March offer cashback',
    amount: 100,
    type: 'credit',
    date: '01 March 2025',
  },
  {
    id: 'txn5',
    title: 'Subscription payment',
    description: 'Netflix monthly billing',
    amount: -499,
    type: 'debit',
    date: '28 February 2025',
  },
  {
    id: 'txn7',
    title: 'Subscription payment',
    description: 'Netflix monthly billing',
    amount: -499,
    type: 'debit',
    date: '28 February 2025',
  },
  {
    id: 'txn6',
    title: 'Subscription payment',
    description: 'Netflix monthly billing',
    amount: -499,
    type: 'debit',
    date: '28 February 2025',
  },
  {
    id: 'txn8',
    title: 'Subscription payment',
    description: 'Netflix monthly billing',
    amount: -499,
    type: 'debit',
    date: '28 February 2025',
  },
  {
    id: 'txn9',
    title: 'Subscription payment',
    description: 'Netflix monthly billing',
    amount: -499,
    type: 'debit',
    date: '28 February 2025',
  },
];

const Wallet = () => {
  const wallet_balance = useAppSelector(
    (state: RootState) => state.auth.user.walletBalance,
  );

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
              ₹{Math.abs(wallet_balance)}
            </Text>
          </View>
          <View style={{width: 140, height: 40}}>
            <CustomButton
              style={{
                backgroundColor: colors.primary_surface,
                borderRadius: scale(24),
              }}
              textStyle={[{color: colors.primaryText, lineHeight: 20}]}
              title="Add Balance"
              onPress={() => {}}
            />
          </View>
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
                paddingHorizontal: scale(4), // optional
              }}
              showsVerticalScrollIndicator={false}
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
