import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import VideoCallIcon from '../../assets/icons/video-call-icon';
import CallIcon from '../../assets/icons/call-icon';

const CALL_DATA = [
  {
    id: '1',
    name: 'Amit Sharma',
    time: 'Today, 10:40 AM',
    avatar: 'https://i.pravatar.cc/150?img=1',
    type: 'voice', // voice | video
    status: 'incoming', // incoming | outgoing | missed
  },
  {
    id: '2',
    name: 'Priya Singh',
    time: 'Yesterday, 08:15 PM',
    avatar: 'https://i.pravatar.cc/150?img=2',
    type: 'video',
    status: 'outgoing',
  },
  {
    id: '3',
    name: 'Rahul Verma',
    time: 'Yesterday, 06:05 PM',
    avatar: 'https://i.pravatar.cc/150?img=3',
    type: 'voice',
    status: 'missed',
  },
];

const CallScreen = () => {
  const renderItem = ({item}: any) => {
    const isMissed = item.status === 'missed';

    return (
      <TouchableOpacity style={styles.callItem}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />

        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.name,
              isMissed && {color: '#E53935'}, // red for missed calls
            ]}>
            {item.name}
          </Text>
          <Text style={styles.subText}>
            {item.status === 'incoming' ? '⬇ Incoming' : null}
            {item.status === 'outgoing' ? '⬆ Outgoing' : null}
            {item.status === 'missed' ? '✕ Missed' : null}
            {'  •  '}
            {item.time}
          </Text>
        </View>

        <View style={styles.rightIcon}>
          <Text style={{fontSize: 18}}>
            {item.type === 'video' ? (
              <VideoCallIcon size={20} />
            ) : (
              <CallIcon size={20} />
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CALL_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
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
  subText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  rightIcon: {
    paddingLeft: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#e5e5e5',
    marginLeft: 80,
  },
});
