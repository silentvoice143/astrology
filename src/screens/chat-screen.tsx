// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   SafeAreaView,
// } from 'react-native';
// import ChatHeader from '../components/chat/chat-header';
// import ChatInput from '../components/chat/chat-input';
// import Messages from '../components/chat/messages';
// import StompService from '../services/StompService';
// import {useAppSelector} from '../hooks/redux-hook';
// import {scale, verticalScale} from '../utils/sizer';

// interface Message {
//   id: string;
//   text: string;
//   type: 'send' | 'reply';
//   time?: string;
// }

// const ChatScreen = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [connected, setConnected] = useState(false);

//   const senderId = useAppSelector(state => state.auth.userId);
//   const receiverId = '7b59997b-8bb6-4c8f-ac8a-92a4a4879a9e'; // example
//   const sessionId = 'c28009e3-7404-4855-b1f9-a08786968033'; // chat session ID

//   useEffect(() => {
//     StompService.connect(senderId, (msg: any) => {
//       const newMessage: Message = {
//         id: Date.now().toString(),
//         text: msg.message,
//         type: 'reply',
//         time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//       };
//       setMessages(prev => [newMessage, ...prev]);
//     });

//     return () => {
//       StompService.disconnect();
//     };
//   }, [senderId]);

//   const handleSend = (text: string) => {
//     const newMessage: Message = {
//       id: Date.now().toString(),
//       text,
//       type: 'send',
//       time: new Date().toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//     };

//     setMessages(prev => [newMessage, ...prev]);

//     if (connected) {
//       StompService.sendMessage('Hello world', senderId, receiverId, sessionId);
//     }
//   };

//   return (
//     <SafeAreaView style={{flex: 1}}>
//       <KeyboardAvoidingView
//         style={styles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={verticalScale(90)}>
//         <ChatHeader
//           name="John Doe"
//           profileImage={{
//             uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80',
//           }}
//           onBackPress={() => console.log('Back')}
//           onMenuPress={() => console.log('Menu')}
//         />

//         <FlatList
//           data={messages}
//           keyExtractor={item => item.id}
//           renderItem={({item}) => (
//             <Messages type={item.type} message={item.text} time={item.time} />
//           )}
//           contentContainerStyle={styles.flatListContent}
//           inverted
//         />

//         <View style={styles.inputContainer}>
//           <ChatInput onSend={handleSend} />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   flatListContent: {
//     flexGrow: 1,
//     justifyContent: 'flex-end',
//     padding: scale(10),
//   },
//   inputContainer: {},
// });

// import React, {useEffect, useState, useRef} from 'react';
// import {
//   View,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   Text,
//   TouchableOpacity,
// } from 'react-native';
// import ChatHeader from '../components/chat/chat-header';
// import ChatInput from '../components/chat/chat-input';
// import Messages from '../components/chat/messages';
// import WebSocketService, {
//   ChatMessage,
//   TypingIndicator,
// } from '../services/WebSocketService';
// import {useAppSelector} from '../hooks/redux-hook';
// import {scale, verticalScale} from '../utils/sizer';

// interface Message {
//   id: string;
//   text: string;
//   type: 'send' | 'reply';
//   time?: string;
// }

// const ChatScreen = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [connected, setConnected] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const [receiverTyping, setReceiverTyping] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);

//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const flatListRef = useRef<FlatList>(null);

//   const senderId = useAppSelector(state => state.auth.userId);
//   const receiverId = '7b59997b-8bb6-4c8f-ac8a-92a4a4879a9e'; // example
//   const sessionId = 'c28009e3-7404-4855-b1f9-a08786968033'; // chat session ID

//   // WebSocket callbacks
//   const handleNewMessage = (message: ChatMessage) => {
//     const newMessage: Message = {
//       id: message.id || Date.now().toString(),
//       text: message.message,
//       type: message.senderId === senderId ? 'send' : 'reply',
//       time: new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//     };

//     setMessages(prev => [newMessage, ...prev]);

//     // Scroll to top (since list is inverted)
//     setTimeout(() => {
//       flatListRef.current?.scrollToIndex({index: 0, animated: true});
//     }, 100);
//   };

//   const handleTypingIndicator = (typing: TypingIndicator) => {
//     if (typing.senderId !== senderId) {
//       setReceiverTyping(typing.isTyping);

//       // Auto-hide typing indicator after 3 seconds
//       if (typing.isTyping) {
//         setTimeout(() => setReceiverTyping(false), 3000);
//       }
//     }
//   };

//   const handleConnect = () => {
//     setConnected(true);
//     setConnecting(false);
//     setConnectionError(null);
//     console.log('WebSocket connected successfully');
//   };

//   const handleDisconnect = () => {
//     setConnected(false);
//     setConnecting(false);
//     console.log('WebSocket disconnected');
//   };

//   const handleError = (error: any) => {
//     setConnectionError(error?.message || 'Connection failed');
//     setConnected(false);
//     setConnecting(false);
//     console.error('WebSocket error:', error);
//   };

//   // Initialize WebSocket connection
//   useEffect(() => {
//     if (!senderId) return;

//     const initializeConnection = async () => {
//       setConnecting(true);
//       try {
//         await WebSocketService.connect(senderId, {
//           onMessage: handleNewMessage,
//           onTyping: handleTypingIndicator,
//           onConnect: handleConnect,
//           onDisconnect: handleDisconnect,
//           onError: handleError,
//         });
//       } catch (error) {
//         console.error('Failed to connect:', error);
//         setConnectionError('Failed to connect to chat server');
//         setConnecting(false);
//       }
//     };

//     initializeConnection();

//     return () => {
//       WebSocketService.disconnect();
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, [senderId]);

//   const handleSend = (text: string) => {
//     if (!connected || !text.trim()) {
//       if (!connected) {
//         Alert.alert(
//           'Connection Error',
//           'Please wait for connection to be established',
//         );
//       }
//       return;
//     }

//     // Add message to local state immediately for better UX
//     const newMessage: Message = {
//       id: Date.now().toString(),
//       text: text.trim(),
//       type: 'send',
//       time: new Date().toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//     };

//     setMessages(prev => [newMessage, ...prev]);

//     // Send via WebSocket
//     WebSocketService.sendMessage({
//       sessionId,
//       senderId,
//       receiverId,
//       message: text.trim(),
//       type: 'TEXT',
//     });

//     // Stop typing indicator
//     handleStopTyping();

//     // Scroll to top (since list is inverted)
//     setTimeout(() => {
//       flatListRef.current?.scrollToIndex({index: 0, animated: true});
//     }, 100);
//   };

//   const handleStartTyping = () => {
//     if (!isTyping && connected) {
//       setIsTyping(true);
//       WebSocketService.sendTypingIndicator({
//         senderId,
//         receiverId,
//         sessionId,
//         isTyping: true,
//       });
//     }

//     // Reset typing timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       handleStopTyping();
//     }, 2000);
//   };

//   const handleStopTyping = () => {
//     if (isTyping && connected) {
//       setIsTyping(false);
//       WebSocketService.sendTypingIndicator({
//         senderId,
//         receiverId,
//         sessionId,
//         isTyping: false,
//       });
//     }

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = null;
//     }
//   };

//   const handleRetryConnection = async () => {
//     if (!senderId) return;

//     setConnecting(true);
//     setConnectionError(null);

//     try {
//       await WebSocketService.connect(senderId, {
//         onMessage: handleNewMessage,
//         onTyping: handleTypingIndicator,
//         onConnect: handleConnect,
//         onDisconnect: handleDisconnect,
//         onError: handleError,
//       });
//     } catch (error) {
//       console.error('Retry connection failed:', error);
//       setConnectionError('Failed to reconnect');
//       setConnecting(false);
//     }
//   };

//   const renderConnectionStatus = () => {
//     if (connectionError) {
//       return (
//         <View style={styles.statusContainer}>
//           <Text style={styles.errorText}>
//             Connection Error: {connectionError}
//           </Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={handleRetryConnection}
//             disabled={connecting}>
//             <Text style={styles.retryButtonText}>
//               {connecting ? 'Connecting...' : 'Retry'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     if (connecting) {
//       return (
//         <View style={styles.statusContainer}>
//           <Text style={styles.connectingText}>
//             Connecting to chat server...
//           </Text>
//         </View>
//       );
//     }

//     if (!connected) {
//       return (
//         <View style={styles.statusContainer}>
//           <Text style={styles.disconnectedText}>
//             Disconnected from chat server
//           </Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={handleRetryConnection}>
//             <Text style={styles.retryButtonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     return null;
//   };

//   return (
//     <SafeAreaView style={{flex: 1}}>
//       <KeyboardAvoidingView
//         style={styles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={verticalScale(90)}>
//         <ChatHeader
//           name="John Doe"
//           profileImage={{
//             uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80',
//           }}
//           onBackPress={() => console.log('Back')}
//           onMenuPress={() => console.log('Menu')}
//           // Add typing indicator to header if needed
//           subtitle={
//             receiverTyping ? 'typing...' : connected ? 'online' : 'offline'
//           }
//         />

//         {/* Connection Status */}
//         {renderConnectionStatus()}

//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={item => item.id}
//           renderItem={({item}) => (
//             <Messages type={item.type} message={item.text} time={item.time} />
//           )}
//           contentContainerStyle={styles.flatListContent}
//           inverted
//           onScrollToIndexFailed={info => {
//             // Handle scroll failure gracefully
//             console.log('Scroll to index failed:', info);
//           }}
//         />

//         <View style={styles.inputContainer}>
//           <ChatInput
//             onSend={handleSend}
//             onStartTyping={handleStartTyping}
//             onStopTyping={handleStopTyping}
//             disabled={!connected}
//             placeholder={connected ? 'Type a message...' : 'Connecting...'}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   flatListContent: {
//     flexGrow: 1,
//     justifyContent: 'flex-end',
//     padding: scale(10),
//   },
//   inputContainer: {},
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: scale(8),
//     backgroundColor: '#fff3cd',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ffeaa7',
//   },
//   connectingText: {
//     color: '#856404',
//     fontSize: scale(12),
//   },
//   disconnectedText: {
//     color: '#721c24',
//     fontSize: scale(12),
//     marginRight: scale(8),
//   },
//   errorText: {
//     color: '#721c24',
//     fontSize: scale(12),
//     marginRight: scale(8),
//     flex: 1,
//   },
//   retryButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: scale(12),
//     paddingVertical: scale(4),
//     borderRadius: scale(4),
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: scale(12),
//   },
// });

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import ChatHeader from '../components/chat/chat-header';
import ChatInput from '../components/chat/chat-input';
import Messages from '../components/chat/messages';
import WebSocketService, {
  ChatMessage,
  TypingIndicator,
} from '../services/WebSocketService';
import {useAppSelector} from '../hooks/redux-hook';
import {scale, verticalScale} from '../utils/sizer';
import SocketService from '../services/SocketService';

interface Message {
  id: string;
  text: string;
  type: 'send' | 'reply';
  time?: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [receiverTyping, setReceiverTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const senderId = useAppSelector(state => state.auth.userId);
  const receiverId = '7b59997b-8bb6-4c8f-ac8a-92a4a4879a9e'; // demo
  const sessionId = 'c28009e3-7404-4855-b1f9-a08786968033';

  // const userId = senderId; // must match the backend header

  // useEffect(() => {
  //   SocketService.connect(userId, () => {
  //     SocketService.subscribeToMessages(msg => {
  //       console.log('Received message', msg);
  //     });

  //     SocketService.subscribeToTyping(typing => {
  //       console.log('Typing indicator:', typing);
  //     });
  //   });

  //   return () => {
  //     SocketService.disconnect();
  //   };
  // }, []);

  const handleNewMessage = (message: ChatMessage) => {
    const newMessage: Message = {
      id: message.id || Date.now().toString(),
      text: message.message,
      type: message.senderId === senderId ? 'send' : 'reply',
      time: new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages(prev => [newMessage, ...prev]);
    setTimeout(
      () => flatListRef.current?.scrollToIndex({index: 0, animated: true}),
      100,
    );
  };

  const handleTypingIndicator = (typing: TypingIndicator) => {
    if (typing.senderId !== senderId) {
      setReceiverTyping(typing.isTyping);
      if (typing.isTyping) {
        setTimeout(() => setReceiverTyping(false), 3000);
      }
    }
  };

  const connectWebSocket = async () => {
    if (!senderId) return;
    setConnecting(true);
    try {
      await WebSocketService.connect(senderId, {
        onMessage: handleNewMessage,
        onTyping: handleTypingIndicator,
        onConnect: () => {
          setConnected(true);
          setConnecting(false);
          setConnectionError(null);
        },
        onDisconnect: () => {
          setConnected(false);
          setConnecting(false);
        },
        onError: error => {
          setConnectionError(error?.message || 'Connection failed');
          setConnected(false);
          setConnecting(false);
        },
      });
    } catch (error) {
      console.error('WebSocket connect error:', error);
      setConnectionError('Failed to connect to chat server');
      setConnecting(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      WebSocketService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [senderId]);

  const handleSend = (text: string) => {
    if (!WebSocketService.isWebSocketConnected() || !text.trim()) {
      Alert.alert(
        'Connection Error',
        'Please wait for the connection to be established',
      );
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      type: 'send',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages(prev => [newMessage, ...prev]);

    WebSocketService.sendMessage({
      sessionId,
      senderId,
      receiverId,
      message: text.trim(),
      type: 'TEXT',
    });

    handleStopTyping();
    setTimeout(
      () => flatListRef.current?.scrollToIndex({index: 0, animated: true}),
      100,
    );
  };

  const handleStartTyping = () => {
    if (!isTyping && WebSocketService.isWebSocketConnected()) {
      setIsTyping(true);
      WebSocketService.sendTypingIndicator({
        senderId,
        receiverId,
        sessionId,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => handleStopTyping(), 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && WebSocketService.isWebSocketConnected()) {
      setIsTyping(false);
      WebSocketService.sendTypingIndicator({
        senderId,
        receiverId,
        sessionId,
        isTyping: false,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const renderConnectionStatus = () => {
    if (connectionError) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>
            Connection Error: {connectionError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={connectWebSocket}
            disabled={connecting}>
            <Text style={styles.retryButtonText}>
              {connecting ? 'Connecting...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (connecting) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.connectingText}>
            Connecting to chat server...
          </Text>
        </View>
      );
    }

    return null;
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
          subtitle={
            receiverTyping ? 'typing...' : connected ? 'online' : 'offline'
          }
        />

        {renderConnectionStatus()}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <Messages type={item.type} message={item.text} time={item.time} />
          )}
          contentContainerStyle={styles.flatListContent}
          inverted
          onScrollToIndexFailed={info =>
            console.log('Scroll to index failed:', info)
          }
        />

        <View style={styles.inputContainer}>
          <ChatInput
            onSend={handleSend}
            onStartTyping={handleStartTyping}
            onStopTyping={handleStopTyping}
            disabled={!connected}
            placeholder={connected ? 'Type a message...' : 'Connecting...'}
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
  inputContainer: {},
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(8),
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  connectingText: {
    color: '#856404',
    fontSize: scale(12),
  },
  disconnectedText: {
    color: '#721c24',
    fontSize: scale(12),
    marginRight: scale(8),
  },
  errorText: {
    color: '#721c24',
    fontSize: scale(12),
    marginRight: scale(8),
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  retryButtonText: {
    color: 'white',
    fontSize: scale(12),
  },
});
