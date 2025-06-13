import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import ChatHistoryCard from '../components/ChatHistoryCard';
import CallHistoryCard from '../components/CallHistoryCard';
import {scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import AnimatedSearchInput from '../components/custom-searchbox';

// Define types for better TypeScript support
interface MessageItem {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: {
    uri: string;
  };
}

interface CallItem {
  id: string;
  name: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  time: string;
  avatar: {
    uri: string;
  };
}

const dummyMessageData: MessageItem[] = [
  {
    id: '1',
    name: 'Ayesha Sharma',
    message: 'Hii, I am good to go',
    time: '3:39 PM',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=80&h=80',
    },
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    message: 'Thanks for the session!',
    time: 'Yesterday',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80',
    },
  },
  {
    id: '3',
    name: 'Priya Singh',
    message: 'When is my next reading?',
    time: 'Yesterday',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1494790108755-2616b612d7c5?auto=format&fit=crop&w=80&h=80',
    },
  },
];

const dummyCallData: CallItem[] = [
  {
    id: '1',
    name: 'Ayesha Sharma',
    callType: 'incoming',
    duration: '15:30',
    time: '2:45 PM',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=80&h=80',
    },
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    callType: 'outgoing',
    duration: '8:45',
    time: 'Yesterday',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80',
    },
  },
  {
    id: '3',
    name: 'Priya Singh',
    callType: 'missed',
    duration: '0:00',
    time: 'Yesterday',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1494790108755-2616b612d7c5?auto=format&fit=crop&w=80&h=80',
    },
  },
  {
    id: '4',
    name: 'Amit Patel',
    callType: 'incoming',
    duration: '22:15',
    time: '2 days ago',
    avatar: {
      uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80',
    },
  },
];

const ChatHistory = () => {
  const [search, setSearch] = useState('');
  const [headerBgColor] = useState(colors.background);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'calls'

  const renderMessageItem = ({item}: {item: MessageItem}) => (
    <ChatHistoryCard
      name={item.name}
      message={item.message}
      time={item.time}
      avatar={item.avatar}
    />
  );

  const renderCallItem = ({item}: {item: CallItem}) => (
    <CallHistoryCard
      name={item.name}
      callType={item.callType}
      duration={item.duration}
      time={item.time}
      avatar={item.avatar}
    />
  );

  const getPlaceholderText = () => {
    return activeTab === 'messages'
      ? 'Search for messages...'
      : 'Search for calls...';
  };

  return (
    <ScreenLayout headerBackgroundColor={headerBgColor}>
      <View style={styles.searchContainer}>
        <AnimatedSearchInput
          shadowColor={colors.glow_shadow}
          iconColor={colors.primarybtn}
          enableShadow={true}
          placeholder={getPlaceholderText()}
          value={search}
          onChangeText={setSearch}
          iconPosition="left"
          containerStyle={{width: '100%'}}
          inputContainerStyle={styles.searchInput}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}>
          <Text
            style={[
              styles.tabText,
              textStyle.fs_mont_16_400,
              activeTab === 'messages' && styles.activeTabText,
            ]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'calls' && styles.activeTab]}
          onPress={() => setActiveTab('calls')}>
          <Text
            style={[
              styles.tabText,
              textStyle.fs_mont_16_400,
              activeTab === 'calls' && styles.activeTabText,
            ]}>
            Calls
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'messages' ? (
        <FlatList
          data={dummyMessageData}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={dummyCallData}
          renderItem={renderCallItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenLayout>
  );
};

export default ChatHistory;

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    top: verticalScale(-24),
    paddingHorizontal: scale(20),
    width: '100%',
    zIndex: 20,
  },
  searchInput: {
    borderRadius: scale(24),
    borderColor: colors.primarybtn,
    borderWidth: 1,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(40),
    marginHorizontal: scale(16),
    backgroundColor: '#D3D3D3',
    borderRadius: scale(25),
    padding: scale(4),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: scale(20),
  },
  activeTab: {
    backgroundColor: colors.secondarybtn,
  },
  tabText: {
    color: "#000",
    // color: colors.secondaryText,
  },
  activeTabText: {
    color: colors.background,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
  },
});
