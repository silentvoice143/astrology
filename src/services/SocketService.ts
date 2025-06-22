import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Platform } from 'react-native';
 
const SOCKET_URL = 'http://<YOUR_SERVER_URL>/ws-chat'; // Replace with your actual backend URL
 
class SocketService {
  private client: Client | null = null;
  private userId: string = '';
  private subscriptions: { [key: string]: StompSubscription } = {};
 
  connect(userId: string, onConnectCallback?: () => void, onErrorCallback?: (error: string) => void) {
    this.userId = userId;
 
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${SOCKET_URL}?user-id=${userId}`),
      connectHeaders: {
        'user-id': userId,
      },
      debug: (str) => {
        console.log('[STOMP DEBUG]', str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Connected to WebSocket');
        onConnectCallback?.();
      },
      onStompError: (frame) => {
        console.error('STOMP Error', frame);
        onErrorCallback?.(frame.body);
      },
      onWebSocketClose: (event) => {
        console.warn('🔌 WebSocket closed', event);
      },
    });
 
    this.client.activate();
  }
 
  disconnect() {
    if (this.client && this.client.active) {
      Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
      this.subscriptions = {};
      this.client.deactivate();
      console.log('👋 Disconnected from WebSocket');
    }
  }
 
  subscribeToMessages(onMessage: (message: any) => void) {
    if (!this.client || !this.client.connected) return;
 
    const destination = `/user/${this.userId}/topic/messages`;
    if (this.subscriptions['messages']) {
      this.subscriptions['messages'].unsubscribe();
    }
 
    this.subscriptions['messages'] = this.client.subscribe(destination, (message) => {
      const body = JSON.parse(message.body);
      onMessage(body);
    });
  }
 
  subscribeToTyping(onTyping: (typing: any) => void) {
    if (!this.client || !this.client.connected) return;
 
    const destination = `/user/${this.userId}/topic/typing`;
    if (this.subscriptions['typing']) {
      this.subscriptions['typing'].unsubscribe();
    }
 
    this.subscriptions['typing'] = this.client.subscribe(destination, (message) => {
      const body = JSON.parse(message.body);
      onTyping(body);
    });
  }
 
  sendMessage(payload: {
    senderId: string;
    receiverId: string;
    sessionId: string;
    message: string;
    type: 'TEXT' | 'IMAGE';
  }) {
    if (!this.client || !this.client.connected) return;
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });
  }
 
  sendTyping(payload: { senderId: string; receiverId: string; typing: boolean }) {
    if (!this.client || !this.client.connected) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    });
  }
}
 
export default new SocketService();
 