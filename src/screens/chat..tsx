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
import {useSocket} from '../hooks/use-socket';

interface Message {
  senderId: string;
  receiverId: string;
  sessionId: string;
  message: string;
  type: 'TEXT' | 'IMAGE';
  timestamp: string;
}

interface ChatScreenProps {
  userId: string;
  otherUserId: string;
  sessionId: string;
}

export const ChatScreenDemo = ({}) => {
  const userId = 'user-1';
  const otherUserId = 'user-2';
  const sessionId = 'session-abc';
  const {isConnected, subscribe, unsubscribe, sendMessage, sendTyping} =
    useSocket(userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Subscribe to WebSocket topics
  useEffect(() => {
    const msgTopic = `/user/${userId}/topic/messages`;
    const typeTopic = `/user/${userId}/topic/typing`;

    subscribe('chat-msgs', msgTopic, (data: Message) => {
      if (data.sessionId === sessionId) {
        setMessages(prev => [...prev, data]);
      }
    });

    subscribe(
      'chat-typing',
      typeTopic,
      (data: {senderId: string; typing: boolean}) => {
        if (data.senderId === otherUserId) {
          setOtherUserTyping(data.typing);
        }
      },
    );

    return () => {
      unsubscribe('chat-msgs');
      unsubscribe('chat-typing');
    };
  }, [subscribe, unsubscribe, userId, sessionId, otherUserId]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    flatListRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  // Handle input + typing indicator
  const handleInputChange = (text: string) => {
    setInput(text);

    if (!isTyping) {
      sendTyping({senderId: userId, receiverId: otherUserId, typing: true});
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping({senderId: userId, receiverId: otherUserId, typing: false});
      setIsTyping(false);
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

    sendMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Cleanup typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    sendTyping({senderId: userId, receiverId: otherUserId, typing: false});
    setIsTyping(false);
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
      <View style={styles.header}>
        <Text>
          Chat with {otherUserId} –{' '}
          <Text style={{color: isConnected() ? 'green' : 'red'}}>
            {isConnected() ? 'Online' : 'Offline'}
          </Text>
        </Text>
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
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  header: {
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  typing: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#666',
  },
  messagesArea: {
    padding: 10,
    flexGrow: 1,
  },
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
    textAlign: 'right',
  },
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
