import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private userId: string;
  private url: string;
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];

  constructor(userId: string, url: string) {
    this.userId = userId;
    this.url = url;
  }

  private initClient(): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.url),
      connectHeaders: {'user-id': this.userId},
      debug: (msg: string) => console.log('[STOMP DEBUG]:', msg),
      reconnectDelay: 0,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
    });

    this.client.onConnect = frame => {
      console.log('Connected!', frame);
    };

    this.client.onStompError = frame => {
      console.error('STOMP Error:', frame.headers['message']);
    };
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
      this.client.deactivate();
    }
  }

  public subscribe(
    destination: string,
    callback: (message: IMessage) => void,
  ): StompSubscription | undefined {
    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe(destination, callback);
      this.subscriptions.push(subscription);
      return subscription;
    } else {
      console.warn('Client not connected. Subscription skipped.');
      return undefined;
    }
  }

  public send(
    destination: string,
    headers: Record<string, string> = {},
    body: string = '',
  ): void {
    if (this.client && this.client.connected) {
      (this.client as Client).publish({destination, headers, body});
    } else {
      console.warn('Client not connected. Message not sent.');
    }
  }
}
