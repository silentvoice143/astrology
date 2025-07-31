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
  private subscriptions: StompSubscription[] = []; // Raw STOMP subscriptions
  private pendingSubscriptions: PendingSubscription[] = []; // Subscriptions to be re-established on connect
  private activeSubscriptions: ActiveSubscription[] = []; // Currently active subscriptions with their original callbacks

  private onConnectCallbacks: (() => void)[] = []; // Support multiple callbacks for connection status
  private onDisconnectCallbacks: (() => void)[] = [];

  private _isConnecting = false; // Internal flag for explicit connection attempt initiated by connect()
  private shouldReconnect = true; // Controls if STOMP client should attempt reconnection after disconnects/errors
  private internalReconnectAttempts = 0; // Tracks consecutive failed *connect* or *error* attempts
  private maxReconnectAttempts = 10; // Max attempts before stopping automatic reconnection

  // Promises related to the explicit connect() call
  private resolveConnectPromise: (() => void) | null = null;
  private rejectConnectPromise: ((error: Error) => void) | null = null;

  constructor(userId: string, url: string) {
    this.userId = userId;
    this.url = url;
    this.initClient(); // Initialize client on construction
  }

  private initClient(): void {
    if (this.client) {
      // If a client already exists, deactivate it before creating a new one
      this.client.deactivate();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.url),
      connectHeaders: {'user-id': this.userId},
      debug: (msg: string) => {
        // console.log(`[STOMP Debug] ${msg}`); // Uncomment for STOMP.js debug logs
      },
      reconnectDelay: 5000, // Time between reconnection attempts
      heartbeatIncoming: 30000, // Expected incoming heartbeat interval
      heartbeatOutgoing: 30000, // Outgoing heartbeat interval
      connectionTimeout: 10000, // Timeout for the initial WebSocket connection
    });

    this.client.onConnect = frame => {
      console.log('[WebSocketService] Connected successfully!');
      this._isConnecting = false; // Explicit connection attempt is now complete
      this.internalReconnectAttempts = 0; // Reset reconnection attempts on success
      this.shouldReconnect = true; // Ensure reconnection is allowed for future disconnects

      // Resolve any pending promise from an explicit connect() call
      if (this.resolveConnectPromise) {
        this.resolveConnectPromise();
        this.resolveConnectPromise = null;
        this.rejectConnectPromise = null;
      }

      // Notify all registered onConnect callbacks
      this.onConnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(
            '[WebSocketService] Error in onConnect callback:',
            error,
          );
        }
      });

      // Resubscribe to all destinations that were active or pending
      this.resubscribeAll();
    };

    this.client.onDisconnect = frame => {
      console.log('[WebSocketService] Disconnected');
      this._isConnecting = false; // Explicit connection attempt is no longer active

      // Notify all registered onDisconnect callbacks
      this.onDisconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(
            '[WebSocketService] Error in onDisconnect callback:',
            error,
          );
        }
      });

      // Clear current active subscriptions and move them to pending for re-establishment
      this.subscriptions = [];
      this.activeSubscriptions.forEach(sub => {
        // Only add to pending if not already there to prevent duplicates
        if (
          !this.pendingSubscriptions.some(
            p => p.destination === sub.destination,
          )
        ) {
          this.pendingSubscriptions.push({
            destination: sub.destination,
            callback: sub.callback,
          });
        }
      });
      this.activeSubscriptions = [];

      // If there's a pending connect promise, reject it as the connection was lost
      if (this.rejectConnectPromise) {
        this.rejectConnectPromise(
          new Error('WebSocket Disconnected during connection attempt.'),
        );
        this.resolveConnectPromise = null;
        this.rejectConnectPromise = null;
      }
    };

    this.client.onStompError = frame => {
      console.error(
        '[WebSocketService] STOMP Error:',
        frame.headers['message'],
        'Details:',
        frame.body,
      );
      this._isConnecting = false; // STOMP error implies current explicit attempt failed

      // Increment reconnection attempts and check if max attempts reached
      if (this.shouldReconnect) {
        this.internalReconnectAttempts++;
        if (this.internalReconnectAttempts >= this.maxReconnectAttempts) {
          console.warn(
            '[WebSocketService] Max reconnect attempts reached due to STOMP error. Stopping reconnections.',
          );
          this.shouldReconnect = false;
          this.client?.deactivate(); // Explicitly stop the client from further retries
          // Reject any pending connect promise if max attempts reached
          if (this.rejectConnectPromise) {
            this.rejectConnectPromise(
              new Error('Max STOMP error reconnect attempts reached.'),
            );
            this.resolveConnectPromise = null;
            this.rejectConnectPromise = null;
          }
        }
      }
    };

    this.client.onWebSocketError = event => {
      console.error('[WebSocketService] WebSocket Error:', event);
      this._isConnecting = false; // WebSocket error implies current explicit attempt failed

      // Increment reconnection attempts and check if max attempts reached
      if (this.shouldReconnect) {
        this.internalReconnectAttempts++;
        if (this.internalReconnectAttempts >= this.maxReconnectAttempts) {
          console.warn(
            '[WebSocketService] Max reconnect attempts reached due to WebSocket error. Stopping reconnections.',
          );
          this.shouldReconnect = false;
          this.client?.deactivate(); // Explicitly stop the client from further retries
          // Reject any pending connect promise if max attempts reached
          if (this.rejectConnectPromise) {
            this.rejectConnectPromise(
              new Error('Max WebSocket error reconnect attempts reached.'),
            );
            this.resolveConnectPromise = null;
            this.rejectConnectPromise = null;
          }
        }
      }
    };

    this.client.onWebSocketClose = event => {
      console.log(
        '[WebSocketService] WebSocket closed:',
        event.code,
        event.reason,
      );
      this._isConnecting = false; // WebSocket closed, so direct connection attempt is over.

      // Notify all registered onDisconnect callbacks (as WebSocket close is a form of disconnect)
      this.onDisconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(
            '[WebSocketService] Error in WebSocket close disconnect callback:',
            error,
          );
        }
      });

      // Similar to onDisconnect, clear active and queue for resubscription
      this.subscriptions = [];
      this.activeSubscriptions.forEach(sub => {
        if (
          !this.pendingSubscriptions.some(
            p => p.destination === sub.destination,
          )
        ) {
          this.pendingSubscriptions.push({
            destination: sub.destination,
            callback: sub.callback,
          });
        }
      });
      this.activeSubscriptions = [];

      // Increment internal reconnect attempts and check if max attempts reached.
      // The STOMP client's `reconnectDelay` will handle the actual retry logic.
      if (this.shouldReconnect) {
        this.internalReconnectAttempts++;
        if (this.internalReconnectAttempts >= this.maxReconnectAttempts) {
          console.warn(
            '[WebSocketService] Max reconnect attempts reached after WebSocket close. Stopping further automatic reconnections.',
          );
          this.shouldReconnect = false; // Prevent further automatic reconnections
          this.client?.deactivate(); // Explicitly deactivate to prevent more attempts
          // Reject any pending connect promise
          if (this.rejectConnectPromise) {
            this.rejectConnectPromise(
              new Error('Max WebSocket close reconnect attempts reached.'),
            );
            this.resolveConnectPromise = null;
            this.rejectConnectPromise = null;
          }
        }
      }
    };
  }

  private resubscribeAll(): void {
    const toResubscribe = [...this.pendingSubscriptions];
    this.pendingSubscriptions = []; // Clear pending list as we are attempting to resubscribe

    toResubscribe.forEach(({destination, callback}) => {
      try {
        if (this.client && this.client.connected) {
          // Ensure client is still connected before subscribing
          const stompSub = this.client.subscribe(destination, callback);
          this.subscriptions.push(stompSub);
          this.activeSubscriptions.push({
            destination,
            callback,
            stompSubscription: stompSub,
          });
          console.log(`[WebSocketService] Resubscribed to ${destination}`);
        } else {
          // If client disconnected during iteration, put back to pending
          this.pendingSubscriptions.push({destination, callback});
        }
      } catch (error) {
        console.error(
          `[WebSocketService] Failed to resubscribe to ${destination}:`,
          error,
        );
        // If subscription fails, put it back in pending for next connect
        this.pendingSubscriptions.push({destination, callback});
      }
    });

    this.logAllSubscribedDestinations(); // Log current subscription state after resubscription
  }

  /**
   * Registers a callback to be invoked when the WebSocket connection is successfully established.
   * If already connected, the callback is invoked immediately.
   * @param callback The function to call on connect.
   * @returns A cleanup function to remove the callback.
   */
  public addOnConnect(callback: () => void): () => void {
    this.onConnectCallbacks.push(callback);

    // If already connected, call immediately
    if (this.isConnected()) {
      try {
        callback();
      } catch (error) {
        console.error(
          '[WebSocketService] Error in immediate onConnect callback execution:',
          error,
        );
      }
    }

    // Return a cleanup function to remove this specific callback
    return () => {
      const index = this.onConnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.onConnectCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Registers a callback to be invoked when the WebSocket connection is disconnected.
   * @param callback The function to call on disconnect.
   * @returns A cleanup function to remove the callback.
   */
  public addOnDisconnect(callback: () => void): () => void {
    this.onDisconnectCallbacks.push(callback);

    // Return a cleanup function to remove this specific callback
    return () => {
      const index = this.onDisconnectCallbacks.indexOf(callback);
      if (index > -1) {
        this.onDisconnectCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Checks if the STOMP client is currently connected.
   * @returns True if connected, false otherwise.
   */
  public isConnected(): boolean {
    return this.client?.connected === true;
  }

  /**
   * Checks if the WebSocket service is currently in the process of connecting or reconnecting.
   * This includes both explicit connect() calls and STOMP.js's internal reconnection attempts.
   * @returns True if connecting/reconnecting, false otherwise.
   */
  public isConnectingSocket(): boolean {
    // _isConnecting: True if an explicit connect() call is actively trying to establish connection.
    // client?.active && !client?.connected: True if STOMP client is active (meaning it might be trying to connect/reconnect)
    //                                     but not yet successfully connected.
    // shouldReconnect: Ensures we only report 'connecting' if automatic reconnects are enabled.
    return (
      this._isConnecting ||
      (this.shouldReconnect &&
        this.client?.active === true &&
        !this.client?.connected)
    );
  }

  /**
   * Initiates a connection to the WebSocket server.
   * Returns a Promise that resolves on successful connection or rejects on failure/timeout.
   * Multiple calls while connecting will return the same promise.
   * @returns A Promise that resolves when connected.
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        console.log(
          '[WebSocketService] Already connected, resolving immediately.',
        );
        resolve();
        return;
      }

      if (this._isConnecting) {
        console.log(
          '[WebSocketService] Connection already in progress, queuing promise.',
        );
        // If already connecting, chain this promise's resolution/rejection to the ongoing one
        const originalResolve = this.resolveConnectPromise;
        const originalReject = this.rejectConnectPromise;

        this.resolveConnectPromise = () => {
          if (originalResolve) originalResolve();
          resolve();
        };
        this.rejectConnectPromise = error => {
          if (originalReject) originalReject(error);
          reject(error);
        };
        return;
      }

      this.shouldReconnect = true; // Allow client to reconnect automatically in future
      this._isConnecting = true; // Mark an explicit connection attempt as active
      this.internalReconnectAttempts = 0; // Reset attempts for this new explicit connect call

      // Store the resolve/reject functions for this specific connection attempt
      this.resolveConnectPromise = resolve;
      this.rejectConnectPromise = reject;

      try {
        if (!this.client) {
          this.initClient(); // Ensure client is initialized before activation
        }
        this.client!.activate();
        console.log('[WebSocketService] Connection initiated...');

        // Set a timeout for the *initial* explicit connect() call
        setTimeout(() => {
          if (this._isConnecting && !this.isConnected()) {
            console.warn(
              '[WebSocketService] Explicit connect() call timed out.',
            );
            if (this.rejectConnectPromise) {
              this.rejectConnectPromise(new Error('Connection timeout.'));
              this.resolveConnectPromise = null;
              this.rejectConnectPromise = null;
            }
            this._isConnecting = false; // Mark explicit attempt as failed
            // No need to deactivate here, STOMP client's reconnectDelay will handle retries if shouldReconnect is true
          }
        }, 15000); // 15 seconds timeout for explicit connection
      } catch (error: any) {
        this._isConnecting = false; // Mark explicit attempt as failed
        console.error(
          '[WebSocketService] Error activating STOMP client:',
          error,
        );
        // Reject the promise immediately if activation fails
        if (this.rejectConnectPromise) {
          this.rejectConnectPromise(error);
          this.resolveConnectPromise = null;
          this.rejectConnectPromise = null;
        }
      }
    });
  }

  /**
   * Disconnects from the WebSocket server and stops all reconnection attempts.
   * Clears all subscriptions and pending subscriptions.
   */
  public disconnect(): void {
    this.shouldReconnect = false; // Disable automatic reconnections
    this._isConnecting = false; // Clear any explicit connection attempt flag
    this.internalReconnectAttempts = 0; // Reset reconnection attempts

    // Reject any pending connect promise when explicitly disconnecting
    if (this.rejectConnectPromise) {
      this.rejectConnectPromise(new Error('Explicitly disconnected.'));
      this.resolveConnectPromise = null;
      this.rejectConnectPromise = null;
    }

    if (this.client && this.client.active) {
      // Unsubscribe from all active STOMP subscriptions
      this.subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.error(
            '[WebSocketService] Error unsubscribing during disconnect:',
            error,
          );
        }
      });

      this.subscriptions = []; // Clear raw STOMP subscriptions
      this.activeSubscriptions = []; // Clear active subscriptions
      this.pendingSubscriptions = []; // Clear pending subscriptions as they shouldn't be re-established after explicit disconnect

      this.client.deactivate(); // Deactivate the STOMP client
      console.log('[WebSocketService] Disconnected and cleaned up.');
    } else {
      console.log(
        '[WebSocketService] Not connected or client not active, no need to disconnect.',
      );
    }

    // Clear all registered callbacks
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
  }

  /**
   * Subscribes to a given destination. If not connected, the subscription is queued.
   * @param destination The topic or queue to subscribe to.
   * @param callback The function to call when a message is received.
   * @returns The StompSubscription object if immediately subscribed, or undefined if queued/failed.
   */
  public subscribe(
    destination: string,
    callback: (message: IMessage) => void,
  ): StompSubscription | undefined {
    console.log(`[WebSocketService] subscribe() called for ${destination}`);

    // Check if already actively subscribed
    const existingActive = this.activeSubscriptions.find(
      sub => sub.destination === destination,
    );
    if (existingActive) {
      console.warn(
        `[WebSocketService] Already actively subscribed to ${destination}.`,
      );
      return existingActive.stompSubscription;
    }

    // Check if already pending subscription
    const isPending = this.pendingSubscriptions.some(
      sub => sub.destination === destination,
    );
    if (isPending) {
      console.warn(
        `[WebSocketService] Subscription already pending for ${destination}.`,
      );
      return undefined; // Cannot return StompSubscription for a pending one
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
        console.log(`[WebSocketService] Subscribed to ${destination}.`);
        this.logAllSubscribedDestinations();
        return subscription;
      } catch (error) {
        console.error(
          `[WebSocketService] Failed to subscribe to ${destination} while connected:`,
          error,
        );
        // Add to pending for retry on next successful connect
        this.pendingSubscriptions.push({destination, callback});
        return undefined;
      }
    } else {
      console.log(
        `[WebSocketService] Not connected; queuing subscription for ${destination}.`,
      );
      this.pendingSubscriptions.push({destination, callback});
      return undefined;
    }
  }

  /**
   * Unsubscribes from a given destination.
   * @param destination The topic or queue to unsubscribe from.
   */
  public unsubscribe(destination: string): void {
    // Remove from active subscriptions
    const activeIndex = this.activeSubscriptions.findIndex(
      sub => sub.destination === destination,
    );

    if (activeIndex !== -1) {
      const {stompSubscription} = this.activeSubscriptions[activeIndex];
      try {
        stompSubscription.unsubscribe(); // Unsubscribe from STOMP
      } catch (error) {
        console.error(
          `[WebSocketService] Error during STOMP unsubscribe from ${destination}:`,
          error,
        );
      }

      this.activeSubscriptions.splice(activeIndex, 1); // Remove from our active list
      this.subscriptions = this.subscriptions.filter(
        sub => sub.id !== stompSubscription.id, // Remove from raw list
      );
      console.log(`[WebSocketService] Unsubscribed from ${destination}.`);
    }

    // Remove from pending subscriptions (if it was queued but not yet active)
    const pendingIndex = this.pendingSubscriptions.findIndex(
      sub => sub.destination === destination,
    );
    if (pendingIndex !== -1) {
      this.pendingSubscriptions.splice(pendingIndex, 1);
      console.log(
        `[WebSocketService] Removed pending subscription for ${destination}.`,
      );
    }
    this.logAllSubscribedDestinations(); // Log current subscription state
  }

  /**
   * Sends a message to a given destination.
   * @param destination The topic or queue to send the message to.
   * @param headers Optional headers for the message.
   * @param body Optional body of the message (must be a string).
   */
  public send(
    destination: string,
    headers: Record<string, string> = {},
    body: string = '',
  ): void {
    if (this.isConnected()) {
      try {
        this.client!.publish({destination, headers, body});
        console.log(`[WebSocketService] Message sent to ${destination}.`);
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

  /**
   * Logs all currently active and pending subscriptions to the console.
   */
  public logAllSubscribedDestinations(): void {
    const activeCount = this.activeSubscriptions.length;
    const pendingCount = this.pendingSubscriptions.length;

    if (activeCount === 0 && pendingCount === 0) {
      console.log('[WebSocketService] No active or pending subscriptions.');
      return;
    }

    if (activeCount > 0) {
      console.log('[WebSocketService] Active subscriptions:');
      this.activeSubscriptions.forEach((sub, index) => {
        console.log(
          `    ${index + 1}. ${sub.destination} (ID: ${
            sub.stompSubscription.id
          })`,
        );
      });
    }

    if (pendingCount > 0) {
      console.log(
        '[WebSocketService] Pending subscriptions (will be re-attempted on connect):',
      );
      this.pendingSubscriptions.forEach((sub, index) => {
        console.log(`    ${index + 1}. ${sub.destination}`);
      });
    }
  }
}
