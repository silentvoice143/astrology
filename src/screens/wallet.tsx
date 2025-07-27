import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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
import {showToast} from '../components/toast';
import Toast from 'react-native-toast-message';
import AboutIcon from '../assets/icons/about-icon';

const Wallet = () => {
  const onEndReachedCalledDuringMomentum = useRef(false);
  const {walletBalance, id} = useAppSelector(
    (state: RootState) => state.auth.user,
  );

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
