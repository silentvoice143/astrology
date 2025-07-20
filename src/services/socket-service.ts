import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface PendingSubscription {
  destination: string;
  callback: (message: IMessage) => void;
}

// 🔹 NEW: Interface to store subscribed details
interface ActiveSubscription {
  destination: string;
  stompSubscription: StompSubscription;
}

export class WebSocketService {
  private userId: string;
  private url: string;
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private pendingSubscriptions: PendingSubscription[] = []; // 🔹 NEW: pending subs buffer
  private activeSubscriptions: ActiveSubscription[] = [];
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
        this.activeSubscriptions.push({destination, stompSubscription: sub});
        console.log(
          `[WebSocketService] Subscribed to ${destination} (pending)`,
        );
      });
      this.pendingSubscriptions = []; // Clear pending queue
      this.logAllSubscribedDestinations();
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
      this.activeSubscriptions = []; // 🔹 Clear this too
      this.pendingSubscriptions = [];
      this.client.deactivate();
      console.log(
        '[WebSocketService] All subscriptions cleared and client deactivated',
      );
    }
  }

  public subscribe(
    destination: string,
    callback: (message: IMessage) => void,
  ): StompSubscription | undefined {
    console.log(`[WebSocketService] subscribe() called for ${destination}`);
    console.log(
      this.activeSubscriptions,
      this.pendingSubscriptions,
      'already subscribed and pending one',
    );
    const existingActive = this.activeSubscriptions.find(
      sub => sub.destination === destination,
    );
    if (existingActive) {
      console.warn(
        `[WebSocketService] Already actively subscribed to ${destination}`,
      );
      return existingActive.stompSubscription; // 🔹 return existing subscription
    }

    const isPending = this.pendingSubscriptions.find(
      sub => sub.destination === destination,
    );
    if (isPending) {
      console.warn(
        `[WebSocketService] Subscription already pending for ${destination}`,
      );
      return undefined; // 🔹 not subscribed yet, can't return one
    }
    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe(destination, callback);
      this.activeSubscriptions.push({
        destination,
        stompSubscription: subscription,
      });
      this.subscriptions.push(subscription);
      console.log(
        `[WebSocketService] Subscribed to ${destination} immediately`,
      );
      this.logAllSubscribedDestinations();
      return subscription;
    } else {
      console.log(
        `[WebSocketService] Not connected yet; queueing subscription for ${destination}`,
      );
      this.pendingSubscriptions.push({destination, callback});
      return undefined;
    }
  }

  public unsubscribe(destination: string): void {
    const index = this.activeSubscriptions.findIndex(
      sub => sub.destination === destination,
    );

    if (index !== -1) {
      const {stompSubscription} = this.activeSubscriptions[index];
      stompSubscription.unsubscribe(); // 🔹 Unsubscribe from STOMP
      this.activeSubscriptions.splice(index, 1); // 🔹 Remove from active
      this.subscriptions = this.subscriptions.filter(
        sub => sub.id !== stompSubscription.id,
      ); // 🔹 Remove from global list

      console.log(`[WebSocketService] Unsubscribed from ${destination}`);
    } else {
      console.warn(
        `[WebSocketService] No active subscription found for ${destination}`,
      );
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

  public logAllSubscribedDestinations(): void {
    if (this.activeSubscriptions.length === 0) {
      console.log('[WebSocketService] No active subscriptions.');
      return;
    }
    console.log(
      '[WebSocketService] Currently subscribed to the following destinations:',
    );
    this.activeSubscriptions.forEach((sub, index) => {
      console.log(
        `  ${index + 1}. ${sub.destination} (STOMP ID: ${
          sub.stompSubscription.id
        })`,
      );
    });
  }
}
