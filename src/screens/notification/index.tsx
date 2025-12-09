import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import PageWithHeader from '../../componentsV1/layout/page-with-header';

const NOTIFICATION_DATA = [
  {
    id: '1',
    userId: 'u1',
    title: 'New Message',
    body: 'Rahul: Hey, are you free?',
    type: 'CHAT',
    data: {chatId: 'c22', screen: 'ChatScreen'},
    isRead: false,
    isDelivered: true,
    priority: 'HIGH',
    createdAt: '10:45 AM',
  },
  {
    id: '2',
    userId: 'u1',
    title: 'Missed Call',
    body: 'You missed a call from Priya',
    type: 'CALL',
    data: {callId: 'call55', screen: 'CallScreen'},
    isRead: false,
    isDelivered: true,
    priority: 'HIGH',
    createdAt: 'Yesterday',
  },
  {
    id: '3',
    userId: 'u1',
    title: 'Booking Confirmed',
    body: 'Your astrologer session is confirmed',
    type: 'BOOKING',
    data: {bookingId: 'b12', screen: 'BookingDetail'},
    isRead: true,
    isDelivered: true,
    priority: 'LOW',
    createdAt: '2 days ago',
  },
  {
    id: '4',
    userId: 'u1',
    title: 'Wallet Credited',
    body: '₹250 added to your wallet',
    type: 'PAYMENT',
    data: {},
    isRead: true,
    isDelivered: true,
    priority: 'LOW',
    createdAt: '3 days ago',
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CHAT':
      return '#25D366';
    case 'CALL':
      return '#2196F3';
    case 'PAYMENT':
      return '#FF9800';
    case 'BOOKING':
      return '#9C27B0';
    default:
      return '#607D8B';
  }
};

const Notification = () => {
  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}>
        <View
          style={[
            styles.typeBadge,
            {backgroundColor: getTypeColor(item.type)},
          ]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.time}>{item.createdAt}</Text>

          {!item.isRead && <View style={styles.unreadDot} />}

          {item.priority === 'HIGH' && (
            <Text style={styles.highPriority}>!</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageWithHeader
      title="Notifications"
      themeMode="light"
      scrollEnabled={false}>
      <View style={styles.container}>
        <FlatList
          data={NOTIFICATION_DATA}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      </View>
    </PageWithHeader>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  unreadNotification: {
    backgroundColor: '#F4FAFF',
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },

  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  centerContainer: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  body: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  rightContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  time: {
    fontSize: 11,
    color: '#888',
  },

  unreadDot: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },

  highPriority: {
    marginTop: 4,
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 14,
  },

  divider: {
    height: 0.5,
    backgroundColor: '#e5e5e5',
    marginLeft: 70,
  },
});
