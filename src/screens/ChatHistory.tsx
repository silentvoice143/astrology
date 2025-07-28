import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ScreenLayout from '../components/screen-layout';
import ChatHistoryCard from '../components/ChatHistoryCard';
import CallHistoryCard from '../components/CallHistoryCard';
import {scale, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';
import {textStyle} from '../constants/text-style';
import AnimatedSearchInput from '../components/custom-searchbox';
import Tab from '../components/tab';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {
  getCallHistory,
  getChatHistory,
  setOtherUser,
  setSession,
} from '../store/reducer/session';
import {useUserRole} from '../hooks/use-role';
import {CallSession, ChatSession, UserDetail} from '../utils/types';
import AboutIcon from '../assets/icons/about-icon';

const ChatHistory = () => {
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [search, setSearch] = useState('');
  const [headerBgColor] = useState(colors.background);
  const [activeTab, setActiveTab] = useState('chat');
  const navigation = useNavigation<any>();
  const [messageItems, setMessageItems] = useState<ChatSession[]>([]);
  const [callItems, setCallItems] = useState<CallSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const role = useUserRole();

  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const resetPagination = () => {
    setInitialLoadDone(false);
    setLoading(true);
    setCallItems([]);
    setMessageItems([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getChatHistoryDetail = async (page: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const payload = await dispatch(
        getChatHistory(`?page=${page}&limit=${5}`),
      ).unwrap();

      if (payload.success) {
        setMessageItems(prev => [...prev, ...payload.chatHistory]);
        setCurrentPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
        if (page === 1) {
          setInitialLoadDone(true);
        }
      } else {
        setMessageItems([]);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getCallHistoryDetail = async (page: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const payload = await dispatch(
        getCallHistory(`?page=${page}&limit=${5}`),
      ).unwrap();

      if (payload.success) {
        setCallItems(prev => [...prev, ...payload.chatHistory]);
        setCurrentPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
        if (page === 1) {
          setInitialLoadDone(true);
        }
      } else {
        setCallItems([]);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setLoading(true); // Ensure loading is true before resetting
      resetPagination();

      // Delay fetching to let reset happen cleanly
      setTimeout(() => {
        if (activeTab === 'chat') {
          getChatHistoryDetail(1);
        } else {
          getCallHistoryDetail(1);
        }
      }, 50);
    }
  }, [isFocused, activeTab]);

  const renderMessageItem = ({item}: {item: ChatSession}) => {
    const data: UserDetail = role === 'USER' ? item.astrologer : item.user;
    return (
      <TouchableOpacity
        onPress={() => {
          dispatch(setOtherUser(data));
          dispatch(setSession(item));
          navigation.navigate('chat');
        }}>
        <ChatHistoryCard data={item} active={item.status === 'ACTIVE'} />
      </TouchableOpacity>
    );
  };

  const renderCallItem = ({item}: {item: CallSession}) => (
    <TouchableOpacity>
      <CallHistoryCard data={item} />
    </TouchableOpacity>
  );

  const getPlaceholderText = () => {
    return activeTab === 'messages'
      ? 'Search for messages...'
      : 'Search for calls...';
  };

  return (
    <ScreenLayout headerBackgroundColor={headerBgColor}>
      {/* <View style={{paddingTop: verticalScale(20)}}>
        <View style={{paddingHorizontal: scale(24)}}>
          <AnimatedSearchInput
            placeholder={getPlaceholderText()}
            unfocusedBorderColor={themeColors.border.secondary}
            enableShadow={true}
            focusedBorderColor={themeColors.border.secondary}
          />
        </View>
      </View> */}

      {/* Tab */}
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

      {/* Chat Tab */}
      {activeTab === 'chat' ? (
        <FlatList
          data={messageItems}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) =>
            `${item.id}-${item.startedAt}-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (
              !onEndReachedCalledDuringMomentum.current &&
              initialLoadDone &&
              hasMore
            ) {
              getChatHistoryDetail(currentPage + 1);
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
                <ActivityIndicator size="small" style={{marginVertical: 10}} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && initialLoadDone ? (
              <View
                style={{
                  height: verticalScale(400),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
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
          onEndReached={() => {
            if (
              !onEndReachedCalledDuringMomentum.current &&
              initialLoadDone &&
              hasMore
            ) {
              getChatHistoryDetail(currentPage + 1);
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
                <ActivityIndicator size="small" style={{marginVertical: 10}} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && initialLoadDone ? (
              <View
                style={{
                  height: verticalScale(400),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AboutIcon color={themeColors.status.info.dark} />
                <Text style={[textStyle.fs_mont_16_500]}>No Call History</Text>
              </View>
            ) : null
          }
        />
      )}
    </ScreenLayout>
  );
};

export default ChatHistory;

const styles = StyleSheet.create({
  listContent: {
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
  },
});
