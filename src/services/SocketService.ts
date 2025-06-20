// services/SocketService.ts
import SockJS from 'sockjs-client';

class SocketService {
  private static instance: SocketService;
  private socket: WebSocket | null = null;
  private readonly SERVER_URL =
    'https://quagga-driving-socially.ngrok-free.app';
  private connected: boolean = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(onMessage: (message: string) => void): void {
    if (this.connected) return;

    this.socket = new SockJS(this.SERVER_URL);

    this.socket.onopen = () => {
      console.log('[SocketService] Connected');
      this.connected = true;
    };

    this.socket.onmessage = e => {
      console.log('[SocketService] Received:', e.data);
      onMessage(e.data);
    };

    this.socket.onclose = () => {
      console.log('[SocketService] Disconnected');
      this.connected = false;
    };

    this.socket.onerror = err => {
      console.error('[SocketService] Error:', err);
    };
  }

  sendMessage(message: string): void {
    if (this.socket && this.connected) {
      this.socket.send(message);
    } else {
      console.warn('[SocketService] Cannot send message, not connected.');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
      console.log('[SocketService] Connection closed');
    }
  }
}

export default SocketService.getInstance();
