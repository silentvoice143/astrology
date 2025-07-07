import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useWebSocket} from '../hooks/use-socket';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {decodeMessageBody, getTimeOnly} from '../utils/utils';
import {Message} from '../utils/types';
import {
  addMessage,
  clearSession,
  getChatMessages,
  prependMessages,
  setMessage,
} from '../store/reducer/session';
import {RootState} from '../store';
import Avatar from '../components/avatar';
import {textStyle} from '../constants/text-style';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors} from '../constants/colors';
import KundliIcon from '../assets/icons/kundli-icon-2';
import SendIcon from '../assets/icons/sendIcon';
import SessionKundliModal from '../components/session/modals/kundli-modal';
import {setKundliPerson} from '../store/reducer/kundli';
import {useUserRole} from '../hooks/use-role';

export const ChatScreenDemo = () => {
  const userId = useAppSelector(state => state.auth.user.id);
  const otherUser = useAppSelector(
    (state: RootState) => state.session.otherUser,
  );
  const otherUserId = otherUser?.id;

  const session = useAppSelector(state => state?.session?.session);

  const {subscribe, send} = useWebSocket(userId);

  const [timer, setTimer] = useState<string>('');
  // const [messages, setMessages] = useState<Message[]>([]);
  const {messages} = useAppSelector(state => state.session);
  const role = useUserRole();
  const [input, setInput] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const dispatch = useAppDispatch();

  console.log(session, messages, '---------session');
  const getChatMessagesDetails = async (page: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const payload = await dispatch(
        getChatMessages(`/${session?.id}?page=${page}&size=${15}`),
      ).unwrap();
      console.log(payload.messages, '----payload');
      if (payload.success) {
        if (page === 1) {
          dispatch(setMessage(payload.messages));
        } else {
          dispatch(prependMessages(payload.messages));
        }
        setCurrentPage(payload.currentPage);
        setHasMore(!payload.isLastPage);
      } else {
        addMessage([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;

    // =========================subscriptions==============================
    const chatMessage = subscribe(`/topic/chat/${userId}/messages`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log(data);
        dispatch(addMessage(data));
        // You may want to dispatch(addMessage(data)) here if needed
      } catch (err) {
        console.error('Failed to parse chat message:', err);
      }
    });
    const typingSub = subscribe(`/topic/chat/${userId}/typing`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        if (data.senderId === otherUserId) {
          setOtherUserTyping(data.typing);
        }
        console.log(JSON.parse(decodeMessageBody(msg)));
      } catch (err) {
        console.error('Failed to parse chat typing:', err);
      }
    });

    return () => {
      typingSub?.unsubscribe();
      chatMessage?.unsubscribe();
    };
  }, [subscribe, userId, session, otherUserId]);

  useEffect(() => {
    if (!session) return;
    const chatTimer = subscribe(`/topic/chat/${session.id}/timer`, msg => {
      try {
        const data = decodeMessageBody(msg);
        setTimer(data);
      } catch (err) {
        console.error('Failed to parse chat message:', err);
      }
    });
    return () => chatTimer?.unsubscribe();
  }, [session, subscribe]);

  // Handle text input + typing event
  const handleInputChange = (text: string) => {
    setInput(text);
    if (!session) return;

    send(
      `/app/chat.typing`,
      {},
      JSON.stringify({
        senderId: userId,
        receiverId: otherUserId,
        sessionId: session.id,
        typing: true,
      }),
    );

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      send(
        `/app/chat.typing`,
        {},
        JSON.stringify({
          senderId: userId,
          receiverId: otherUserId,
          sessionId: session.id,
          typing: false,
        }),
      );
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (!session || !otherUserId) return;

    const newMsg: Message = {
      senderId: userId,
      receiverId: otherUserId,
      sessionId: session.id,
      message: input.trim(),
      type: 'TEXT',
      timestamp: new Date().toISOString(),
    };

    send(`/app/chat.send`, {}, JSON.stringify(newMsg));
    dispatch(addMessage(newMsg));
    setInput('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    send(
      `/app/chat.typing`,
      {},
      JSON.stringify({
        senderId: userId,
        receiverId: otherUserId,
        typing: false,
      }),
    );
  };

  useEffect(() => {
    if (otherUser) {
      dispatch(setKundliPerson(otherUser));
    }
    return () => {
      // This runs when ChatScreen unmounts
      dispatch(clearSession());
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    getChatMessagesDetails(1);
  }, [session]);

  const renderMessage = ({item}: {item: Message}) => {
    const isMine = item.senderId === userId;
    return (
      <View
        style={[
          styles.message,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}>
        <Text>{item.message}</Text>
        <Text style={styles.timestamp}>
          {getTimeOnly(item.timestamp, true)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <>
        <View
          style={[
            styles.header,
            {flexDirection: 'row', gap: scale(12), alignItems: 'center'},
          ]}>
          <Avatar
            size={60}
            image={{uri: ''}}
            fallbackText={otherUser?.name.charAt(0).toUpperCase()}
          />
          <View>
            <View style={{flexDirection: 'row', gap: 8}}>
              <Text style={[textStyle.fs_mont_20_700]}>{otherUser?.name}</Text>
              <View
                style={{
                  height: scale(8),
                  width: scale(8),
                  backgroundColor:
                    session?.status === 'ACTIVE'
                      ? colors.success.base
                      : colors.error.base,
                  borderRadius: scale(4),
                }}></View>
            </View>

            <Text
              style={[
                styles.typing,
                {
                  color: otherUserTyping
                    ? colors.primaryText
                    : colors.whiteText,
                },
              ]}>
              Typing...
            </Text>
          </View>
        </View>
        {session?.status === 'ACTIVE' && (
          <View
            style={{
              backgroundColor: colors.primary_card,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: verticalScale(4),
            }}>
            <Text
              style={[
                {color: colors.whiteText, textAlign: 'center'},
                textStyle.fs_mont_16_700,
              ]}>
              {timer}
            </Text>
          </View>
        )}
        {!session ? (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Waiting for session to start...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesArea}
            onEndReached={info => {
              getChatMessagesDetails(currentPage + 1);
            }}
            onEndReachedThreshold={0.2}
          />
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
            // editable={!!session && session.status === 'ACTIVE'}
          />
          <View style={{flexDirection: 'row', gap: scale(8)}}>
            <TouchableOpacity
              onPress={
                !!session && session.status === 'ACTIVE' ? handleSend : () => {}
              }
              style={{
                backgroundColor:
                  !!session && session.status === 'ACTIVE'
                    ? colors.primarybtn
                    : colors.disabled,
                height: moderateScale(40),
                width: moderateScale(40),
                borderRadius: moderateScale(20),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <SendIcon />
            </TouchableOpacity>
            {role === 'ASTROLOGER' && (
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                style={{
                  backgroundColor:
                    !!session && session.status === 'ACTIVE'
                      ? colors.primarybtn
                      : colors.disabled,
                  height: moderateScale(40),
                  width: moderateScale(40),
                  borderRadius: moderateScale(20),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <KundliIcon />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <SessionKundliModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      </>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#EFEFEF'},
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary_surface,
  },
  waitingText: {fontSize: 16, color: '#666'},
  header: {
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  typing: {marginTop: 4, fontStyle: 'italic', color: '#666'},
  messagesArea: {
    padding: 10,
    flexGrow: 1,
    backgroundColor: colors.primary.light,
  },
  message: {padding: 10, marginVertical: 4, borderRadius: 10, maxWidth: '75%'},
  myMessage: {alignSelf: 'flex-end', backgroundColor: '#DCF8C6'},
  otherMessage: {alignSelf: 'flex-start', backgroundColor: '#FFF'},
  timestamp: {fontSize: 10, color: '#555', marginTop: 4, textAlign: 'right'},
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    marginRight: 10,
  },
});

export default ChatScreenDemo;
