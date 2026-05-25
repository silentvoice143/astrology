import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChatHistoryCard from '../../components/ChatHistoryCard';
import CallHistoryCard from '../../components/CallHistoryCard';
import { scale, verticalScale } from '../../utils/sizer';
import { COLORS, colors, themeColors } from '../../constants/colors';
import { textStyle } from '../../constants/text-style';
import Tab from '../../components/tab';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { useAppDispatch } from '../../hooks/redux-hook';
import {
  getCallHistory,
  getChatHistory,
  setOtherUser,
  setSession,
} from '../../store/reducer/session';
import { useUserRole } from '../../hooks/use-role';
import { CallSession, ChatSession } from '../../utils/types';
import AboutIcon from '../../assets/icons/about-icon';
import PageWithHeader from '../../componentsV1/layout/page-with-header';

const CallChat = () => {
  const navigation = useNavigation<any>();
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');

  // Chat states
  const [chatItems, setChatItems] = useState<ChatSession[]>([]);
  const [chatPage, setChatPage] = useState(1);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(true);
  const [chatInitialLoadDone, setChatInitialLoadDone] = useState(false);

  // Call states
  const [callItems, setCallItems] = useState<CallSession[]>([]);
  const [callPage, setCallPage] = useState(1);
  const [callLoading, setCallLoading] = useState(false);
  const [callHasMore, setCallHasMore] = useState(true);
  const [callInitialLoadDone, setCallInitialLoadDone] = useState(false);

  // Momentum refs to avoid multiple pagination calls
  const chatMomentumRef = useRef(false);
  const callMomentumRef = useRef(false);

  // Reset pagination when tab changes
  const resetTabPagination = (tab: 'chat' | 'call') => {
    // if (tab === 'chat') {
    //   setChatItems([]);
    //   setChatPage(1);
    //   setChatHasMore(true);
    //   setChatInitialLoadDone(false);
    // } else {
    //   setCallItems([]);
    //   setCallPage(1);
    //   setCallHasMore(true);
    //   setCallInitialLoadDone(false);
    // }
    setChatItems([]);
    setChatPage(1);
    setChatHasMore(true);
    setChatInitialLoadDone(false);
    setCallItems([]);
    setCallPage(1);
    setCallHasMore(true);
    setCallInitialLoadDone(false);
  };

  const getChatHistoryDetail = async (page: number) => {
    if (chatLoading || !chatHasMore) return;
    try {
      setChatLoading(true);
      const payload = await dispatch(
        getChatHistory(`?page=${page}&limit=10`),
      ).unwrap();
      if (payload.success) {
        console.log(payload.chatHistory, "---caht details")
        setChatItems(prev =>
          page === 1 ? payload.chatHistory : [...prev, ...payload.chatHistory],
        );
        setChatPage(payload.currentPage);
        setChatHasMore(!payload.isLastPage);
        if (page === 1) setChatInitialLoadDone(true);
      } else {
        setChatItems([]);
      }
    } catch (err) {
      console.log('Chat history error', err);
    } finally {
      setChatLoading(false);
    }
  };

  const getCallHistoryDetail = async (page: number) => {
    if (callLoading || !callHasMore) return;
    try {
      setCallLoading(true);
      const payload = await dispatch(
        getCallHistory(`?page=${page}&limit=10`),
      ).unwrap();
      console.log(payload, '-------call history data');
      if (payload.success) {
        // Make sure to use correct field
        const history = payload.callHistory || payload.chatHistory || [];
        setCallItems(prev => (page === 1 ? history : [...prev, ...history]));
        setCallPage(payload.currentPage);
        setCallHasMore(!payload.isLastPage);
        if (page === 1) setCallInitialLoadDone(true);
      } else {
        setCallItems([]);
      }
    } catch (err) {
      console.log('Call history error', err);
    } finally {
      setCallLoading(false);
    }
  };

  // Fetch data when screen focused or tab changes
  // useEffect(() => {
  //   if (isFocused) {
  //     resetTabPagination(activeTab);
  //     if (activeTab === 'chat') {
  //       getChatHistoryDetail(1);
  //     } else {
  //       getCallHistoryDetail(1);
  //     }
  //   }
  // }, [isFocused, activeTab]);

  useFocusEffect(
    useCallback(() => {
      // Reset pagination and fetch data for active tab
      resetTabPagination(activeTab);
      if (activeTab === 'chat') {
        getChatHistoryDetail(1);
      } else {
        getCallHistoryDetail(1);
      }
    }, [activeTab]),
  );

  const renderMessageItem = ({ item }: { item: ChatSession }) => {
    const data = item.astrologer;
    return (
      <TouchableOpacity
        onPress={() => {
          dispatch(setOtherUser(data));
          dispatch(setSession(item));
          navigation.navigate('ChatScreen');
        }}>
        <ChatHistoryCard data={item} active={item.status === 'ACTIVE'} />
      </TouchableOpacity>
    );
  };

  const renderCallItem = ({ item }: { item: CallSession }) => (
    <TouchableOpacity>
      <CallHistoryCard data={item} />
    </TouchableOpacity>
  );

  const onEndReachedChat = () => {
    if (!chatMomentumRef.current && chatHasMore) {
      getChatHistoryDetail(chatPage + 1);
      chatMomentumRef.current = true;
    }
  };

  const onEndReachedCall = () => {
    if (!callMomentumRef.current && callHasMore) {
      getCallHistoryDetail(callPage + 1);
      callMomentumRef.current = true;
    }
  };

  return (
    <PageWithHeader title={'History'} scrollEnabled={false}>
      {/* Tab */}
      <View>
        <Tab
          tabs={[
            { key: 'chat', label: 'Chat' },
            { key: 'call', label: 'Call' },
          ]}
          onTabChange={(tab: 'chat' | 'call') => setActiveTab(tab)}
          initialTab="chat"
        />
      </View>

      {/* Chat or Call List */}
      {activeTab === 'chat' ? (
        <FlatList
          data={chatItems}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) =>
            `${item.id}-${item.startedAt}-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReachedChat}
          onMomentumScrollBegin={() => {
            chatMomentumRef.current = false;
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            chatLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !chatLoading && chatInitialLoadDone ? (
              <View style={styles.empty}>
                <AboutIcon color={themeColors.status.info.dark} />
                <Text style={[textStyle.fs_mont_16_500]}>No Chat History</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={callItems}
          renderItem={renderCallItem}
          keyExtractor={(item, index) =>
            `${item.id}-${item.startedAt}-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReachedCall}
          onMomentumScrollBegin={() => {
            callMomentumRef.current = false;
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            callLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !callLoading && callInitialLoadDone ? (
              <View style={styles.empty}>
                <AboutIcon color={themeColors.status.info.dark} />
                <Text style={[textStyle.fs_mont_16_500]}>No Call History</Text>
              </View>
            ) : null
          }
        />
      )}
    </PageWithHeader>
  );
};

export default CallChat;

const styles = StyleSheet.create({
  listContent: {
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(80),
  },
  loader: {
    flex: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    height: verticalScale(400),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
