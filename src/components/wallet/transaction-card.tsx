import {StyleSheet, Text, View} from 'react-native';
import {Transaction} from '../../utils/types';
import {scale, verticalScale} from '../../utils/sizer';
import {formatRelativeDate} from '../../utils/utils';

const WalletTransactionCard = ({transaction}: {transaction: Transaction}) => {
  const isCredit = transaction.type === 'CREDIT';

  return (
    <View style={styles.cardContainer}>
      <View style={{flex: 1}}>
        <Text style={styles.title}>{transaction.type}</Text>
        <Text style={styles.description}>{transaction.description}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.dateText}>
          {formatRelativeDate(transaction.timestamp)}
        </Text>
        <Text
          style={[styles.amount, {color: isCredit ? '#28a745' : '#d32f2f'}]}>
          ₹{Math.abs(transaction.amount).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export default WalletTransactionCard;

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
