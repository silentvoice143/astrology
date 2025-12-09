import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const CHAT_DATA = [
  {
    id: '1',
    name: 'Amit Sharma',
    message: 'Hello, how are you?',
    time: '10:45 AM',
    avatar: 'https://i.pravatar.cc/150?img=1',
    unread: 2,
  },
  {
    id: '2',
    name: 'Priya Singh',
    message: 'Let’s meet tomorrow',
    time: '09:20 AM',
    avatar: 'https://i.pravatar.cc/150?img=2',
    unread: 0,
  },
  {
    id: '3',
    name: 'Rahul Verma',
    message: 'Call me when free',
    time: 'Yesterday',
    avatar: 'https://i.pravatar.cc/150?img=3',
    unread: 5,
  },
];

const ChatScreen = () => {
  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity style={styles.chatItem}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />

        <View style={styles.centerContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.time}>{item.time}</Text>

          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CHAT_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  centerContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  message: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 11,
    color: '#666',
  },
  unreadBadge: {
    marginTop: 6,
    backgroundColor: '#25D366',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#e5e5e5',
    marginLeft: 80,
  },
});
