// services/StompService.ts
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompService {
  private client: Client;
  private readonly WS_URL = 'https://quagga-driving-socially.ngrok-free.app/ws-chat'; // Add `/ws-chat` endpoint
  private receiverId: string | null = null;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL),
      reconnectDelay: 5000,
      debug: str => console.log('[STOMP]', str),
    });
  }

  connect(receiverId: string, onMessage: (msg: any) => void): void {
    this.receiverId = receiverId;

    this.client.onConnect = () => {
      console.log('[STOMP] Connected');
      this.client.subscribe(`/user/${receiverId}/topic/messages`, (message: IMessage) => {
        const body = JSON.parse(message.body);
        onMessage(body);
      });
    };

    this.client.onStompError = frame => {
      console.error('[STOMP] Broker error', frame.headers['message'], frame.body);
    };

    this.client.activate();
  }

  sendMessage(content: string, senderId: string, receiverId: string): void {
    if (this.client.connected) {
      const payload = {
        content,
        senderId,
        receiverId,
      };

      this.client.publish({
        destination: '/app/chat.send', // your backend @MessageMapping
        body: JSON.stringify(payload),
      });
    }
  }

  disconnect(): void {
    this.client.deactivate();
  }
}

export default new StompService();
