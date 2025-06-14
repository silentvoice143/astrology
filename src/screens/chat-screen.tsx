import React, {useState} from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Messages from '../components/chat/messages';
import ChatInput from '../components/chat/chat-input';
import {scale, verticalScale, scaleFont} from '../utils/sizer';
import ChatHeader from '../components/chat/chat-header';

interface Message {
  id: string;
  text: string;
  type: 'send' | 'reply';
  time?: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {id: '1', text: 'Hello Kitty 😍', type: 'reply', time: '11:20 AM'},
    {id: '2', text: 'HOW ARE YOU_', type: 'send', time: '11:30 AM'},
    {id: '3', text: 'I AM FINE', type: 'reply', time: '11:35 AM'},
  ]);

  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: 'send',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages(prev => [newMessage, ...prev]);
    setInputText('');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={verticalScale(90)}>
        <ChatHeader
          name="Jhon Doe"
          profileImage={{
            uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80',
          }} // or use URI
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
          <ChatInput
            onSend={text => {
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
            }}
          />
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
  inputContainer: {
    // additional padding if needed
  },
  input: {
    flex: 1,
    height: verticalScale(40),
    backgroundColor: '#f2f2f2',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    fontSize: scaleFont(16),
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: scale(15),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(14),
  },
});
