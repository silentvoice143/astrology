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
  Image,
  BackHandler,
} from 'react-native';
import {useWebSocket} from '../hooks/use-socket';
import {useAppDispatch, useAppSelector} from '../hooks/redux-hook';
import {decodeMessageBody, formatedDate, getTimeOnly} from '../utils/utils';
import {Message} from '../utils/types';
import {
  addMessage,
  clearSession,
  getChatMessages,
  prependMessages,
  setMessage,
  setSession,
} from '../store/reducer/session';
import {RootState} from '../store';
import Avatar from '../components/avatar';
import {textStyle} from '../constants/text-style';
import {moderateScale, scale, verticalScale} from '../utils/sizer';
import {colors, themeColors} from '../constants/colors';
import KundliIcon from '../assets/icons/kundli-icon-2';
import SendIcon from '../assets/icons/sendIcon';
import SessionKundliModal from '../components/session/modals/kundli-modal';
import {setKundliPerson} from '../store/reducer/kundli';
import {useUserRole} from '../hooks/use-role';
import Toast from 'react-native-toast-message';
import {uploadImage} from '../store/reducer/general';
import CameraModal from '../components/chat/modal/camera-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import CameraIcon from '../assets/icons/camera-icon';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import {useNavigation} from '@react-navigation/native';
import {StompSubscription} from '@stomp/stompjs';
import Timer from '../components/session/timer';

export const ChatScreenDemo = () => {
  const userId = useAppSelector(state => state.auth.user.id);
  const otherUser = useAppSelector(
    (state: RootState) => state.session.otherUser,
  );
  const otherUserId = otherUser?.id;
  const session = useAppSelector(state => state?.session?.session);
  // console.log(session, '----this is session');
  const {subscribe, send, unsubscribe} = useWebSocket(userId);
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
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  // ==============distinations===============
  const messageSubDest = `/topic/chat/${userId}/messages`;
  const typingSubDest = `/topic/chat/${userId}/typing`;
  const timerSubDest = `/topic/chat/${session?.id}/timer`;
  const chatEndDest = `/topic/chat/${session?.id}`;
  const getChatMessagesDetails = async (page: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const payload = await dispatch(
        getChatMessages(`/${session?.id}?page=${page}&size=${15}`),
      ).unwrap();
      // console.log(payload.messages, '----payload');
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

  const [showCamera, setShowCamera] = useState(false);

  const handleCaptureImage = async (filePath: string) => {
    if (!filePath) return;
    if (!session || !otherUserId) return;

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: 'file://' + filePath,
        name: `image-${userId}-${new Date().toISOString()}.jpg`,
        type: 'image/jpeg',
      });

      const payload = await dispatch(uploadImage(formData)).unwrap();

      if (payload?.success) {
        const newMsg: Message = {
          senderId: userId,
          receiverId: otherUserId,
          sessionId: session?.id,
          message: payload.imgUrl,
          type: 'IMAGE',
          timestamp: new Date(),
        };
        send('/app/chat.send', {}, JSON.stringify(newMsg));
        dispatch(addMessage(newMsg));
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Please try again later.',
      });
    }
  };

  useEffect(() => {
    let chatTimerSub: StompSubscription | undefined;
    let chatEndSub: StompSubscription | undefined;
    let chatMessage: StompSubscription | undefined;
    let typingSub: StompSubscription | undefined;

    if (session && session.status !== 'ENDED') {
      chatMessage = subscribe(messageSubDest, msg => {
        try {
          const data = JSON.parse(decodeMessageBody(msg));
          console.log(data);
          dispatch(addMessage(data));
          console.log('Adding msgs');
          // You may want to dispatch(addMessage(data)) here if needed
        } catch (err) {
          console.error('Failed to parse chat message:', err);
        }
      });
      typingSub = subscribe(typingSubDest, msg => {
        try {
          const data = JSON.parse(decodeMessageBody(msg));
          if (data.senderId === otherUserId) {
            setOtherUserTyping(data.typing);
            console.log('typing.....');
          }
          console.log(JSON.parse(decodeMessageBody(msg)));
        } catch (err) {
          console.error('Failed to parse chat typing:', err);
        }
      });
      chatTimerSub = subscribe(timerSubDest, msg => {
        try {
          const data = decodeMessageBody(msg);

          setTimer(data);
        } catch (err) {
          console.error('Failed to parse chat message:', err);
        }
      });
      chatEndSub = subscribe(chatEndDest, msg => {
        try {
          const data = JSON.parse(decodeMessageBody(msg));
          console.log(data);
          if (data.status === 'ended') {
            dispatch(
              setSession({
                ...session,
                status: data.status === 'ended' ? 'ENDED' : 'ACTIVE',
              }),
            );
            Toast.show({
              type: 'info',
              text1: 'Session Ended',
            });
          }
        } catch (err) {
          console.error('Failed to parse chat end message:', err);
        }
      });
    }

    return () => {
      chatTimerSub && unsubscribe(timerSubDest);
      chatEndSub && unsubscribe(chatEndDest);
      chatMessage && unsubscribe(messageSubDest);
      typingSub && unsubscribe(typingSubDest);
    };
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
    if (session?.status !== 'ACTIVE' || !session || !otherUserId) return;

    const newMsg: Message = {
      senderId: userId,
      receiverId: otherUserId,
      sessionId: session.id,
      message: input.trim(),
      type: 'TEXT',
      timestamp: new Date(),
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

  // useEffect(() => {
  //   return () => {
  //     if (userId && otherUserId && role === 'USER' && !session) {
  //       send(
  //         '/chat.leave',
  //         {},
  //         JSON.stringify({
  //           userId: userId, // UUID of the user who cancels
  //           astrologerId: otherUserId, // UUID of the astrologer
  //         }),
  //       );
  //       console.log('Leave request sent to /chat.leave');
  //     }
  //   };
  // }, [userId, otherUserId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('back to chatScreen');
        if (role === 'USER' && userId && otherUserId && !session) {
          send(
            '/chat.leave',
            {},
            JSON.stringify({
              userId: userId,
              astrologerId: otherUserId,
            }),
          );
          console.log('Leave request sent to /chat.leave');
        }
        navigation.replace('ChatHistory');
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  const renderMessage = ({item}: {item: Message}) => {
    const isMine = item.senderId === userId;

    const handleImagePress = () => {
      setSelectedImage(item.message); // this is the image URL
      setImageModalVisible(true);
    };

    return (
      <TouchableOpacity
        onPress={item.type === 'IMAGE' ? handleImagePress : () => {}}
        activeOpacity={0.9}>
        <View
          style={[
            styles.message,
            isMine ? styles.myMessage : styles.otherMessage,
          ]}>
          {item.type === 'IMAGE' ? (
            <Image
              source={{uri: item.message}}
              style={{width: 200, height: 200, borderRadius: 8}}
              resizeMode="cover"
            />
          ) : (
            <Text>{item.message}</Text>
          )}
          {/* <Text style={styles.timestamp}>
            {isMine
              ? getTimeOnly(item?.timestamp, true)
              : formatedDate(item?.timestamp)}
          </Text> */}
        </View>
      </TouchableOpacity>
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
          <TouchableOpacity onPress={() => navigation.replace('ChatHistory')}>
            <ChevronLeftIcon size={32} />
          </TouchableOpacity>
          <View>
            <Avatar
              size={50}
              image={{uri: ''}}
              fallbackText={otherUser?.name.charAt(0).toUpperCase()}
            />
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 0,
                height: scale(10),
                width: scale(10),
                backgroundColor:
                  session?.status === 'ACTIVE'
                    ? colors.success.base
                    : colors.error.base,
                borderRadius: scale(6),
              }}></View>
          </View>
          <View>
            <View style={{flexDirection: 'row', gap: 8}}>
              <Text
                style={[
                  textStyle.fs_mont_20_700,
                  {marginTop: verticalScale(8)},
                ]}>
                {otherUser?.name}
              </Text>
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
        {session?.status === 'ACTIVE' && timer && <Timer timer={timer} />}

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
          <TouchableOpacity
            onPress={() =>
              !!session && session.status === 'ACTIVE'
                ? setShowCamera(true)
                : {}
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
              marginRight: scale(10),
            }}>
            <CameraIcon size={16} strokeWidth={1} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!!session && session.status === 'ACTIVE'}
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
      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCaptureImage}
      />
      <Modal
        isVisible={imageModalVisible}
        onBackdropPress={() => setImageModalVisible(false)}
        onBackButtonPress={() => setImageModalVisible(false)}
        style={{margin: 0}}>
        <ImageViewer
          imageUrls={[{url: selectedImage || ''}]}
          enableSwipeDown
          onSwipeDown={() => setImageModalVisible(false)}
          backgroundColor="#000"
        />
      </Modal>
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
    backgroundColor: themeColors.surface.secondarySurface,
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
