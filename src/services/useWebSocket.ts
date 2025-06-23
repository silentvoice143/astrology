// // hooks/useWebSocket.ts
// import {useEffect, useRef, useCallback, useState} from 'react';
// import WebSocketService, {
//   ChatMessage,
//   TypingIndicator,
//   WebSocketCallbacks,
// } from '../services/WebSocketService';

// interface UseWebSocketProps {
//   userId: string;
//   onMessage?: (message: ChatMessage) => void;
//   onTyping?: (typing: TypingIndicator) => void;
//   autoConnect?: boolean;
// }

// interface UseWebSocketReturn {
//   isConnected: boolean;
//   connectionError: string | null;
//   connect: () => Promise<void>;
//   disconnect: () => Promise<void>;
//   sendMessage: (messageData: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
//   sendTypingIndicator: (typingData: TypingIndicator) => void;
// }

// export const useWebSocket = ({
//   userId,
//   onMessage,
//   onTyping,
//   autoConnect = true,
// }: UseWebSocketProps): UseWebSocketReturn => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const isInitialized = useRef(false);

//   const memoizedCallbacks = useRef<WebSocketCallbacks>({
//     onMessage,
//     onTyping,
//     onConnect: () => {
//       setIsConnected(true);
//       setConnectionError(null);
//     },
//     onDisconnect: () => {
//       setIsConnected(false);
//     },
//     onError: error => {
//       setConnectionError(error?.message || 'WebSocket connection error');
//       setIsConnected(false);
//     },
//   });

//   const callbacks: WebSocketCallbacks = {
//     onMessage,
//     onTyping,
//     onConnect: () => {
//       setIsConnected(true);
//       setConnectionError(null);
//     },
//     onDisconnect: () => {
//       setIsConnected(false);
//     },
//     onError: error => {
//       setConnectionError(error?.message || 'WebSocket connection error');
//       setIsConnected(false);
//     },
//   };

//   const connect = useCallback(async () => {
//     try {
//       setConnectionError(null);
//       await WebSocketService.connect(userId, memoizedCallbacks.current);
//     } catch (error: any) {
//       setConnectionError(error?.message || 'Failed to connect');
//       console.error('WebSocket connection failed:', error);
//     }
//   }, [userId]);

//   const disconnect = useCallback(async () => {
//     try {
//       await WebSocketService.disconnect();
//     } catch (error) {
//       console.error('WebSocket disconnect failed:', error);
//     }
//   }, []);

//   const sendMessage = useCallback(
//     (messageData: Omit<ChatMessage, 'id' | 'createdAt'>) => {
//       WebSocketService.sendMessage(messageData);
//     },
//     [],
//   );

//   const sendTypingIndicator = useCallback((typingData: TypingIndicator) => {
//     WebSocketService.sendTypingIndicator(typingData);
//   }, []);

//   useEffect(() => {
//     if (autoConnect && userId && !isInitialized.current) {
//       isInitialized.current = true;
//       connect();
//     }

//     return () => {
//       if (isInitialized.current) {
//         disconnect();
//         isInitialized.current = false;
//       }
//     };
//   }, [userId, autoConnect, connect, disconnect]);

//   return {
//     isConnected,
//     connectionError,
//     connect,
//     disconnect,
//     sendMessage,
//     sendTypingIndicator,
//   };
// };






import { useEffect, useRef, useCallback, useState } from 'react';
import WebSocketService, {
  ChatMessage,
  TypingIndicator,
  WebSocketCallbacks,
} from '../services/WebSocketService';

interface UseWebSocketProps {
  userId: string;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (msg: ChatMessage) => void;
  sendTypingIndicator: (data: TypingIndicator) => void;
}

export const useWebSocket = ({
  userId,
  onMessage,
  onTyping,
  autoConnect = true,
}: UseWebSocketProps): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const callbacks: WebSocketCallbacks = {
    onMessage,
    onTyping,
    onConnect: () => {
      setIsConnected(true);
      setConnectionError(null);
    },
    onDisconnect: () => {
      setIsConnected(false);
    },
    onError: error => {
      setConnectionError(error?.message || 'WebSocket connection error');
      setIsConnected(false);
    },
  };

  const connect = useCallback(() => {
    setConnectionError(null);
    WebSocketService.connect(userId, callbacks);
  }, [userId, onMessage, onTyping]);

  const disconnect = useCallback(() => {
    WebSocketService.disconnect();
  }, []);

  const sendMessage = useCallback((msg: ChatMessage) => {
    WebSocketService.sendMessage(msg);
  }, []);

  const sendTypingIndicator = useCallback((data: TypingIndicator) => {
    WebSocketService.sendTypingIndicator(data);
  }, []);

  useEffect(() => {
    if (autoConnect && userId && !isInitialized.current) {
      isInitialized.current = true;
      connect();
    }

    return () => {
      if (isInitialized.current) {
        disconnect();
        isInitialized.current = false;
      }
    };
  }, [userId, autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
  };
};
