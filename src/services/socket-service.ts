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
      this.shouldReconnect = true;

      // Notify all connect callbacks
      this.onConnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          // console.log('[WebSocketService] Error in connect callback:', error);
        }
      });

      // Resubscribe to all destinations
      this.resubscribeAll();
    };

    this.client.onDisconnect = frame => {
      console.log('[WebSocketService] Disconnected');
      this.isConnecting = this.shouldReconnect;

      // Notify all disconnect callbacks
      this.onDisconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          // console.log(
          //   '[WebSocketService] Error in disconnect callback:',
          //   error,
          // );
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
      // console.log(
      //   '[WebSocketService] STOMP Error:',
      //   frame.headers['message'],
      //   'Details:',
      //   frame.body,
      // );
      this.isConnecting = false;
    };

    this.client.onWebSocketError = event => {
      // console.log('[WebSocketService] WebSocket Error:', event);
      this.isConnecting = false;
    };

    this.client.onWebSocketClose = event => {
      console.log(
        '[WebSocketService] WebSocket closed:',
        event.code,
        event.reason,
      );
      this.isConnecting = this.shouldReconnect;

      // 1. Notify all disconnect callbacks that the WebSocket is closed.
      // This will set the `connected` state to `false` in your `useWebSocket` hook.
      this.onDisconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          // console.log(
          //   '[WebSocketService] Error in WebSocket close disconnect callback:',
          //   error,
          // );
        }
      });

      // 2. Clear active subscriptions and queue them for resubscription,
      // similar to how onDisconnect handles it, because a raw WebSocket close
      // means the STOMP connection is also effectively lost.
      this.subscriptions = [];
      this.activeSubscriptions.forEach(sub => {
        this.pendingSubscriptions.push({
          destination: sub.destination,
          callback: sub.callback,
        });
      });
      this.activeSubscriptions = [];

      // Optional: Trigger reconnection logic here if not handled by STOMP's reconnectDelay
      // The STOMP client itself has `reconnectDelay`, so it will likely try to reconnect.
      // You might want to add custom reconnection logic if `shouldReconnect` is false
      // or if you need more granular control beyond STOMP's built-in feature.
      if (
        this.shouldReconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.isConnecting = true;
        // STOMP's reconnectDelay will handle this.
        // If you had custom exponential backoff here, you'd trigger it now.
        // For now, rely on STOMP.js's built-in reconnect mechanism.
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn(
          '[WebSocketService] Max reconnect attempts reached after WebSocket close.',
        );
        this.shouldReconnect = false; // Stop further automatic reconnections
        this.isConnecting = false;
      }
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
        // console.log(
        //   `[WebSocketService] Failed to resubscribe to ${destination}:`,
        //   error,
        // );
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
        // console.log(
        //   '[WebSocketService] Error in immediate connect callback:',
        //   error,
        // );
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
          console.log('[WebSocketService] Error unsubscribing:', error);
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
        // console.log(
        //   `[WebSocketService] Failed to subscribe to ${destination}:`,
        //   error,
        // );
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
        // console.log(
        //   `[WebSocketService] Error unsubscribing from ${destination}:`,
        //   error,
        // );
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
        // console.log(
        //   `[WebSocketService] Failed to send message to ${destination}:`,
        //   error,
        // );
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
// import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// interface PendingSubscription {
//   destination: string;
//   callback: (message: IMessage) => void;
// }

// interface ActiveSubscription {
//   destination: string;
//   stompSubscription: StompSubscription;
//   callback: (message: IMessage) => void;
// }

// export enum ConnectionState {
//   DISCONNECTED = 'DISCONNECTED',
//   CONNECTING = 'CONNECTING',
//   CONNECTED = 'CONNECTED',
//   RECONNECTING = 'RECONNECTING',
//   FAILED = 'FAILED',
// }

// export interface ConnectionStatus {
//   state: ConnectionState;
//   error?: string;
//   reconnectAttempt?: number;
//   maxAttempts?: number;
// }

// export class WebSocketService {
//   private userId: string;
//   private url: string;
//   private client: Client | null = null;
//   private subscriptions: StompSubscription[] = [];
//   private pendingSubscriptions: PendingSubscription[] = [];
//   private activeSubscriptions: ActiveSubscription[] = [];
//   private onConnectCallbacks: (() => void)[] = [];
//   private onDisconnectCallbacks: (() => void)[] = [];
//   private onConnectionStateChangeCallbacks: ((
//     status: ConnectionStatus,
//   ) => void)[] = [];

//   // Enhanced state management
//   private connectionState = ConnectionState.DISCONNECTED;
//   private shouldReconnect = true;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 10;
//   private reconnectDelay = 5000;
//   private isInitialConnection = true;
//   private lastError: string | null = null;

//   constructor(userId: string, url: string) {
//     this.userId = userId;
//     this.url = url;
//   }

//   private setConnectionState(state: ConnectionState, error?: string): void {
//     const previousState = this.connectionState;
//     this.connectionState = state;

//     if (error) {
//       this.lastError = error;
//     } else if (state === ConnectionState.CONNECTED) {
//       this.lastError = null;
//     }

//     const status: ConnectionStatus = {
//       state,
//       error: this.lastError || undefined,
//       reconnectAttempt: this.reconnectAttempts,
//       maxAttempts: this.maxReconnectAttempts,
//     };

//     // Notify state change callbacks
//     this.onConnectionStateChangeCallbacks.forEach(callback => {
//       try {
//         callback(status);
//       } catch (error) {
//         console.log(
//           '[WebSocketService] Error in state change callback:',
//           error,
//         );
//       }
//     });

//     console.log(
//       `[WebSocketService] State changed: ${previousState} -> ${state}`,
//     );
//   }

//   private initClient(): void {
//     if (this.client) {
//       this.client.deactivate();
//     }

//     this.client = new Client({
//       webSocketFactory: () => new SockJS(this.url),
//       connectHeaders: {'user-id': this.userId},
//       debug: (msg: string) => {
//         // console.log(`[STOMP Debug] ${msg}`);
//       },
//       reconnectDelay: this.reconnectDelay,
//       heartbeatIncoming: 30000,
//       heartbeatOutgoing: 30000,
//       connectionTimeout: 10000,
//     });

//     this.client.onConnect = frame => {
//       console.log('[WebSocketService] Connected successfully!');
//       this.reconnectAttempts = 0;
//       this.shouldReconnect = true;
//       this.isInitialConnection = false;
//       this.setConnectionState(ConnectionState.CONNECTED);

//       // Notify all connect callbacks
//       this.onConnectCallbacks.forEach(callback => {
//         try {
//           callback();
//         } catch (error) {
//           console.log('[WebSocketService] Error in connect callback:', error);
//         }
//       });

//       // Resubscribe to all destinations
//       this.resubscribeAll();
//     };

//     this.client.onDisconnect = frame => {
//       console.log('[WebSocketService] Disconnected');

//       // Only show as reconnecting if we should reconnect and haven't exceeded max attempts
//       if (
//         this.shouldReconnect &&
//         this.reconnectAttempts < this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.RECONNECTING);
//       } else {
//         this.setConnectionState(ConnectionState.DISCONNECTED);
//       }

//       // Notify all disconnect callbacks
//       this.onDisconnectCallbacks.forEach(callback => {
//         try {
//           callback();
//         } catch (error) {
//           console.log(
//             '[WebSocketService] Error in disconnect callback:',
//             error,
//           );
//         }
//       });

//       // Clear active subscriptions but keep them for resubscription
//       this.subscriptions = [];
//       this.activeSubscriptions.forEach(sub => {
//         this.pendingSubscriptions.push({
//           destination: sub.destination,
//           callback: sub.callback,
//         });
//       });
//       this.activeSubscriptions = [];
//     };

//     this.client.onStompError = frame => {
//       const errorMsg = `STOMP Error: ${frame.headers['message']} - ${frame.body}`;
//       console.log('[WebSocketService]', errorMsg);

//       // Only set failed state if we're not reconnecting or exceeded max attempts
//       if (
//         !this.shouldReconnect ||
//         this.reconnectAttempts >= this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.FAILED, errorMsg);
//       }
//     };

//     this.client.onWebSocketError = event => {
//       const errorMsg = `WebSocket Error: ${
//         event.message || 'Connection error'
//       }`;
//       console.log('[WebSocketService]', errorMsg);

//       // Only set failed state if we're not reconnecting or exceeded max attempts
//       if (
//         !this.shouldReconnect ||
//         this.reconnectAttempts >= this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.FAILED, errorMsg);
//       }
//     };

//     this.client.onWebSocketClose = event => {
//       console.log(
//         '[WebSocketService] WebSocket closed:',
//         event.code,
//         event.reason,
//       );

//       // Increment reconnect attempts
//       if (this.shouldReconnect && !this.isInitialConnection) {
//         this.reconnectAttempts++;
//       }

//       // Notify disconnect callbacks
//       this.onDisconnectCallbacks.forEach(callback => {
//         try {
//           callback();
//         } catch (error) {
//           console.log(
//             '[WebSocketService] Error in WebSocket close disconnect callback:',
//             error,
//           );
//         }
//       });

//       // Clear active subscriptions and queue them for resubscription
//       this.subscriptions = [];
//       this.activeSubscriptions.forEach(sub => {
//         this.pendingSubscriptions.push({
//           destination: sub.destination,
//           callback: sub.callback,
//         });
//       });
//       this.activeSubscriptions = [];

//       // Handle reconnection state
//       if (
//         this.shouldReconnect &&
//         this.reconnectAttempts < this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.RECONNECTING);
//       } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//         console.warn(
//           '[WebSocketService] Max reconnect attempts reached after WebSocket close.',
//         );
//         this.shouldReconnect = false;
//         this.setConnectionState(
//           ConnectionState.FAILED,
//           'Max reconnection attempts exceeded',
//         );
//       } else {
//         this.setConnectionState(ConnectionState.DISCONNECTED);
//       }
//     };
//   }

//   private resubscribeAll(): void {
//     const toResubscribe = [...this.pendingSubscriptions];
//     this.pendingSubscriptions = [];

//     toResubscribe.forEach(({destination, callback}) => {
//       try {
//         const stompSub = this.client!.subscribe(destination, callback);
//         this.subscriptions.push(stompSub);
//         this.activeSubscriptions.push({
//           destination,
//           callback,
//           stompSubscription: stompSub,
//         });
//         console.log(`[WebSocketService] Resubscribed to ${destination}`);
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Failed to resubscribe to ${destination}:`,
//           error,
//         );
//         // Put it back in pending
//         this.pendingSubscriptions.push({destination, callback});
//       }
//     });

//     this.logAllSubscribedDestinations();
//   }

//   // New method to add connection state change listeners
//   public addOnConnectionStateChange(
//     callback: (status: ConnectionStatus) => void,
//   ): () => void {
//     this.onConnectionStateChangeCallbacks.push(callback);

//     // Call immediately with current state
//     const currentStatus: ConnectionStatus = {
//       state: this.connectionState,
//       error: this.lastError || undefined,
//       reconnectAttempt: this.reconnectAttempts,
//       maxAttempts: this.maxReconnectAttempts,
//     };

//     try {
//       callback(currentStatus);
//     } catch (error) {
//       console.log(
//         '[WebSocketService] Error in immediate state change callback:',
//         error,
//       );
//     }

//     // Return cleanup function
//     return () => {
//       const index = this.onConnectionStateChangeCallbacks.indexOf(callback);
//       if (index > -1) {
//         this.onConnectionStateChangeCallbacks.splice(index, 1);
//       }
//     };
//   }

//   public addOnConnect(callback: () => void): () => void {
//     this.onConnectCallbacks.push(callback);

//     // If already connected, call immediately
//     if (this.isConnected()) {
//       try {
//         callback();
//       } catch (error) {
//         console.log(
//           '[WebSocketService] Error in immediate connect callback:',
//           error,
//         );
//       }
//     }

//     // Return cleanup function
//     return () => {
//       const index = this.onConnectCallbacks.indexOf(callback);
//       if (index > -1) {
//         this.onConnectCallbacks.splice(index, 1);
//       }
//     };
//   }

//   public addOnDisconnect(callback: () => void): () => void {
//     this.onDisconnectCallbacks.push(callback);

//     // Return cleanup function
//     return () => {
//       const index = this.onDisconnectCallbacks.indexOf(callback);
//       if (index > -1) {
//         this.onDisconnectCallbacks.splice(index, 1);
//       }
//     };
//   }

//   public isConnected(): boolean {
//     return this.client?.connected === true;
//   }

//   public isConnecting(): boolean {
//     return this.connectionState === ConnectionState.CONNECTING;
//   }

//   public isReconnecting(): boolean {
//     return this.connectionState === ConnectionState.RECONNECTING;
//   }

//   public getConnectionState(): ConnectionState {
//     return this.connectionState;
//   }

//   public getConnectionStatus(): ConnectionStatus {
//     return {
//       state: this.connectionState,
//       error: this.lastError || undefined,
//       reconnectAttempt: this.reconnectAttempts,
//       maxAttempts: this.maxReconnectAttempts,
//     };
//   }

//   public connect(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (this.isConnected()) {
//         console.log('[WebSocketService] Already connected');
//         resolve();
//         return;
//       }

//       if (this.isConnecting() || this.isReconnecting()) {
//         console.log('[WebSocketService] Connection already in progress');
//         // Wait for current connection attempt
//         const checkConnection = () => {
//           if (this.isConnected()) {
//             resolve();
//           } else if (
//             this.connectionState === ConnectionState.FAILED ||
//             this.connectionState === ConnectionState.DISCONNECTED
//           ) {
//             reject(new Error(this.lastError || 'Connection failed'));
//           } else {
//             setTimeout(checkConnection, 100);
//           }
//         };
//         checkConnection();
//         return;
//       }

//       this.shouldReconnect = true;
//       this.setConnectionState(ConnectionState.CONNECTING);

//       if (!this.client) {
//         this.initClient();
//       }

//       // Set up one-time listeners for this connection attempt
//       const connectHandler = () => {
//         cleanup();
//         resolve();
//       };

//       const errorHandler = () => {
//         cleanup();
//         reject(new Error(this.lastError || 'Connection failed'));
//       };

//       const cleanup = () => {
//         const connectIndex = this.onConnectCallbacks.indexOf(connectHandler);
//         if (connectIndex > -1) {
//           this.onConnectCallbacks.splice(connectIndex, 1);
//         }
//         const errorIndex = this.onDisconnectCallbacks.indexOf(errorHandler);
//         if (errorIndex > -1) {
//           this.onDisconnectCallbacks.splice(errorIndex, 1);
//         }
//       };

//       this.onConnectCallbacks.push(connectHandler);
//       this.onDisconnectCallbacks.push(errorHandler);

//       try {
//         this.client!.activate();
//         console.log('[WebSocketService] Connection initiated');

//         // Timeout after 15 seconds
//         setTimeout(() => {
//           if (
//             (this.isConnecting() || this.isReconnecting()) &&
//             !this.isConnected()
//           ) {
//             cleanup();
//             this.setConnectionState(
//               ConnectionState.FAILED,
//               'Connection timeout',
//             );
//             reject(new Error('Connection timeout'));
//           }
//         }, 15000);
//       } catch (error) {
//         cleanup();
//         this.setConnectionState(
//           ConnectionState.FAILED,
//           error instanceof Error ? error.message : 'Connection error',
//         );
//         reject(error);
//       }
//     });
//   }

//   public disconnect(): void {
//     this.shouldReconnect = false;
//     this.setConnectionState(ConnectionState.DISCONNECTED);

//     if (this.client && this.client.active) {
//       this.subscriptions.forEach(sub => {
//         try {
//           sub.unsubscribe();
//         } catch (error) {
//           console.log('[WebSocketService] Error unsubscribing:', error);
//         }
//       });

//       this.subscriptions = [];
//       this.activeSubscriptions = [];
//       this.pendingSubscriptions = [];

//       this.client.deactivate();
//       console.log('[WebSocketService] Disconnected and cleaned up');
//     }

//     // Clear callbacks
//     this.onConnectCallbacks = [];
//     this.onDisconnectCallbacks = [];
//     this.onConnectionStateChangeCallbacks = [];
//   }

//   // Method to retry connection manually
//   public retryConnection(): Promise<void> {
//     if (this.connectionState !== ConnectionState.FAILED) {
//       return Promise.resolve();
//     }

//     this.reconnectAttempts = 0;
//     this.lastError = null;
//     return this.connect();
//   }

//   public subscribe(
//     destination: string,
//     callback: (message: IMessage) => void,
//   ): StompSubscription | undefined {
//     console.log(`[WebSocketService] subscribe() called for ${destination}`);

//     // Check if already subscribed
//     const existingActive = this.activeSubscriptions.find(
//       sub => sub.destination === destination,
//     );
//     if (existingActive) {
//       console.warn(`[WebSocketService] Already subscribed to ${destination}`);
//       return existingActive.stompSubscription;
//     }

//     // Check if already pending
//     const isPending = this.pendingSubscriptions.find(
//       sub => sub.destination === destination,
//     );
//     if (isPending) {
//       console.warn(
//         `[WebSocketService] Subscription already pending for ${destination}`,
//       );
//       return undefined;
//     }

//     if (this.isConnected()) {
//       try {
//         const subscription = this.client!.subscribe(destination, callback);
//         this.activeSubscriptions.push({
//           destination,
//           callback,
//           stompSubscription: subscription,
//         });
//         this.subscriptions.push(subscription);
//         console.log(`[WebSocketService] Subscribed to ${destination}`);
//         this.logAllSubscribedDestinations();
//         return subscription;
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Failed to subscribe to ${destination}:`,
//           error,
//         );
//         // Add to pending for retry
//         this.pendingSubscriptions.push({destination, callback});
//         return undefined;
//       }
//     } else {
//       console.log(
//         `[WebSocketService] Not connected; queueing subscription for ${destination}`,
//       );
//       this.pendingSubscriptions.push({destination, callback});
//       return undefined;
//     }
//   }

//   public unsubscribe(destination: string): void {
//     // Remove from active subscriptions
//     const activeIndex = this.activeSubscriptions.findIndex(
//       sub => sub.destination === destination,
//     );

//     if (activeIndex !== -1) {
//       const {stompSubscription} = this.activeSubscriptions[activeIndex];
//       try {
//         stompSubscription.unsubscribe();
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Error unsubscribing from ${destination}:`,
//           error,
//         );
//       }

//       this.activeSubscriptions.splice(activeIndex, 1);
//       this.subscriptions = this.subscriptions.filter(
//         sub => sub.id !== stompSubscription.id,
//       );
//       console.log(`[WebSocketService] Unsubscribed from ${destination}`);
//     }

//     // Remove from pending subscriptions
//     const pendingIndex = this.pendingSubscriptions.findIndex(
//       sub => sub.destination === destination,
//     );
//     if (pendingIndex !== -1) {
//       this.pendingSubscriptions.splice(pendingIndex, 1);
//       console.log(
//         `[WebSocketService] Removed pending subscription for ${destination}`,
//       );
//     }
//   }

//   public send(
//     destination: string,
//     headers: Record<string, string> = {},
//     body: string = '',
//   ): void {
//     if (this.isConnected()) {
//       try {
//         this.client!.publish({destination, headers, body});
//         console.log(`[WebSocketService] Message sent to ${destination}`);
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Failed to send message to ${destination}:`,
//           error,
//         );
//       }
//     } else {
//       console.warn(
//         '[WebSocketService] Client not connected. Message not sent.',
//       );
//     }
//   }

//   public logAllSubscribedDestinations(): void {
//     if (this.activeSubscriptions.length === 0) {
//       console.log('[WebSocketService] No active subscriptions.');
//       return;
//     }
//     console.log('[WebSocketService] Active subscriptions:');
//     this.activeSubscriptions.forEach((sub, index) => {
//       console.log(
//         `   ${index + 1}. ${sub.destination} (ID: ${sub.stompSubscription.id})`,
//       );
//     });

//     if (this.pendingSubscriptions.length > 0) {
//       console.log('[WebSocketService] Pending subscriptions:');
//       this.pendingSubscriptions.forEach((sub, index) => {
//         console.log(`   ${index + 1}. ${sub.destination}`);
//       });
//     }
//   }
// }

// import {useCallback, useEffect, useState, useRef, useMemo} from 'react';
// import {IMessage, StompSubscription} from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import {Client} from '@stomp/stompjs'; // Explicitly import Client

// // --- WebSocketService Definition (Moved here for self-containment) ---

// interface PendingSubscription {
//   destination: string;
//   callback: (message: IMessage) => void;
// }

// interface ActiveSubscription {
//   destination: string;
//   stompSubscription: StompSubscription;
//   callback: (message: IMessage) => void;
// }

// export enum ConnectionState {
//   DISCONNECTED = 'DISCONNECTED',
//   CONNECTING = 'CONNECTING',
//   CONNECTED = 'CONNECTED',
//   RECONNECTING = 'RECONNECTING',
//   FAILED = 'FAILED',
// }

// export interface ConnectionStatus {
//   state: ConnectionState;
//   error?: string;
//   reconnectAttempt?: number;
//   maxAttempts?: number;
// }

// // Options for WebSocketService
// interface WebSocketServiceOptions {
//   maxReconnectAttempts?: number;
//   reconnectDelay?: number;
//   connectionTimeout?: number;
//   debug?: boolean;
// }

// export class WebSocketService {
//   private userId: string;
//   private url: string;
//   private client: Client | null = null;
//   private subscriptions: StompSubscription[] = [];
//   private pendingSubscriptions: PendingSubscription[] = [];
//   private activeSubscriptions: ActiveSubscription[] = [];
//   private onConnectCallbacks: (() => void)[] = [];
//   private onDisconnectCallbacks: (() => void)[] = [];
//   private onConnectionStateChangeCallbacks: ((
//     status: ConnectionStatus,
//   ) => void)[] = [];

//   // Enhanced state management
//   private connectionState = ConnectionState.DISCONNECTED;
//   private shouldReconnect = true;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts: number;
//   private reconnectDelay: number;
//   private connectionTimeout: number;
//   private isInitialConnection = true;
//   private lastError: string | null = null;
//   private debug: boolean; // Debug flag for WebSocketService

//   constructor(userId: string, url: string, options?: WebSocketServiceOptions) {
//     this.userId = userId;
//     this.url = url;
//     // Initialize configurable properties from options or use defaults
//     this.maxReconnectAttempts = options?.maxReconnectAttempts ?? 10;
//     this.reconnectDelay = options?.reconnectDelay ?? 5000;
//     this.connectionTimeout = options?.connectionTimeout ?? 10000;
//     this.debug = options?.debug ?? false; // Set debug flag
//   }

//   private setConnectionState(state: ConnectionState, error?: string): void {
//     const previousState = this.connectionState;
//     this.connectionState = state;

//     if (error) {
//       this.lastError = error;
//     } else if (state === ConnectionState.CONNECTED) {
//       this.lastError = null;
//     }

//     const status: ConnectionStatus = {
//       state,
//       error: this.lastError || undefined,
//       reconnectAttempt: this.reconnectAttempts,
//       maxAttempts: this.maxReconnectAttempts,
//     };

//     // Notify state change callbacks
//     this.onConnectionStateChangeCallbacks.forEach(callback => {
//       try {
//         callback(status);
//       } catch (error) {
//         console.log(
//           '[WebSocketService] Error in state change callback:',
//           error,
//         );
//       }
//     });

//     if (this.debug) {
//       // Conditionally log state changes
//       console.log(
//         `[WebSocketService] State changed: ${previousState} -> ${state}`,
//       );
//     }
//   }

//   private initClient(): void {
//     if (this.client) {
//       this.client.deactivate();
//     }

//     this.client = new Client({
//       webSocketFactory: () => new SockJS(this.url),
//       connectHeaders: {'user-id': this.userId},
//       debug: (msg: string) => {
//         if (this.debug) {
//           // Conditionally log STOMP debug messages
//           console.log(`[STOMP Debug] ${msg}`);
//         }
//       },
//       reconnectDelay: this.reconnectDelay, // Use configured reconnect delay
//       heartbeatIncoming: 30000,
//       heartbeatOutgoing: 30000,
//       connectionTimeout: this.connectionTimeout, // Use configured connection timeout
//     });

//     this.client.onConnect = frame => {
//       if (this.debug) {
//         console.log('[WebSocketService] Connected successfully!');
//       }
//       this.reconnectAttempts = 0;
//       this.shouldReconnect = true;
//       this.isInitialConnection = false;
//       this.setConnectionState(ConnectionState.CONNECTED);

//       // Notify all connect callbacks
//       this.onConnectCallbacks.forEach(callback => {
//         try {
//           callback();
//         } catch (error) {
//           console.log('[WebSocketService] Error in connect callback:', error);
//         }
//       });

//       // Resubscribe to all destinations
//       this.resubscribeAll();
//     };

//     this.client.onDisconnect = frame => {
//       if (this.debug) {
//         console.log('[WebSocketService] Disconnected');
//       }

//       // Only show as reconnecting if we should reconnect and haven't exceeded max attempts
//       if (
//         this.shouldReconnect &&
//         this.reconnectAttempts < this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.RECONNECTING);
//       } else {
//         this.setConnectionState(ConnectionState.DISCONNECTED);
//       }

//       // Notify all disconnect callbacks
//       this.onDisconnectCallbacks.forEach(callback => {
//         try {
//           callback();
//         } catch (error) {
//           console.log(
//             '[WebSocketService] Error in disconnect callback:',
//             error,
//           );
//         }
//       });

//       // Clear active subscriptions but keep them for resubscription
//       this.subscriptions = [];
//       this.activeSubscriptions.forEach(sub => {
//         this.pendingSubscriptions.push({
//           destination: sub.destination,
//           callback: sub.callback,
//         });
//       });
//       this.activeSubscriptions = [];
//     };

//     this.client.onStompError = frame => {
//       const errorMsg = `STOMP Error: ${frame.headers['message']} - ${frame.body}`;
//       console.log('[WebSocketService]', errorMsg);

//       // Only set failed state if we're not reconnecting or exceeded max attempts
//       if (
//         !this.shouldReconnect ||
//         this.reconnectAttempts >= this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.FAILED, errorMsg);
//       }
//     };

//     this.client.onWebSocketError = event => {
//       const errorMsg = `WebSocket Error: ${
//         event.message || 'Connection error'
//       }`;
//       console.log('[WebSocketService]', errorMsg);

//       // Only set failed state if we're not reconnecting or exceeded max attempts
//       if (
//         !this.shouldReconnect ||
//         this.reconnectAttempts >= this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.FAILED, errorMsg);
//       }
//     };

//     this.client.onWebSocketClose = event => {
//       if (this.debug) {
//         console.log(
//           '[WebSocketService] WebSocket closed:',
//           event.code,
//           event.reason,
//         );
//       }

//       // Increment reconnect attempts
//       if (this.shouldReconnect && !this.isInitialConnection) {
//         this.reconnectAttempts++;
//       }

//       // Notify disconnect callbacks
//       this.onDisconnectCallbacks.forEach(callback => {
//         try {
//           callback();
//         } catch (error) {
//           console.log(
//             '[WebSocketService] Error in WebSocket close disconnect callback:',
//             error,
//           );
//         }
//       });

//       // Clear active subscriptions and queue them for resubscription
//       this.subscriptions = [];
//       this.activeSubscriptions.forEach(sub => {
//         this.pendingSubscriptions.push({
//           destination: sub.destination,
//           callback: sub.callback,
//         });
//       });
//       this.activeSubscriptions = [];

//       // Handle reconnection state
//       if (
//         this.shouldReconnect &&
//         this.reconnectAttempts < this.maxReconnectAttempts
//       ) {
//         this.setConnectionState(ConnectionState.RECONNECTING);
//       } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//         console.warn(
//           '[WebSocketService] Max reconnect attempts reached after WebSocket close.',
//         );
//         this.shouldReconnect = false;
//         this.setConnectionState(
//           ConnectionState.FAILED,
//           'Max reconnection attempts exceeded',
//         );
//       } else {
//         this.setConnectionState(ConnectionState.DISCONNECTED);
//       }
//     };
//   }

//   private resubscribeAll(): void {
//     const toResubscribe = [...this.pendingSubscriptions];
//     this.pendingSubscriptions = [];

//     toResubscribe.forEach(({destination, callback}) => {
//       try {
//         const stompSub = this.client!.subscribe(destination, callback);
//         this.subscriptions.push(stompSub);
//         this.activeSubscriptions.push({
//           destination,
//           callback,
//           stompSubscription: stompSub,
//         });
//         if (this.debug) {
//           console.log(`[WebSocketService] Resubscribed to ${destination}`);
//         }
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Failed to resubscribe to ${destination}:`,
//           error,
//         );
//         // Put it back in pending
//         this.pendingSubscriptions.push({destination, callback});
//       }
//     });

//     if (this.debug) {
//       this.logAllSubscribedDestinations();
//     }
//   }

//   // New method to add connection state change listeners
//   public addOnConnectionStateChange(
//     callback: (status: ConnectionStatus) => void,
//   ): () => void {
//     this.onConnectionStateChangeCallbacks.push(callback);

//     // Call immediately with current state
//     const currentStatus: ConnectionStatus = {
//       state: this.connectionState,
//       error: this.lastError || undefined,
//       reconnectAttempt: this.reconnectAttempts,
//       maxAttempts: this.maxReconnectAttempts,
//     };

//     try {
//       callback(currentStatus);
//     } catch (error) {
//       console.log(
//         '[WebSocketService] Error in immediate state change callback:',
//         error,
//       );
//     }

//     // Return cleanup function
//     return () => {
//       const index = this.onConnectionStateChangeCallbacks.indexOf(callback);
//       if (index > -1) {
//         this.onConnectionStateChangeCallbacks.splice(index, 1);
//       }
//     };
//   }

//   public addOnConnect(callback: () => void): () => void {
//     this.onConnectCallbacks.push(callback);

//     // If already connected, call immediately
//     if (this.isConnected()) {
//       try {
//         callback();
//       } catch (error) {
//         console.log(
//           '[WebSocketService] Error in immediate connect callback:',
//           error,
//         );
//       }
//     }

//     // Return cleanup function
//     return () => {
//       const index = this.onConnectCallbacks.indexOf(callback);
//       if (index > -1) {
//         this.onConnectCallbacks.splice(index, 1);
//       }
//     };
//   }

//   public addOnDisconnect(callback: () => void): () => void {
//     this.onDisconnectCallbacks.push(callback);

//     // Return cleanup function
//     return () => {
//       const index = this.onDisconnectCallbacks.indexOf(callback);
//       if (index > -1) {
//         this.onDisconnectCallbacks.splice(index, 1);
//       }
//     };
//   }

//   public isConnected(): boolean {
//     return this.client?.connected === true;
//   }

//   public isConnecting(): boolean {
//     return this.connectionState === ConnectionState.CONNECTING;
//   }

//   public isReconnecting(): boolean {
//     return this.connectionState === ConnectionState.RECONNECTING;
//   }

//   public getConnectionState(): ConnectionState {
//     return this.connectionState;
//   }

//   public getConnectionStatus(): ConnectionStatus {
//     return {
//       state: this.connectionState,
//       error: this.lastError || undefined,
//       reconnectAttempt: this.reconnectAttempts,
//       maxAttempts: this.maxReconnectAttempts,
//     };
//   }

//   public connect(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (this.isConnected()) {
//         if (this.debug) {
//           console.log('[WebSocketService] Already connected');
//         }
//         resolve();
//         return;
//       }

//       if (this.isConnecting() || this.isReconnecting()) {
//         if (this.debug) {
//           console.log('[WebSocketService] Connection already in progress');
//         }
//         // Wait for current connection attempt
//         const checkConnection = () => {
//           if (this.isConnected()) {
//             resolve();
//           } else if (
//             this.connectionState === ConnectionState.FAILED ||
//             this.connectionState === ConnectionState.DISCONNECTED
//           ) {
//             reject(new Error(this.lastError || 'Connection failed'));
//           } else {
//             setTimeout(checkConnection, 100);
//           }
//         };
//         checkConnection();
//         return;
//       }

//       this.shouldReconnect = true;
//       this.setConnectionState(ConnectionState.CONNECTING);

//       if (!this.client) {
//         this.initClient();
//       }

//       // Set up one-time listeners for this connection attempt
//       const connectHandler = () => {
//         cleanup();
//         resolve();
//       };

//       const errorHandler = () => {
//         cleanup();
//         reject(new Error(this.lastError || 'Connection failed'));
//       };

//       const cleanup = () => {
//         const connectIndex = this.onConnectCallbacks.indexOf(connectHandler);
//         if (connectIndex > -1) {
//           this.onConnectCallbacks.splice(connectIndex, 1);
//         }
//         const errorIndex = this.onDisconnectCallbacks.indexOf(errorHandler);
//         if (errorIndex > -1) {
//           this.onDisconnectCallbacks.splice(errorIndex, 1);
//         }
//       };

//       this.onConnectCallbacks.push(connectHandler);
//       this.onDisconnectCallbacks.push(errorHandler);

//       try {
//         this.client!.activate();
//         if (this.debug) {
//           console.log('[WebSocketService] Connection initiated');
//         }

//         // Timeout after connectionTimeout (using the configured value)
//         setTimeout(() => {
//           if (
//             (this.isConnecting() || this.isReconnecting()) &&
//             !this.isConnected()
//           ) {
//             cleanup();
//             this.setConnectionState(
//               ConnectionState.FAILED,
//               'Connection timeout',
//             );
//             reject(new Error('Connection timeout'));
//           }
//         }, this.connectionTimeout); // Use configured connectionTimeout
//       } catch (error) {
//         cleanup();
//         this.setConnectionState(
//           ConnectionState.FAILED,
//           error instanceof Error ? error.message : 'Connection error',
//         );
//         reject(error);
//       }
//     });
//   }

//   public disconnect(): void {
//     this.shouldReconnect = false;
//     this.setConnectionState(ConnectionState.DISCONNECTED);

//     if (this.client && this.client.active) {
//       this.subscriptions.forEach(sub => {
//         try {
//           sub.unsubscribe();
//         } catch (error) {
//           console.log('[WebSocketService] Error unsubscribing:', error);
//         }
//       });

//       this.subscriptions = [];
//       this.activeSubscriptions = [];
//       this.pendingSubscriptions = [];

//       this.client.deactivate();
//       if (this.debug) {
//         console.log('[WebSocketService] Disconnected and cleaned up');
//       }
//     }

//     // Clear callbacks
//     this.onConnectCallbacks = [];
//     this.onDisconnectCallbacks = [];
//     this.onConnectionStateChangeCallbacks = [];
//   }

//   // Method to retry connection manually
//   public retryConnection(): Promise<void> {
//     // Only retry if currently in a FAILED state
//     if (this.connectionState !== ConnectionState.FAILED) {
//       if (this.debug) {
//         console.log('[WebSocketService] Not in FAILED state, no retry needed.');
//       }
//       return Promise.resolve();
//     }

//     if (this.debug) {
//       console.log('[WebSocketService] Retrying connection...');
//     }
//     this.reconnectAttempts = 0; // Reset attempts for a manual retry
//     this.lastError = null; // Clear last error
//     return this.connect();
//   }

//   public subscribe(
//     destination: string,
//     callback: (message: IMessage) => void,
//   ): StompSubscription | undefined {
//     if (this.debug) {
//       console.log(`[WebSocketService] subscribe() called for ${destination}`);
//     }

//     // Check if already subscribed
//     const existingActive = this.activeSubscriptions.find(
//       sub => sub.destination === destination,
//     );
//     if (existingActive) {
//       if (this.debug) {
//         console.warn(`[WebSocketService] Already subscribed to ${destination}`);
//       }
//       return existingActive.stompSubscription;
//     }

//     // Check if already pending
//     const isPending = this.pendingSubscriptions.find(
//       sub => sub.destination === destination,
//     );
//     if (isPending) {
//       if (this.debug) {
//         console.warn(
//           `[WebSocketService] Subscription already pending for ${destination}`,
//         );
//       }
//       return undefined;
//     }

//     if (this.isConnected()) {
//       try {
//         const subscription = this.client!.subscribe(destination, callback);
//         this.activeSubscriptions.push({
//           destination,
//           callback,
//           stompSubscription: subscription,
//         });
//         this.subscriptions.push(subscription);
//         if (this.debug) {
//           console.log(`[WebSocketService] Subscribed to ${destination}`);
//           this.logAllSubscribedDestinations();
//         }
//         return subscription;
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Failed to subscribe to ${destination}:`,
//           error,
//         );
//         // Add to pending for retry
//         this.pendingSubscriptions.push({destination, callback});
//         return undefined;
//       }
//     } else {
//       if (this.debug) {
//         console.log(
//           `[WebSocketService] Not connected; queueing subscription for ${destination}`,
//         );
//       }
//       this.pendingSubscriptions.push({destination, callback});
//       return undefined;
//     }
//   }

//   public unsubscribe(destination: string): void {
//     // Remove from active subscriptions
//     const activeIndex = this.activeSubscriptions.findIndex(
//       sub => sub.destination === destination,
//     );

//     if (activeIndex !== -1) {
//       const {stompSubscription} = this.activeSubscriptions[activeIndex];
//       try {
//         stompSubscription.unsubscribe();
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Error unsubscribing from ${destination}:`,
//           error,
//         );
//       }

//       this.activeSubscriptions.splice(activeIndex, 1);
//       this.subscriptions = this.subscriptions.filter(
//         sub => sub.id !== stompSubscription.id,
//       );
//       if (this.debug) {
//         console.log(`[WebSocketService] Unsubscribed from ${destination}`);
//       }
//     }

//     // Remove from pending subscriptions
//     const pendingIndex = this.pendingSubscriptions.findIndex(
//       sub => sub.destination === destination,
//     );
//     if (pendingIndex !== -1) {
//       this.pendingSubscriptions.splice(pendingIndex, 1);
//       if (this.debug) {
//         console.log(
//           `[WebSocketService] Removed pending subscription for ${destination}`,
//         );
//       }
//     }
//   }

//   public send(
//     destination: string,
//     headers: Record<string, string> = {},
//     body: string = '',
//   ): boolean {
//     if (this.isConnected()) {
//       try {
//         this.client!.publish({destination, headers, body});
//         if (this.debug) {
//           console.log(`[WebSocketService] Message sent to ${destination}`);
//         }
//         return true;
//       } catch (error) {
//         console.log(
//           `[WebSocketService] Failed to send message to ${destination}:`,
//           error,
//         );
//         return false;
//       }
//     } else {
//       console.warn(
//         '[WebSocketService] Client not connected. Message not sent.',
//       );
//       return false;
//     }
//   }

//   public getStats(): any {
//     return {
//       connectionState: this.connectionState,
//       isConnected: this.isConnected(),
//       isConnecting: this.isConnecting(),
//       isReconnecting: this.isReconnecting(),
//       reconnectAttempts: this.reconnectAttempts,
//       maxReconnectAttempts: this.maxReconnectAttempts,
//       lastError: this.lastError,
//       activeSubscriptionsCount: this.activeSubscriptions.length,
//       pendingSubscriptionsCount: this.pendingSubscriptions.length,
//     };
//   }

//   public getActiveSubscriptions(): string[] {
//     return this.activeSubscriptions.map(sub => sub.destination);
//   }

//   public getPendingSubscriptions(): string[] {
//     return this.pendingSubscriptions.map(sub => sub.destination);
//   }

//   public logAllSubscribedDestinations(): void {
//     if (this.activeSubscriptions.length === 0) {
//       console.log('[WebSocketService] No active subscriptions.');
//       return;
//     }
//     console.log('[WebSocketService] Active subscriptions:');
//     this.activeSubscriptions.forEach((sub, index) => {
//       console.log(
//         `   ${index + 1}. ${sub.destination} (ID: ${sub.stompSubscription.id})`,
//       );
//     });

//     if (this.pendingSubscriptions.length > 0) {
//       console.log('[WebSocketService] Pending subscriptions:');
//       this.pendingSubscriptions.forEach((sub, index) => {
//         console.log(`   ${index + 1}. ${sub.destination}`);
//       });
//     }
//   }
// }

// // --- useWebSocket Hook Definition ---

// // Singleton service management with proper cleanup
// const serviceInstances = new Map<string, WebSocketService>();

// interface UseWebSocketOptions {
//   autoConnect?: boolean;
//   showErrorOnInitialConnect?: boolean;
//   showErrorOnReconnect?: boolean;
//   hideErrorAfterSeconds?: number;
//   reconnectDelay?: number;
//   maxReconnectAttempts?: number;
//   connectionTimeout?: number;
//   debug?: boolean;
// }

// interface WebSocketHookReturn {
//   // Connection methods
//   connect: () => Promise<void>;
//   disconnect: () => void;
//   retryConnection: () => Promise<void>;

//   // Subscription methods
//   subscribe: (
//     destination: string,
//     callback: (message: IMessage) => void,
//   ) => StompSubscription | undefined;
//   unsubscribe: (destination: string) => void;

//   // Messaging
//   send: (
//     destination: string,
//     headers?: Record<string, string>,
//     body?: string,
//   ) => boolean;

//   // State
//   isConnected: boolean;
//   isConnecting: boolean;
//   isReconnecting: boolean;
//   connectionStatus: ConnectionStatus;

//   // Error handling
//   shouldShowError: boolean;
//   dismissError: () => void;

//   // Stats and debugging
//   getStats: () => any;
//   getActiveSubscriptions: () => string[];
//   getPendingSubscriptions: () => string[];
// }

// const DEFAULT_OPTIONS: Required<UseWebSocketOptions> = {
//   autoConnect: true,
//   showErrorOnInitialConnect: true,
//   showErrorOnReconnect: false,
//   hideErrorAfterSeconds: 10,
//   reconnectDelay: 5000,
//   maxReconnectAttempts: 10,
//   connectionTimeout: 10000,
//   debug: false,
// };

// export const useWebSocket = (
//   userId: string,
//   socketUrl?: string,
//   options: UseWebSocketOptions = {},
// ): WebSocketHookReturn => {
//   const config = useMemo(() => ({...DEFAULT_OPTIONS, ...options}), [options]);

//   // State management
//   const [connected, setConnected] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
//     state: ConnectionState.DISCONNECTED,
//   });
//   const [shouldShowError, setShouldShowError] = useState(false);

//   // Refs for cleanup and state tracking
//   const cleanupFunctionsRef = useRef<(() => void)[]>([]);
//   const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const hasConnectedOnceRef = useRef(false);
//   const serviceRef = useRef<WebSocketService | null>(null);

//   // Memoize service key for singleton management
//   const serviceKey = useMemo(() => {
//     const url =
//       socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';
//     return `${userId}:${url}`;
//   }, [userId, socketUrl]);

//   // Initialize or get existing service
//   const getOrCreateService = useCallback(() => {
//     if (!serviceInstances.has(serviceKey)) {
//       const url =
//         socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';

//       // Pass the configuration options to the WebSocketService constructor
//       const service = new WebSocketService(userId, url, {
//         maxReconnectAttempts: config.maxReconnectAttempts,
//         reconnectDelay: config.reconnectDelay,
//         connectionTimeout: config.connectionTimeout,
//         debug: config.debug,
//       });

//       serviceInstances.set(serviceKey, service);

//       if (config.debug) {
//         console.log('[useWebSocket] Service created with key:', serviceKey);
//       }
//     }

//     const service = serviceInstances.get(serviceKey)!;
//     serviceRef.current = service;
//     return service;
//   }, [serviceKey, userId, socketUrl, config]);

//   // Error management
//   const handleError = useCallback(
//     (status: ConnectionStatus) => {
//       // Only consider showing an error if the state is FAILED and there's an actual error message
//       if (status.state !== ConnectionState.FAILED || !status.error) {
//         setShouldShowError(false);
//         if (errorTimeoutRef.current) {
//           clearTimeout(errorTimeoutRef.current);
//           errorTimeoutRef.current = null;
//         }
//         return;
//       }

//       const isInitialConnection = !hasConnectedOnceRef.current;
//       // The `isReconnectionFailure` check is simplified as `hasConnectedOnceRef.current` already implies it's not the initial connection.
//       // The `WebSocketService` itself will only report FAILED if max reconnect attempts are reached or reconnection is explicitly disabled.

//       let showError = false;
//       if (isInitialConnection && config.showErrorOnInitialConnect) {
//         showError = true;
//       } else if (!isInitialConnection && config.showErrorOnReconnect) {
//         // Check if it's a reconnection and config allows showing error
//         showError = true;
//       }

//       setShouldShowError(showError);

//       // Auto-hide error after specified time
//       if (showError && config.hideErrorAfterSeconds > 0) {
//         if (errorTimeoutRef.current) {
//           clearTimeout(errorTimeoutRef.current);
//         }
//         errorTimeoutRef.current = setTimeout(() => {
//           setShouldShowError(false);
//         }, config.hideErrorAfterSeconds * 1000);
//       }
//     },
//     [
//       config.showErrorOnInitialConnect,
//       config.showErrorOnReconnect,
//       config.hideErrorAfterSeconds,
//     ],
//   );

//   // Setup service callbacks
//   useEffect(() => {
//     const service = getOrCreateService();

//     // Create optimized callback handlers
//     const handleConnect = () => {
//       if (config.debug) {
//         console.log('[useWebSocket] Connected');
//       }
//       setConnected(true);
//       setConnecting(false);
//       hasConnectedOnceRef.current = true;
//     };

//     const handleDisconnect = () => {
//       if (config.debug) {
//         console.log('[useWebSocket] Disconnected');
//       }
//       setConnected(false);
//     };

//     const handleConnectionStateChange = (status: ConnectionStatus) => {
//       if (config.debug) {
//         console.log('[useWebSocket] State changed:', status.state);
//       }

//       setConnectionStatus(status);

//       const isConnectingState =
//         status.state === ConnectionState.CONNECTING ||
//         status.state === ConnectionState.RECONNECTING;
//       setConnecting(isConnectingState);

//       // Handle connected state
//       if (status.state === ConnectionState.CONNECTED) {
//         hasConnectedOnceRef.current = true;
//       }

//       // Handle error display based on the status reported by WebSocketService
//       handleError(status);
//     };

//     // Register callbacks and store cleanup functions
//     const cleanupConnect = service.addOnConnect(handleConnect);
//     const cleanupDisconnect = service.addOnDisconnect(handleDisconnect);
//     const cleanupStateChange = service.addOnConnectionStateChange(
//       handleConnectionStateChange,
//     );

//     cleanupFunctionsRef.current = [
//       cleanupConnect,
//       cleanupDisconnect,
//       cleanupStateChange,
//     ];

//     // Set initial state
//     setConnected(service.isConnected());
//     const currentStatus = service.getConnectionStatus();
//     setConnectionStatus(currentStatus);
//     setConnecting(
//       currentStatus.state === ConnectionState.CONNECTING ||
//         currentStatus.state === ConnectionState.RECONNECTING,
//     );

//     // Cleanup function
//     return () => {
//       cleanupFunctionsRef.current.forEach(cleanup => cleanup());
//       cleanupFunctionsRef.current = [];

//       if (errorTimeoutRef.current) {
//         clearTimeout(errorTimeoutRef.current);
//         errorTimeoutRef.current = null;
//       }
//     };
//   }, [getOrCreateService, handleError, config.debug]);

//   // Connection methods
//   const connect = useCallback(async (): Promise<void> => {
//     const service = serviceRef.current || getOrCreateService();

//     if (service.isConnected()) {
//       if (config.debug) {
//         console.log('[useWebSocket] Already connected');
//       }
//       return;
//     }

//     if (service.isConnecting() || service.isReconnecting()) {
//       if (config.debug) {
//         console.log('[useWebSocket] Connection already in progress');
//       }
//       return;
//     }

//     try {
//       if (config.debug) {
//         console.log('[useWebSocket] Initiating connection...');
//       }
//       await service.connect();
//     } catch (error) {
//       console.log('[useWebSocket] Connection failed:', error);
//       throw error;
//     }
//   }, [getOrCreateService, config.debug]);

//   const disconnect = useCallback(() => {
//     const service = serviceRef.current;
//     if (!service) {
//       console.warn('[useWebSocket] Service not initialized');
//       return;
//     }

//     service.disconnect();
//     setConnected(false);
//     setConnecting(false);
//     setShouldShowError(false);
//     hasConnectedOnceRef.current = false;

//     // Clean up service instance if completely disconnected
//     serviceInstances.delete(serviceKey);
//     serviceRef.current = null;
//   }, [serviceKey]);

//   const retryConnection = useCallback(async (): Promise<void> => {
//     const service = serviceRef.current || getOrCreateService();

//     // Dismiss any existing error message when retrying
//     setShouldShowError(false);
//     if (errorTimeoutRef.current) {
//       clearTimeout(errorTimeoutRef.current);
//       errorTimeoutRef.current = null;
//     }

//     try {
//       await service.retryConnection();
//     } catch (error) {
//       console.log('[useWebSocket] Retry connection failed:', error);
//       throw error;
//     }
//   }, [getOrCreateService]);

//   const dismissError = useCallback(() => {
//     setShouldShowError(false);
//     if (errorTimeoutRef.current) {
//       clearTimeout(errorTimeoutRef.current);
//       errorTimeoutRef.current = null;
//     }
//   }, []);

//   // Subscription methods
//   const subscribe = useCallback(
//     (
//       destination: string,
//       callback: (message: IMessage) => void,
//     ): StompSubscription | undefined => {
//       const service = serviceRef.current || getOrCreateService();
//       return service.subscribe(destination, callback);
//     },
//     [getOrCreateService],
//   );

//   const unsubscribe = useCallback((destination: string) => {
//     const service = serviceRef.current;
//     if (!service) {
//       console.warn('[useWebSocket] Service not initialized');
//       return;
//     }
//     service.unsubscribe(destination);
//   }, []);

//   const send = useCallback(
//     (
//       destination: string,
//       headers: Record<string, string> = {},
//       body: string = '',
//     ): boolean => {
//       const service = serviceRef.current;
//       if (!service) {
//         console.warn('[useWebSocket] Service not initialized');
//         return false;
//       }
//       return service.send(destination, headers, body);
//     },
//     [],
//   );

//   // Stats and debugging methods
//   const getStats = useCallback(() => {
//     const service = serviceRef.current;
//     return service ? service.getStats() : null;
//   }, []);

//   const getActiveSubscriptions = useCallback((): string[] => {
//     const service = serviceRef.current;
//     return service ? service.getActiveSubscriptions() : [];
//   }, []);

//   const getPendingSubscriptions = useCallback((): string[] => {
//     const service = serviceRef.current;
//     return service ? service.getPendingSubscriptions() : [];
//   }, []);

//   // Auto-connect effect
//   useEffect(() => {
//     if (!config.autoConnect) return;

//     const service = serviceRef.current || getOrCreateService();

//     if (
//       !service.isConnected() &&
//       !service.isConnecting() &&
//       !service.isReconnecting()
//     ) {
//       if (config.debug) {
//         console.log('[useWebSocket] Auto-connecting...');
//       }
//       connect().catch(error => {
//         console.log('[useWebSocket] Auto-connect failed:', error);
//       });
//     }
//   }, [connect, config.autoConnect, config.debug, getOrCreateService]);

//   // Cleanup effect for component unmount
//   useEffect(() => {
//     return () => {
//       cleanupFunctionsRef.current.forEach(cleanup => cleanup());
//       if (errorTimeoutRef.current) {
//         clearTimeout(errorTimeoutRef.current);
//       }
//     };
//   }, []);

//   return {
//     // Connection methods
//     connect,
//     disconnect,
//     retryConnection,

//     // Subscription methods
//     subscribe,
//     unsubscribe,
//     // Messaging
//     send,

//     // State
//     isConnected: connected,
//     isConnecting: connecting,
//     isReconnecting: connectionStatus.state === ConnectionState.RECONNECTING,
//     connectionStatus,

//     // Error handling
//     shouldShowError,
//     dismissError,

//     // Stats and debugging
//     getStats,
//     getActiveSubscriptions,
//     getPendingSubscriptions,
//   };
// };
