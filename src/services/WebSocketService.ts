// // services/WebSocketService.ts
import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessage {
  id?: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver?: {
    id: string;
    name: string;
    avatar?: string;
  };
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
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private readonly WS_URL =
    'https://quagga-driving-socially.ngrok-free.app/ws-chat';

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
    if (this.client && (this.isConnected || this.isActivating)) {
      console.warn('[WebSocket] Already connected or connecting. Skipping...');
      return;
    }

    this.currentUserId = userId;
    this.callbacks = callbacks;
    this.reconnectAttempts = 0;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => {
          const socket = new SockJS(this.WS_URL);
          return socket as any;
        },
        connectHeaders: {
          'user-id': userId,
        },
        debug: str => {
          console.log('[WebSocket Debug]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        this.isActivating = false;
        this.reconnectAttempts = 0;
        console.log('[WebSocket] Connected successfully');

        // Subscribe to user-specific message channel
        this.client?.subscribe(
          `/user/${userId}/topic/messages`,
          (message: IMessage) => {
            try {
              const chatMessage: ChatMessage = JSON.parse(message.body);
              console.log('[WebSocket] Received message:', chatMessage);
              this.callbacks.onMessage?.(chatMessage);
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
            }
          },
        );

        // Subscribe to typing indicators
        this.client?.subscribe(
          `/user/${userId}/topic/typing`,
          (message: IMessage) => {
            try {
              const typingIndicator: TypingIndicator = JSON.parse(message.body);
              console.log(
                '[WebSocket] Received typing indicator:',
                typingIndicator,
              );
              this.callbacks.onTyping?.(typingIndicator);
            } catch (error) {
              console.error(
                '[WebSocket] Error parsing typing indicator:',
                error,
              );
            }
          },
        );

        this.callbacks.onConnect?.();
        resolve();
      };

      this.client.onDisconnect = () => {
        console.log('[WebSocket] Disconnected');
        this.isConnected = false;
        this.callbacks.onDisconnect?.();

        // Auto-reconnect if not manually disconnected
        if (
          this.currentUserId &&
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
        this.callbacks.onError?.(frame);
        reject(new Error(`STOMP error: ${frame.headers['message']}`));
      };

      this.client.onWebSocketError = error => {
        console.error('[WebSocket] WebSocket error:', error);
        this.callbacks.onError?.(error);
        reject(error);
      };

      this.isActivating = true;
      this.client.activate();
    });
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
      if (this.currentUserId && !this.isConnected) {
        console.log('[WebSocket] Attempting to reconnect...');
        this.connect(this.currentUserId, this.callbacks);
      }
    }, delay);
  }

  sendMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Cannot send message, not connected');
      return;
    }

    const payload = {
      sessionId: messageData.sessionId,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      message: messageData.message,
      type: messageData.type || 'TEXT',
    };

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload),
      });
      console.log('[WebSocket] Message sent:', payload);
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      this.callbacks.onError?.(error);
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
    } catch (error) {
      console.error('[WebSocket] Error sending typing indicator:', error);
      this.callbacks.onError?.(error);
    }
  }

  async disconnect(): Promise<void> {
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
      } catch (error) {
        console.error('[WebSocket] Error during disconnect:', error);
      }
      this.isConnected = false;
      this.client = null;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export default WebSocketService.getInstance();


// import { Client, IMessage } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// export interface ChatMessage {
//   id?: string;
//   sessionId: string;
//   senderId: string;
//   receiverId: string;
//   message: string;
//   type: 'TEXT' | 'IMAGE' | 'FILE';
//   createdAt?: string;
//   sender?: { id: string; name: string; avatar?: string };
//   receiver?: { id: string; name: string; avatar?: string };
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
//   private userId: string = '';
//   private callbacks: WebSocketCallbacks = {};
//   private isConnected: boolean = false;

//   private readonly WS_URL = 'https://quagga-driving-socially.ngrok-free.app/ws-chat';

//   static getInstance(): WebSocketService {
//     if (!WebSocketService.instance) {
//       WebSocketService.instance = new WebSocketService();
//     }
//     return WebSocketService.instance;
//   }

//   connect(userId: string, callbacks: WebSocketCallbacks = {}) {
//     if (this.client?.connected) return;

//     this.userId = userId;
//     this.callbacks = callbacks;

//     this.client = new Client({
//       webSocketFactory: () => new SockJS(`${this.WS_URL}?user-id=${userId}`),
//       connectHeaders: {
//         'user-id': userId,
//       },
//       debug: (msg) => console.log('[WebSocket]', msg),
//       reconnectDelay: 5000,
//       onConnect: () => {
//         this.isConnected = true;
//         console.log('[WebSocket] Connected');
//         this.subscribeTopics();
//         this.callbacks.onConnect?.();
//       },
//       onDisconnect: () => {
//         this.isConnected = false;
//         console.log('[WebSocket] Disconnected');
//         this.callbacks.onDisconnect?.();
//       },
//       onStompError: (frame) => {
//         console.error('[WebSocket] STOMP Error:', frame.body);
//         this.callbacks.onError?.(frame);
//       },
//       onWebSocketError: (error) => {
//         console.error('[WebSocket] WebSocket Error:', error);
//         this.callbacks.onError?.(error);
//       },
//     });

//     this.client.activate();
//   }

//   private subscribeTopics() {
//     if (!this.client || !this.client.connected) return;

//     this.client.subscribe(`/user/${this.userId}/topic/messages`, (message: IMessage) => {
//       try {
//         const data: ChatMessage = JSON.parse(message.body);
//         this.callbacks.onMessage?.(data);
//       } catch (err) {
//         console.error('[WebSocket] Error parsing message:', err);
//       }
//     });

//     this.client.subscribe(`/user/${this.userId}/topic/typing`, (message: IMessage) => {
//       try {
//         const data: TypingIndicator = JSON.parse(message.body);
//         this.callbacks.onTyping?.(data);
//       } catch (err) {
//         console.error('[WebSocket] Error parsing typing:', err);
//       }
//     });
//   }

//   sendMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>) {
//     if (!this.client || !this.client.connected) return;
//     this.client.publish({
//       destination: '/app/chat.send',
//       body: JSON.stringify(message),
//     });
//   }

//   sendTypingIndicator(data: TypingIndicator) {
//     if (!this.client || !this.client.connected) return;
//     this.client.publish({
//       destination: '/app/chat.typing',
//       body: JSON.stringify(data),
//     });
//   }

//   disconnect() {
//     if (this.client && this.client.connected) {
//       this.client.deactivate();
//       this.isConnected = false;
//       this.userId = '';
//     }
//   }

//   isWebSocketConnected() {
//     return this.client?.connected ?? false;
//   }
// }

// export default WebSocketService.getInstance();
