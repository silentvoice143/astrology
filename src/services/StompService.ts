import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompService {
  private client: Client | null = null;
  private isConnected = false;
  private isActivating = false;

  private readonly WS_URL = 'https://quagga-driving-socially.ngrok-free.app/ws-chat';

  async connect(userId: string, onMessage: (msg: any) => void) {
    if (this.client && (this.isConnected || this.isActivating)) {
      console.warn('[STOMP] Already connected or connecting. Skipping...');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL),
      connectHeaders: {
        'user-id': userId,
      },
      debug: str => console.log('[STOMP]', str),
      reconnectDelay: 0,
    });

    this.client.onConnect = () => {
      this.isConnected = true;
      this.isActivating = false;
      console.log('[STOMP] Connected');

      this.client?.subscribe(`/user/${userId}/topic/messages`, (message: IMessage) => {
        console.log('[STOMP] Received:', message.body);
        onMessage(JSON.parse(message.body));
      });
    };

    this.client.onDisconnect = () => {
      console.log('[STOMP] Disconnected');
      this.isConnected = false;
    };

    this.client.onStompError = frame => {
      console.error('[STOMP] Broker error', frame.headers['message'], frame.body);
    };

    this.isActivating = true;
    this.client.activate();
  }

  sendMessage(message: string, senderId: string, receiverId: string, sessionId?: string) {
    if (!this.client || !this.isConnected) {
      console.warn('[STOMP] Cannot send, not connected');
      return;
    }

    const payload = {
      message,
      senderId,
      receiverId,
      sessionId,
      type: 'TEXT',
      timestamp: new Date().toISOString(),
    };

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });

    console.log('[STOMP] Sent:', payload);
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      console.log('[STOMP] Disconnecting...');
      await this.client.deactivate();
      this.isConnected = false;
      this.client = null;
    }
  }
}

export default new StompService();
