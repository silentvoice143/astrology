import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import ChatHistoryCard from '../components/ChatHistoryCard';
import CallHistoryCard from '../components/CallHistoryCard';
import {scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import AnimatedSearchInput from '../components/custom-searchbox';
import Tab from '../components/tab';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {
  getChatHistory,
  setOtherUser,
  setSession,
} from '../store/reducer/session';
import {useUserRole} from '../hooks/use-role';
import {ChatSession, UserDetail} from '../utils/types';
import {formatDateString, formatedDate} from '../utils/utils';

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

const ChatHistory = () => {
  const [search, setSearch] = useState('');
  const [headerBgColor] = useState(colors.background);
  const [activeTab, setActiveTab] = useState('chat'); // 'messages' or 'calls'
  const navigation = useNavigation<any>();
  const [messageItems, setMessageItems] = useState<ChatSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const role = useUserRole();
  const activeSessionId = useAppSelector(state => state.session.session?.id);
  const dispatch = useAppDispatch();

  //api calling for fetching the chat history

  const getChatHistoryDetail = async (page: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const payload = await dispatch(getChatHistory(`?page=${page}`)).unwrap();
      console.log(payload, '----payload');
      if (payload.success) {
        setMessageItems(prev => [...prev, ...payload.chatHistory]);
        setCurrentPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
      } else {
        setMessageItems([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      getChatHistoryDetail(1);
    }
  }, [activeTab]);
  const renderMessageItem = ({item}: {item: ChatSession}) => {
    const data: UserDetail = role === 'USER' ? item.astrologer : item.user;
    return (
      <TouchableOpacity
        onPress={() => {
          if (role === 'USER') {
            dispatch(setOtherUser(item.astrologer));
          } else {
            dispatch(setOtherUser(item.user));
          }

          dispatch(setSession(item));
          navigation.navigate('chat');
        }}>
        <ChatHistoryCard
          name={data.name}
          time={item.startedAt}
          avatar={{uri: ''}}
          active={item.status === 'ACTIVE' && activeSessionId === item.id}
        />
      </TouchableOpacity>
    );
  };

  const renderCallItem = ({item}: {item: CallItem}) => (
    <TouchableOpacity>
      <CallHistoryCard
        name={item.name}
        callType={item.callType}
        duration={item.duration}
        time={item.time}
        avatar={item.avatar}
      />
    </TouchableOpacity>
  );

  const getPlaceholderText = () => {
    return activeTab === 'messages'
      ? 'Search for messages...'
      : 'Search for calls...';
  };

  return (
    <ScreenLayout headerBackgroundColor={headerBgColor}>
      <View
        style={{
          paddingTop: verticalScale(20),
        }}>
        <View
          style={{
            height: 50,
            width: '100%',
            // backgroundColor: colors.secondary_surface,
            position: 'absolute',
            top: 0,
            borderBottomEndRadius: 20,
            borderStartEndRadius: 20,
          }}></View>
        <View style={{paddingHorizontal: scale(24)}}>
          <AnimatedSearchInput
            placeholder={getPlaceholderText()}
            unfocusedBorderColor={colors.primary_border}
            enableShadow={true}
            focusedBorderColor={colors.primary_border}
          />
        </View>
      </View>

      {/* tab  */}
      <View>
        <Tab
          tabs={[
            {key: 'chat', label: 'Chat'},
            {key: 'call', label: 'Call'},
          ]}
          onTabChange={tab => setActiveTab(tab)}
          initialTab="chat"
        />
      </View>

      {/* Content based on active tab */}
      {activeTab === 'chat' ? (
        <FlatList
          data={messageItems}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) =>
            `${item.id}-${item.startedAt}-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={info => {
            getChatHistoryDetail(currentPage + 1);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" style={{marginVertical: 10}} />
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                height: verticalScale(400),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={[textStyle.fs_mont_16_500]}>No Chat History</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={[]}
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

  tabText: {
    color: '#000',
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
