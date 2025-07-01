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
} from 'react-native';
import {useWebSocket} from '../hooks/use-socket';
import {useAppSelector} from '../hooks/redux-hook';
import {decodeMessageBody} from '../utils/utils';

interface Message {
  senderId: string;
  receiverId: string;
  sessionId: string;
  message: string;
  type: 'TEXT' | 'IMAGE';
  timestamp: string;
}

export const ChatScreenDemo = () => {
  const userId = useAppSelector(state => state.auth.user.id);
  const otherUserId = useAppSelector(state => state.session.otherUserId);
  const session = useAppSelector(state => state?.session?.session);
  const {subscribe, send} = useWebSocket(userId);

  const [timer, setTimer] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!session) return;

    const msgSub = subscribe(`/topic/${userId}/messages`, message => {
      console.log(message, decodeMessageBody(message), '---chat message');
      const data: Message = JSON.parse(decodeMessageBody(message));
      if (data.sessionId === session.id) {
        setMessages(prev => [...prev, data]);
      }
    });

    const typingSub = subscribe(`/topic/${userId}/typing`, message => {
      console.log(message, decodeMessageBody(message), '-----typing');
      const data: {senderId: string; typing: boolean} = JSON.parse(
        decodeMessageBody(message),
      );

      if (data.senderId === otherUserId) {
        setOtherUserTyping(data.typing);
      }
    });

    return () => {
      msgSub?.unsubscribe();
      typingSub?.unsubscribe();
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

  // Scroll to bottom on new message
  useEffect(() => {
    flatListRef.current?.scrollToEnd({animated: true});
  }, [messages]);

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
    if (!session) return;

    const newMsg: Message = {
      senderId: userId,
      receiverId: otherUserId,
      sessionId: session.id,
      message: input.trim(),
      type: 'TEXT',
      timestamp: new Date().toISOString(),
    };

    send(`/app/chat.send`, {}, JSON.stringify(newMsg));
    setMessages(prev => [...prev, newMsg]);
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
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <>
        <View style={styles.header}>
          <Text>Chat with {otherUserId}</Text>
          {otherUserTyping && <Text style={styles.typing}>Typing...</Text>}
        </View>
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
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesArea}
          />
        )}

        <View style={styles.inputArea}>
          <Text>{timer}</Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!!session} // disables input if sessionId missing
          />
          <Button
            title="Send"
            onPress={session ? handleSend : () => {}}
            disabled={!session}
          />
        </View>
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
    backgroundColor: '#EFEFEF',
  },
  waitingText: {fontSize: 16, color: '#666'},
  header: {
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  typing: {marginTop: 4, fontStyle: 'italic', color: '#666'},
  messagesArea: {padding: 10, flexGrow: 1},
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
