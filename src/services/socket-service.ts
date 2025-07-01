import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface PendingSubscription {
  destination: string;
  callback: (message: IMessage) => void;
}

export class WebSocketService {
  private userId: string;
  private url: string;
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private pendingSubscriptions: PendingSubscription[] = []; // 🔹 NEW: pending subs buffer

  private onConnectCallback?: () => void; // 🔹 Declare callbacks properly
  private onDisconnectCallback?: () => void;

  constructor(userId: string, url: string) {
    this.userId = userId;
    this.url = url;
  }

  private initClient(): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.url),
      connectHeaders: {'user-id': this.userId},
      debug: (msg: string) => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = frame => {
      console.log('[WebSocketService] Connected!');
      if (this.onConnectCallback) this.onConnectCallback();

      // 🔹 Process all pending subscriptions after connection
      this.pendingSubscriptions.forEach(({destination, callback}) => {
        const sub = this.client!.subscribe(destination, callback);
        this.subscriptions.push(sub);
        console.log(
          `[WebSocketService] Subscribed to ${destination} (pending)`,
        );
      });
      this.pendingSubscriptions = []; // Clear pending queue
    };

    this.client.onDisconnect = frame => {
      console.log('[WebSocketService] Disconnected!');
      if (this.onDisconnectCallback) this.onDisconnectCallback();
    };

    this.client.onStompError = frame => {
      console.error(
        '[WebSocketService] STOMP Error:',
        frame.headers['message'],
      );
    };
  }

  public setOnConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }

  public setOnDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  public connect(): void {
    if (!this.client) {
      this.initClient();
    }
    this.client?.activate();
  }

  public disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      this.pendingSubscriptions = []; // 🔹 clear pending subs
      this.client.deactivate();
    }
  }

  public subscribe(
    destination: string,
    callback: (message: IMessage) => void,
  ): StompSubscription | undefined {
    console.log(`[WebSocketService] subscribe() called for ${destination}`);
    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe(destination, callback);
      this.subscriptions.push(subscription);
      console.log(
        `[WebSocketService] Subscribed to ${destination} immediately`,
      );
      return subscription;
    } else {
      console.log(
        `[WebSocketService] Not connected yet; queueing subscription for ${destination}`,
      );
      this.pendingSubscriptions.push({destination, callback});
      return undefined;
    }
  }

  public send(
    destination: string,
    headers: Record<string, string> = {},
    body: string = '',
  ): void {
    if (this.client && this.client.connected) {
      this.client.publish({destination, headers, body});
    } else {
      console.warn(
        '[WebSocketService] Client not connected. Message not sent.',
      );
    }
  }
}
