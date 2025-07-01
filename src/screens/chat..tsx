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
  const sessionId = useAppSelector(state => state.session.chatId);

  const {subscribe, send, connect, disconnect} = useWebSocket(userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Connect once on mount
  // useEffect(() => {
  //   connect();
  //   return () => disconnect();
  // }, [connect, disconnect]);

  // Subscribe to messages and typing events
  useEffect(() => {
    if (!sessionId) return;

    const msgSub = subscribe(`/${userId}/topic/messages`, message => {
      console.log(message, '---chat message');
      const data: Message = JSON.parse(message.body);
      if (data.sessionId === sessionId) {
        setMessages(prev => [...prev, data]);
      }
    });

    const typingSub = subscribe(`/${userId}/topic/typing`, message => {
      const data: {senderId: string; typing: boolean} = JSON.parse(
        message.body,
      );
      if (data.senderId === otherUserId) {
        setOtherUserTyping(data.typing);
      }
    });

    return () => {
      msgSub?.unsubscribe();
      typingSub?.unsubscribe();
    };
  }, [subscribe, userId, sessionId, otherUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    flatListRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  // Handle text input + typing event
  const handleInputChange = (text: string) => {
    setInput(text);

    send(
      `/app/chat.typing`,
      {},
      JSON.stringify({
        senderId: userId,
        receiverId: otherUserId,
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
          typing: false,
        }),
      );
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      senderId: userId,
      receiverId: otherUserId,
      sessionId,
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
      {!sessionId ? (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            Waiting for session to start...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text>Chat with {otherUserId}</Text>
            {otherUserTyping && <Text style={styles.typing}>Typing...</Text>}
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesArea}
          />

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={handleInputChange}
              placeholder="Type a message..."
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!!sessionId} // disables input if sessionId missing
            />
            <Button title="Send" onPress={handleSend} disabled={!sessionId} />
          </View>
        </>
      )}
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
