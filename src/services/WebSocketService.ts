// // services/WebSocketService.ts
// import {Client, IMessage} from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// export interface ChatMessage {
//   id?: string;
//   sessionId: string;
//   senderId: string;
//   receiverId: string;
//   message: string;
//   type: 'TEXT' | 'IMAGE' | 'FILE';
//   createdAt?: string;
//   sender?: {
//     id: string;
//     name: string;
//     avatar?: string;
//   };
//   receiver?: {
//     id: string;
//     name: string;
//     avatar?: string;
//   };
// }

// export interface TypingIndicator {
//   senderId: string;
//   receiverId: string;
//   isTyping: boolean;
//   sessionId: string;
// }

// export interface WebSocketCallbacks {
//   onMessage?: (message: ChatMessage) => void;
//   onTyping?: (typing: TypingIndicator) => void;
//   onConnect?: () => void;
//   onDisconnect?: () => void;
//   onError?: (error: any) => void;
// }

// class WebSocketService {
//   private static instance: WebSocketService;
//   private client: Client | null = null;
//   private isConnected = false;
//   private isActivating = false;
//   private currentUserId: string | null = null;
//   private callbacks: WebSocketCallbacks = {};
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectTimeout: NodeJS.Timeout | null = null;

//   private readonly WS_URL =
//     'https://quagga-driving-socially.ngrok-free.app/ws-chat';

//   private constructor() {}

//   static getInstance(): WebSocketService {
//     if (!WebSocketService.instance) {
//       WebSocketService.instance = new WebSocketService();
//     }
//     return WebSocketService.instance;
//   }

//   async connect(
//     userId: string,
//     callbacks: WebSocketCallbacks = {},
//   ): Promise<void> {
//     if (this.client && (this.isConnected || this.isActivating)) {
//       console.warn('[WebSocket] Already connected or connecting. Skipping...');
//       return;
//     }

//     this.currentUserId = userId;
//     this.callbacks = callbacks;
//     this.reconnectAttempts = 0;

//     return new Promise((resolve, reject) => {
//       this.client = new Client({
//         webSocketFactory: () => {
//           const socket = new SockJS(this.WS_URL);
//           return socket as any;
//         },
//         connectHeaders: {
//           'user-id': userId,
//         },
//         debug: str => {
//           console.log('[WebSocket Debug]', str);
//         },
//         reconnectDelay: 5000,
//         heartbeatIncoming: 4000,
//         heartbeatOutgoing: 4000,
//       });

//       this.client.onConnect = () => {
//         this.isConnected = true;
//         this.isActivating = false;
//         this.reconnectAttempts = 0;
//         console.log('[WebSocket] Connected successfully');

//         // Subscribe to user-specific message channel
//         this.client?.subscribe(
//           `/user/${userId}/topic/messages`,
//           (message: IMessage) => {
//             try {
//               const chatMessage: ChatMessage = JSON.parse(message.body);
//               console.log('[WebSocket] Received message:', chatMessage);
//               this.callbacks.onMessage?.(chatMessage);
//             } catch (error) {
//               console.error('[WebSocket] Error parsing message:', error);
//             }
//           },
//         );

//         // Subscribe to typing indicators
//         this.client?.subscribe(
//           `/user/${userId}/topic/typing`,
//           (message: IMessage) => {
//             try {
//               const typingIndicator: TypingIndicator = JSON.parse(message.body);
//               console.log(
//                 '[WebSocket] Received typing indicator:',
//                 typingIndicator,
//               );
//               this.callbacks.onTyping?.(typingIndicator);
//             } catch (error) {
//               console.error(
//                 '[WebSocket] Error parsing typing indicator:',
//                 error,
//               );
//             }
//           },
//         );

//         this.callbacks.onConnect?.();
//         resolve();
//       };

//       this.client.onDisconnect = () => {
//         console.log('[WebSocket] Disconnected');
//         this.isConnected = false;
//         this.callbacks.onDisconnect?.();

//         // Auto-reconnect if not manually disconnected
//         if (
//           this.currentUserId &&
//           this.reconnectAttempts < this.maxReconnectAttempts
//         ) {
//           this.scheduleReconnect();
//         }
//       };

//       this.client.onStompError = frame => {
//         console.error(
//           '[WebSocket] STOMP error:',
//           frame.headers['message'],
//           frame.body,
//         );
//         this.callbacks.onError?.(frame);
//         reject(new Error(`STOMP error: ${frame.headers['message']}`));
//       };

//       this.client.onWebSocketError = error => {
//         console.error('[WebSocket] WebSocket error:', error);
//         this.callbacks.onError?.(error);
//         reject(error);
//       };

//       this.isActivating = true;
//       this.client.activate();
//     });
//   }

//   private scheduleReconnect(): void {
//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//     }

//     const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
//     this.reconnectAttempts++;

//     console.log(
//       `[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
//     );

//     this.reconnectTimeout = setTimeout(() => {
//       if (this.currentUserId && !this.isConnected) {
//         console.log('[WebSocket] Attempting to reconnect...');
//         this.connect(this.currentUserId, this.callbacks);
//       }
//     }, delay);
//   }

//   sendMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): void {
//     if (!this.client || !this.isConnected) {
//       console.warn('[WebSocket] Cannot send message, not connected');
//       return;
//     }

//     const payload = {
//       sessionId: messageData.sessionId,
//       senderId: messageData.senderId,
//       receiverId: messageData.receiverId,
//       message: messageData.message,
//       type: messageData.type || 'TEXT',
//     };

//     try {
//       this.client.publish({
//         destination: '/app/chat.send',
//         body: JSON.stringify(payload),
//       });
//       console.log('[WebSocket] Message sent:', payload);
//     } catch (error) {
//       console.error('[WebSocket] Error sending message:', error);
//       this.callbacks.onError?.(error);
//     }
//   }

//   sendTypingIndicator(typingData: TypingIndicator): void {
//     if (!this.client || !this.isConnected) {
//       console.warn('[WebSocket] Cannot send typing indicator, not connected');
//       return;
//     }

//     try {
//       this.client.publish({
//         destination: '/app/chat.typing',
//         body: JSON.stringify(typingData),
//       });
//       console.log('[WebSocket] Typing indicator sent:', typingData);
//     } catch (error) {
//       console.error('[WebSocket] Error sending typing indicator:', error);
//       this.callbacks.onError?.(error);
//     }
//   }

//   async disconnect(): Promise<void> {
//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//       this.reconnectTimeout = null;
//     }

//     this.currentUserId = null;
//     this.callbacks = {};

//     if (this.client && this.isConnected) {
//       console.log('[WebSocket] Disconnecting...');
//       try {
//         await this.client.deactivate();
//       } catch (error) {
//         console.error('[WebSocket] Error during disconnect:', error);
//       }
//       this.isConnected = false;
//       this.client = null;
//     }
//   }

//   isWebSocketConnected(): boolean {
//     return this.isConnected;
//   }

//   getCurrentUserId(): string | null {
//     return this.currentUserId;
//   }
// }

// export default WebSocketService.getInstance();

import {
  Client,
  IMessage,
  StompHeaders,
  StompSubscription,
} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessage {
  id?: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt?: string;
  sender?: {id: string; name: string; avatar?: string};
  receiver?: {id: string; name: string; avatar?: string};
}

export interface TypingIndicator {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
  sessionId: string;
}

export interface WebSocketCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class WebSocketService {
  private static instance: WebSocketService;
  private client: Client | null = null;
  private isConnected = false;
  private isActivating = false;
  private currentUserId: string | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private manuallyDisconnected = false;

  private readonly WS_URL =
    'https://quagga-driving-socially.ngrok-free.app/ws-chat';
  private readonly maxReconnectAttempts = 5;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(
    userId: string,
    callbacks: WebSocketCallbacks = {},
  ): Promise<void> {
    if (this.isConnected || this.isActivating) {
      console.warn('[WebSocket] Already connected or connecting. Skipping...');
      return;
    }

    this.currentUserId = userId;
    this.callbacks = callbacks;
    this.manuallyDisconnected = false;
    this.reconnectAttempts = 0;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () =>
          new SockJS(this.WS_URL, null, {
            transports: ['websocket'], // Force native WebSocket transport
          }),
        connectHeaders: {
          'user-id': userId,
        },
        debug: str => console.log('[WebSocket Debug]', str),
        reconnectDelay: 5000, // Let it retry automatically
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
      });

    //   const socket = new SockJS(this.WS_URL);
    //   // this.client =

      this.client.onConnect = () => {
        this.isConnected = true;
        this.isActivating = false;
        this.reconnectAttempts = 0;

        console.log('[WebSocket] Connected successfully');

        this.subscribeToTopics(userId);
        this.callbacks.onConnect?.();
        resolve();
      };

      this.client.onDisconnect = () => {
        console.log('[WebSocket] Disconnected');
        this.isConnected = false;
        this.isActivating = false;
        this.callbacks.onDisconnect?.();

        if (
          !this.manuallyDisconnected &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect();
        }
      };

      this.client.onStompError = frame => {
        console.error(
          '[WebSocket] STOMP error:',
          frame.headers['message'],
          frame.body,
        );
        this.isConnected = false;
        this.isActivating = false;
        this.callbacks.onError?.(frame);
        reject(new Error(`STOMP error: ${frame.headers['message']}`));
      };

      this.client.onWebSocketError = error => {
        console.error('[WebSocket] WebSocket error:', error);
        this.isConnected = false;
        this.isActivating = false;
        this.callbacks.onError?.(error);
        reject(error);
      };

      this.isActivating = true;
      this.client.activate();
    });
  }

  private subscribeToTopics(userId: string): void {
    if (!this.client || !this.client.connected) return;

    this.client.subscribe(
      `/user/${userId}/topic/messages`,
      (message: IMessage) => {
        try {
          const parsed: ChatMessage = JSON.parse(message.body);
          console.log('[WebSocket] Received message:', parsed);
          this.callbacks.onMessage?.(parsed);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      },
    );

    this.client.subscribe(
      `/user/${userId}/topic/typing`,
      (message: IMessage) => {
        try {
          const parsed: TypingIndicator = JSON.parse(message.body);
          console.log('[WebSocket] Received typing indicator:', parsed);
          this.callbacks.onTyping?.(parsed);
        } catch (err) {
          console.error('[WebSocket] Failed to parse typing:', err);
        }
      },
    );
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(
      `[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimeout = setTimeout(() => {
      if (this.currentUserId && !this.isConnected && !this.isActivating) {
        console.log('[WebSocket] Attempting to reconnect...');
        this.connect(this.currentUserId, this.callbacks);
      }
    }, delay);
  }

  async disconnect(): Promise<void> {
    this.manuallyDisconnected = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.currentUserId = null;
    this.callbacks = {};

    if (this.client && this.isConnected) {
      console.log('[WebSocket] Disconnecting...');
      try {
        await this.client.deactivate();
      } catch (err) {
        console.error('[WebSocket] Error during disconnect:', err);
      }
    }

    this.isConnected = false;
    this.isActivating = false;
    this.client = null;
  }

  sendMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Cannot send message, not connected');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData),
      });
      console.log('[WebSocket] Message sent:', messageData);
    } catch (err) {
      console.error('[WebSocket] Error sending message:', err);
      this.callbacks.onError?.(err);
    }
  }

  sendTypingIndicator(typingData: TypingIndicator): void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Cannot send typing indicator, not connected');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(typingData),
      });
      console.log('[WebSocket] Typing indicator sent:', typingData);
    } catch (err) {
      console.error('[WebSocket] Error sending typing indicator:', err);
      this.callbacks.onError?.(err);
    }
  }

  // Exposed for guards
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isActivating,
    };
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export default WebSocketService.getInstance();
