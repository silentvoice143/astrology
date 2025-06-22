import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import ChatHeader from '../components/chat/chat-header';
import ChatInput from '../components/chat/chat-input';
import Messages from '../components/chat/messages';
import StompService from '../services/StompService';
import {useAppSelector} from '../hooks/redux-hook';
import {scale, verticalScale} from '../utils/sizer';

interface Message {
  id: string;
  text: string;
  type: 'send' | 'reply';
  time?: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  const senderId = useAppSelector(state => state.auth.userId);
  const receiverId = '7b59997b-8bb6-4c8f-ac8a-92a4a4879a9e'; // example
  const sessionId = 'c28009e3-7404-4855-b1f9-a08786968033'; // chat session ID

  useEffect(() => {
    StompService.connect(senderId, (msg: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: msg.message,
        type: 'reply',
        time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(prev => [newMessage, ...prev]);
    });

    return () => {
      StompService.disconnect();
    };
  }, [senderId]);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type: 'send',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages(prev => [newMessage, ...prev]);

    if (connected) {
      StompService.sendMessage('Hello world', senderId, receiverId, sessionId);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={verticalScale(90)}>
        <ChatHeader
          name="John Doe"
          profileImage={{
            uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80',
          }}
          onBackPress={() => console.log('Back')}
          onMenuPress={() => console.log('Menu')}
        />

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <Messages type={item.type} message={item.text} time={item.time} />
          )}
          contentContainerStyle={styles.flatListContent}
          inverted
        />

        <View style={styles.inputContainer}>
          <ChatInput onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: scale(10),
  },
  inputContainer: {},
});
