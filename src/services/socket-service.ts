import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface PendingSubscription {
  destination: string;
  callback: (message: IMessage) => void;
}

interface ActiveSubscription {
  destination: string;
  stompSubscription: StompSubscription;
  callback: (message: IMessage) => void;
}

export class WebSocketService {
  private userId: string;
  private url: string;
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private pendingSubscriptions: PendingSubscription[] = [];
  private activeSubscriptions: ActiveSubscription[] = [];
  private onConnectCallbacks: (() => void)[] = []; // Support multiple callbacks
  private onDisconnectCallbacks: (() => void)[] = [];
  private isConnecting = false;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(userId: string, url: string) {
    this.userId = userId;
    this.url = url;
  }

  private initClient(): void {
    if (this.client) {
      this.client.deactivate();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.url),
      connectHeaders: {'user-id': this.userId},
      debug: (msg: string) => {
        // console.log(`[STOMP Debug] ${msg}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000, // Increased heartbeat intervals
      heartbeatOutgoing: 30000,
      connectionTimeout: 10000, // Add connection timeout
    });

    this.client.onConnect = frame => {
      console.log('[WebSocketService] Connected successfully!');
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Notify all connect callbacks
      this.onConnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('[WebSocketService] Error in connect callback:', error);
        }
      });

      // Resubscribe to all destinations
      this.resubscribeAll();
    };

    this.client.onDisconnect = frame => {
      console.log('[WebSocketService] Disconnected');
      this.isConnecting = false;

      // Notify all disconnect callbacks
      this.onDisconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(
            '[WebSocketService] Error in disconnect callback:',
            error,
          );
        }
      });

      // Clear active subscriptions but keep them for resubscription
      this.subscriptions = [];
      this.activeSubscriptions.forEach(sub => {
        this.pendingSubscriptions.push({
          destination: sub.destination,
          callback: sub.callback,
        });
      });
      this.activeSubscriptions = [];
    };

    this.client.onStompError = frame => {
      console.error(
        '[WebSocketService] STOMP Error:',
        frame.headers['message'],
        'Details:',
        frame.body,
      );
      this.isConnecting = false;
    };

    this.client.onWebSocketError = event => {
      console.error('[WebSocketService] WebSocket Error:', event);
      this.isConnecting = false;
    };

    this.client.onWebSocketClose = event => {
      console.log(
        '[WebSocketService] WebSocket closed:',
        event.code,
        event.reason,
      );
      this.isConnecting = false;
    };
  }

  private resubscribeAll(): void {
    const toResubscribe = [...this.pendingSubscriptions];
    this.pendingSubscriptions = [];

    toResubscribe.forEach(({destination, callback}) => {
      try {
        const stompSub = this.client!.subscribe(destination, callback);
        this.subscriptions.push(stompSub);
        this.activeSubscriptions.push({
          destination,
          callback,
          stompSubscription: stompSub,
        });
        console.log(`[WebSocketService] Resubscribed to ${destination}`);
      } catch (error) {
        console.error(
          `[WebSocketService] Failed to resubscribe to ${destination}:`,
          error,
        );
        // Put it back in pending
        this.pendingSubscriptions.push({destination, callback});
      }
    });

    this.logAllSubscribedDestinations();
  }

  public addOnConnect(callback: () => void): () => void {
    this.onConnectCallbacks.push(callback);

    // If already connected, call immediately
    if (this.isConnected()) {
      try {
        callback();
      } catch (error) {
        console.error(
          '[WebSocketService] Error in immediate connect callback:',
          error,
        );
      }
    }

    // Return cleanup function
    return () => {
      const index = this.onConnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.onConnectCallbacks.splice(index, 1);
      }
    };
  }

  public addOnDisconnect(callback: () => void): () => void {
    this.onDisconnectCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.onDisconnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.onDisconnectCallbacks.splice(index, 1);
      }
    };
  }

  public isConnected(): boolean {
    return this.client?.connected === true;
  }

  public isConnectingSocket(): boolean {
    return this.isConnecting;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        console.log('[WebSocketService] Already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('[WebSocketService] Connection already in progress');
        // Wait for current connection attempt
        const checkConnection = () => {
          if (this.isConnected()) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.shouldReconnect = true;
      this.isConnecting = true;

      if (!this.client) {
        this.initClient();
      }

      // Set up one-time listeners for this connection attempt
      const connectHandler = () => {
        cleanup();
        resolve();
      };

      const errorHandler = () => {
        cleanup();
        reject(new Error('Connection failed'));
      };

      const cleanup = () => {
        const connectIndex = this.onConnectCallbacks.indexOf(connectHandler);
        if (connectIndex > -1) {
          this.onConnectCallbacks.splice(connectIndex, 1);
        }
        const errorIndex = this.onDisconnectCallbacks.indexOf(errorHandler);
        if (errorIndex > -1) {
          this.onDisconnectCallbacks.splice(errorIndex, 1);
        }
      };

      this.onConnectCallbacks.push(connectHandler);
      this.onDisconnectCallbacks.push(errorHandler);

      try {
        this.client!.activate();
        console.log('[WebSocketService] Connection initiated');

        // Timeout after 15 seconds
        setTimeout(() => {
          if (this.isConnecting && !this.isConnected()) {
            cleanup();
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 15000);
      } catch (error) {
        cleanup();
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.isConnecting = false;

    if (this.client && this.client.active) {
      this.subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.error('[WebSocketService] Error unsubscribing:', error);
        }
      });

      this.subscriptions = [];
      this.activeSubscriptions = [];
      this.pendingSubscriptions = [];

      this.client.deactivate();
      console.log('[WebSocketService] Disconnected and cleaned up');
    }

    // Clear callbacks
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
  }

  public subscribe(
    destination: string,
    callback: (message: IMessage) => void,
  ): StompSubscription | undefined {
    console.log(`[WebSocketService] subscribe() called for ${destination}`);

    // Check if already subscribed
    const existingActive = this.activeSubscriptions.find(
      sub => sub.destination === destination,
    );
    if (existingActive) {
      console.warn(`[WebSocketService] Already subscribed to ${destination}`);
      return existingActive.stompSubscription;
    }

    // Check if already pending
    const isPending = this.pendingSubscriptions.find(
      sub => sub.destination === destination,
    );
    if (isPending) {
      console.warn(
        `[WebSocketService] Subscription already pending for ${destination}`,
      );
      return undefined;
    }

    if (this.isConnected()) {
      try {
        const subscription = this.client!.subscribe(destination, callback);
        this.activeSubscriptions.push({
          destination,
          callback,
          stompSubscription: subscription,
        });
        this.subscriptions.push(subscription);
        console.log(`[WebSocketService] Subscribed to ${destination}`);
        this.logAllSubscribedDestinations();
        return subscription;
      } catch (error) {
        console.error(
          `[WebSocketService] Failed to subscribe to ${destination}:`,
          error,
        );
        // Add to pending for retry
        this.pendingSubscriptions.push({destination, callback});
        return undefined;
      }
    } else {
      console.log(
        `[WebSocketService] Not connected; queueing subscription for ${destination}`,
      );
      this.pendingSubscriptions.push({destination, callback});
      return undefined;
    }
  }

  public unsubscribe(destination: string): void {
    // Remove from active subscriptions
    const activeIndex = this.activeSubscriptions.findIndex(
      sub => sub.destination === destination,
    );

    if (activeIndex !== -1) {
      const {stompSubscription} = this.activeSubscriptions[activeIndex];
      try {
        stompSubscription.unsubscribe();
      } catch (error) {
        console.error(
          `[WebSocketService] Error unsubscribing from ${destination}:`,
          error,
        );
      }

      this.activeSubscriptions.splice(activeIndex, 1);
      this.subscriptions = this.subscriptions.filter(
        sub => sub.id !== stompSubscription.id,
      );
      console.log(`[WebSocketService] Unsubscribed from ${destination}`);
    }

    // Remove from pending subscriptions
    const pendingIndex = this.pendingSubscriptions.findIndex(
      sub => sub.destination === destination,
    );
    if (pendingIndex !== -1) {
      this.pendingSubscriptions.splice(pendingIndex, 1);
      console.log(
        `[WebSocketService] Removed pending subscription for ${destination}`,
      );
    }
  }

  public send(
    destination: string,
    headers: Record<string, string> = {},
    body: string = '',
  ): void {
    if (this.isConnected()) {
      try {
        this.client!.publish({destination, headers, body});
        console.log(`[WebSocketService] Message sent to ${destination}`);
      } catch (error) {
        console.error(
          `[WebSocketService] Failed to send message to ${destination}:`,
          error,
        );
      }
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
    console.log('[WebSocketService] Active subscriptions:');
    this.activeSubscriptions.forEach((sub, index) => {
      console.log(
        `   ${index + 1}. ${sub.destination} (ID: ${sub.stompSubscription.id})`,
      );
    });

    if (this.pendingSubscriptions.length > 0) {
      console.log('[WebSocketService] Pending subscriptions:');
      this.pendingSubscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.destination}`);
      });
    }
  }
}
