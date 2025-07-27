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
  getChatHistory,
  setOtherUser,
  setSession,
} from '../store/reducer/session';
import {useUserRole} from '../hooks/use-role';
import {ChatSession, UserDetail} from '../utils/types';
import AboutIcon from '../assets/icons/about-icon';

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
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [search, setSearch] = useState('');
  const [headerBgColor] = useState(colors.background);
  const [activeTab, setActiveTab] = useState('chat');
  const navigation = useNavigation<any>();
  const [messageItems, setMessageItems] = useState<ChatSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const role = useUserRole();
  const activeSessionId = useAppSelector(
    state => state.session.activeSession?.id,
  );
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  console.log(activeSessionId, '----active session id');

  const getChatHistoryDetail = async (page: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const payload = await dispatch(
        getChatHistory(`?page=${page}&limit=${5}`),
      ).unwrap();
      console.log(payload.chatHistory, '---chat history');
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setMessageItems([]);
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoadDone(false);
      setLoading(false);
      // small delay ensures reset finishes
      setTimeout(() => {
        getChatHistoryDetail(1);
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
        <ChatHistoryCard
          data={item}
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
      <View style={{paddingTop: verticalScale(20)}}>
        <View
          style={{height: 50, width: '100%', position: 'absolute', top: 0}}
        />
        <View style={{paddingHorizontal: scale(24)}}>
          <AnimatedSearchInput
            placeholder={getPlaceholderText()}
            unfocusedBorderColor={themeColors.border.secondary}
            enableShadow={true}
            focusedBorderColor={themeColors.border.secondary}
          />
        </View>
      </View>

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
            !loading ? (
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
          data={[]} // TODO: replace with call data
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
  listContent: {
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
  },
});
