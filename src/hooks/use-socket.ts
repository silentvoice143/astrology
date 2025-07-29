// import {useCallback, useEffect, useState, useRef} from 'react';
// import {WebSocketService} from '../services/socket-service';
// import {IMessage, StompSubscription} from '@stomp/stompjs';

// // Module-level singleton
// let singletonService: WebSocketService | null = null;

// export const useWebSocket = (userId: string, socketUrl?: string) => {
//   const [connected, setConnected] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const connectCallbackRef = useRef<(() => void) | null>(null);
//   const disconnectCallbackRef = useRef<(() => void) | null>(null);
//   const cleanupFunctionsRef = useRef<(() => void)[]>([]);

//   // Initialize service
//   const initService = useCallback(() => {
//     if (!singletonService) {
//       const url =
//         socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';

//       singletonService = new WebSocketService(userId, url);
//       console.log('[useWebSocket] Service initialized with URL:', url);
//     }
//   }, [userId, socketUrl]);

//   // Set up connection callbacks
//   useEffect(() => {
//     initService();

//     if (!singletonService) return;

//     // Create callback functions
//     const handleConnect = () => {
//       console.log('[useWebSocket] Connected callback triggered');
//       setConnected(true);
//       setConnecting(false);
//     };

//     const handleDisconnect = () => {
//       console.log('[useWebSocket] Disconnected callback triggered');
//       setConnected(false);
//       // setConnecting(false);+
//       +

//     };

//     // Store references
//     connectCallbackRef.current = handleConnect;
//     disconnectCallbackRef.current = handleDisconnect;

//     // Add callbacks to service and store cleanup functions
//     const cleanupConnect = singletonService.addOnConnect(handleConnect);
//     const cleanupDisconnect =
//       singletonService.addOnDisconnect(handleDisconnect);

//     cleanupFunctionsRef.current = [cleanupConnect, cleanupDisconnect];

//     // Set initial state based on current connection status
//     setConnected(singletonService.isConnected());
//     setConnecting(singletonService.isConnectingSocket());

//     // Cleanup function
//     return () => {
//       cleanupFunctionsRef.current.forEach(cleanup => cleanup());
//       cleanupFunctionsRef.current = [];
//     };
//   }, [initService]);

//   const connect = useCallback(async () => {
//     if (!singletonService) {
//       console.log('[useWebSocket] Service not initialized');
//       return;
//     }

//     if (singletonService.isConnected()) {
//       console.log('[useWebSocket] Already connected');
//       return;
//     }

//     if (singletonService.isConnectingSocket()) {
//       console.log('[useWebSocket] Connection already in progress');
//       return;
//     }

//     try {
//       setConnecting(true);
//       console.log('[useWebSocket] Initiating connection...');
//       await singletonService.connect();
//       console.log('[useWebSocket] Connection successful');
//     } catch (error) {
//       console.log('[useWebSocket] Connection failed:', error);
//       setConnecting(false);
//     }
//   }, []);

//   const disconnect = useCallback(() => {
//     if (!singletonService) {
//       console.log('[useWebSocket] Service not initialized');
//       return;
//     }

//     singletonService.disconnect();
//     setConnected(false);
//     setConnecting(false);
//   }, []);

//   const subscribe = useCallback(
//     (
//       destination: string,
//       callback: (message: IMessage) => void,
//     ): StompSubscription | undefined => {
//       if (!singletonService) {
//         console.log(
//           '[useWebSocket] Tried to subscribe before initializing service',
//         );
//         return undefined;
//       }
//       return singletonService.subscribe(destination, callback);
//     },
//     [],
//   );

//   const unsubscribe = useCallback((destination: string) => {
//     if (!singletonService) {
//       console.log(
//         '[useWebSocket] Tried to unsubscribe before initializing service',
//       );
//       return;
//     }
//     singletonService.unsubscribe(destination);
//   }, []);

//   const send = useCallback(
//     (
//       destination: string,
//       headers: Record<string, string> = {},
//       body: string = '',
//     ) => {
//       if (!singletonService) {
//         console.log(
//           '[useWebSocket] Tried to send before initializing service',
//         );
//         return;
//       }
//       singletonService.send(destination, headers, body);
//     },
//     [],
//   );

//   // Auto-connect effect (optional)
//   useEffect(() => {
//     const autoConnect = async () => {
//       if (
//         singletonService &&
//         !singletonService.isConnected() &&
//         !singletonService.isConnectingSocket()
//       ) {
//         console.log('[useWebSocket] Auto-connecting...');
//         await connect();
//       }
//     };

//     // Uncomment the next line if you want auto-connection
//     // autoConnect();
//   }, [connect]);

//   return {
//     connect,
//     disconnect,
//     subscribe,
//     unsubscribe,
//     send,
//     isConnected: connected,
//     isConnecting: connecting,
//   };
// };

// // Alternative: Single hook approach (if you prefer not to have separate service file)
// export const useWebSocketSimple = (userId: string, socketUrl?: string) => {
//   const [connected, setConnected] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const serviceRef = useRef<WebSocketService | null>(null);

//   useEffect(() => {
//     const url =
//       socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';

//     serviceRef.current = new WebSocketService(userId, url);

//     const cleanupConnect = serviceRef.current.addOnConnect(() => {
//       setConnected(true);
//       setConnecting(false);
//     });

//     const cleanupDisconnect = serviceRef.current.addOnDisconnect(() => {
//       setConnected(false);
//       setConnecting(false);
//     });

//     return () => {
//       cleanupConnect();
//       cleanupDisconnect();
//       if (serviceRef.current) {
//         serviceRef.current.disconnect();
//         serviceRef.current = null;
//       }
//     };
//   }, [userId, socketUrl]);

//   const connect = useCallback(async () => {
//     if (!serviceRef.current) return;

//     try {
//       setConnecting(true);
//       await serviceRef.current.connect();
//     } catch (error) {
//       console.log('Connection failed:', error);
//       setConnecting(false);
//     }
//   }, []);

//   const disconnect = useCallback(() => {
//     if (serviceRef.current) {
//       serviceRef.current.disconnect();
//       setConnected(false);
//       setConnecting(false);
//     }
//   }, []);

//   const subscribe = useCallback(
//     (destination: string, callback: (message: IMessage) => void) => {
//       return serviceRef.current?.subscribe(destination, callback);
//     },
//     [],
//   );

//   const unsubscribe = useCallback((destination: string) => {
//     serviceRef.current?.unsubscribe(destination);
//   }, []);

//   const send = useCallback(
//     (
//       destination: string,
//       headers: Record<string, string> = {},
//       body: string = '',
//     ) => {
//       serviceRef.current?.send(destination, headers, body);
//     },
//     [],
//   );

//   return {
//     connect,
//     disconnect,
//     subscribe,
//     unsubscribe,
//     send,
//     isConnected: connected,
//     isConnecting: connecting,
//   };
// };

import {useCallback, useEffect, useState, useRef} from 'react';
import {WebSocketService} from '../services/socket-service';
import {IMessage, StompSubscription} from '@stomp/stompjs';

// Module-level singleton
let singletonService: WebSocketService | null = null;

export const useWebSocket = (userId: string, socketUrl?: string) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const connectCallbackRef = useRef<(() => void) | null>(null);
  const disconnectCallbackRef = useRef<(() => void) | null>(null);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // Initialize service
  const initService = useCallback(() => {
    if (!singletonService) {
      const url =
        // socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';
        'https://quagga-driving-socially.ngrok-free.app/ws-chat';

      singletonService = new WebSocketService(userId, url);
      console.log('[useWebSocket] Service initialized with URL:', url);
    }
  }, [userId, socketUrl]);

  // Set up connection callbacks
  useEffect(() => {
    initService();

    if (!singletonService) return;

    // Create callback functions
    const handleConnect = () => {
      console.log('[useWebSocket] Connected callback triggered');
      setConnected(true);
      setConnecting(false);
    };

    const handleDisconnect = () => {
      console.log('[useWebSocket] Disconnected callback triggered');
      setConnected(false);
      // The `isConnectingSocket()` from the service will correctly reflect
      // if a reconnection attempt is in progress.
    };

    // Store references
    connectCallbackRef.current = handleConnect;
    disconnectCallbackRef.current = handleDisconnect;

    // Add callbacks to service and store cleanup functions
    const cleanupConnect = singletonService.addOnConnect(handleConnect);
    const cleanupDisconnect =
      singletonService.addOnDisconnect(handleDisconnect);

    cleanupFunctionsRef.current = [cleanupConnect, cleanupDisconnect];

    // Set initial state based on current connection status
    setConnected(singletonService.isConnected());
    setConnecting(singletonService.isConnectingSocket());

    // Cleanup function
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [initService]);

  const connect = useCallback(async () => {
    if (!singletonService) {
      console.log('[useWebSocket] Service not initialized');
      return;
    }

    if (singletonService.isConnected()) {
      console.log('[useWebSocket] Already connected');
      return;
    }

    if (singletonService.isConnectingSocket()) {
      console.log('[useWebSocket] Connection already in progress');
      return;
    }

    try {
      setConnecting(true);
      console.log('[useWebSocket] Initiating connection...');
      await singletonService.connect();
      setConnecting(false);
      setConnected(true);
      console.log('[useWebSocket] Connection successful');
    } catch (error) {
      console.log('[useWebSocket] Connection failed:', error);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (!singletonService) {
      console.log('[useWebSocket] Service not initialized');
      return;
    }

    singletonService.disconnect();
    setConnected(false);
    setConnecting(false);
  }, []);

  const subscribe = useCallback(
    (
      destination: string,
      callback: (message: IMessage) => void,
    ): StompSubscription | undefined => {
      if (!singletonService) {
        console.log(
          '[useWebSocket] Tried to subscribe before initializing service',
        );
        return undefined;
      }
      return singletonService.subscribe(destination, callback);
    },
    [],
  );

  const unsubscribe = useCallback((destination: string) => {
    if (!singletonService) {
      console.log(
        '[useWebSocket] Tried to unsubscribe before initializing service',
      );
      return;
    }
    singletonService.unsubscribe(destination);
  }, []);

  const send = useCallback(
    (
      destination: string,
      headers: Record<string, string> = {},
      body: string = '',
    ) => {
      if (!singletonService) {
        console.log('[useWebSocket] Tried to send before initializing service');
        return;
      }
      singletonService.send(destination, headers, body);
    },
    [],
  );

  // Auto-connect effect (optional)
  useEffect(() => {
    const autoConnect = async () => {
      if (
        singletonService &&
        !singletonService.isConnected() &&
        !singletonService.isConnectingSocket()
      ) {
        console.log('[useWebSocket] Auto-connecting...');
        await connect();
      }
    };

    // Auto-connect is now enabled
    autoConnect();
  }, [connect]);

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    isConnected: connected,
    isConnecting: connecting,
  };
};

export const useWebSocketSimple = (userId: string, socketUrl?: string) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const serviceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    const url =
      socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';

    serviceRef.current = new WebSocketService(userId, url);

    const cleanupConnect = serviceRef.current.addOnConnect(() => {
      setConnected(true);
      setConnecting(false);
    });

    const cleanupDisconnect = serviceRef.current.addOnDisconnect(() => {
      setConnected(false);
      // Rely on serviceRef.current.isConnectingSocket()
    });

    return () => {
      cleanupConnect();
      cleanupDisconnect();
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        serviceRef.current = null;
      }
    };
  }, [userId, socketUrl]);

  const connect = useCallback(async () => {
    if (!serviceRef.current) return;

    try {
      setConnecting(true);
      await serviceRef.current.connect();
    } catch (error) {
      console.log('Connection failed:', error);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
      setConnected(false);
      setConnecting(false);
    }
  }, []);

  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      return serviceRef.current?.subscribe(destination, callback);
    },
    [],
  );

  const unsubscribe = useCallback((destination: string) => {
    serviceRef.current?.unsubscribe(destination);
  }, []);

  const send = useCallback(
    (
      destination: string,
      headers: Record<string, string> = {},
      body: string = '',
    ) => {
      serviceRef.current?.send(destination, headers, body);
    },
    [],
  );

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    isConnected: connected,
    isConnecting: connecting,
  };
};

// import {useCallback, useEffect, useState, useRef} from 'react';
// import {
//   WebSocketService,
//   ConnectionState,
//   ConnectionStatus,
// } from '../services/socket-service';
// import {IMessage, StompSubscription} from '@stomp/stompjs';

// // Module-level singleton
// let singletonService: WebSocketService | null = null;

// interface UseWebSocketOptions {
//   autoConnect?: boolean;
//   showErrorOnInitialConnect?: boolean;
//   showErrorOnReconnect?: boolean;
//   hideErrorAfterSeconds?: number;
// }

// export const useWebSocket = (
//   userId: string,
//   socketUrl?: string,
//   options: UseWebSocketOptions = {},
// ) => {
//   const {
//     autoConnect = true,
//     showErrorOnInitialConnect = true,
//     showErrorOnReconnect = false,
//     hideErrorAfterSeconds = 10,
//   } = options;

//   const [connected, setConnected] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
//     state: ConnectionState.DISCONNECTED,
//   });
//   const [shouldShowError, setShouldShowError] = useState(false);

//   const connectCallbackRef = useRef<(() => void) | null>(null);
//   const disconnectCallbackRef = useRef<(() => void) | null>(null);
//   const stateChangeCallbackRef = useRef<
//     ((status: ConnectionStatus) => void) | null
//   >(null);
//   const cleanupFunctionsRef = useRef<(() => void)[]>([]);
//   const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const hasConnectedOnceRef = useRef(false);

//   // Initialize service
//   const initService = useCallback(() => {
//     if (!singletonService) {
//       const url =
//         socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';

//       singletonService = new WebSocketService(userId, url);
//       console.log('[useWebSocket] Service initialized with URL:', url);
//     }
//   }, [userId, socketUrl]);

//   // Set up connection callbacks
//   useEffect(() => {
//     initService();

//     if (!singletonService) return;

//     // Create callback functions
//     const handleConnect = () => {
//       console.log('[useWebSocket] Connected callback triggered');
//       setConnected(true);
//       setConnecting(false);
//       hasConnectedOnceRef.current = true;
//     };

//     const handleDisconnect = () => {
//       console.log('[useWebSocket] Disconnected callback triggered');
//       setConnected(false);
//       // The connecting state will be managed by the connection state callback
//     };

//     const handleConnectionStateChange = (status: ConnectionStatus) => {
//       console.log('[useWebSocket] Connection state changed:', status.state);
//       setConnectionStatus(status);

//       // Update connecting state based on connection state
//       const isConnectingState =
//         status.state === ConnectionState.CONNECTING ||
//         status.state === ConnectionState.RECONNECTING;
//       setConnecting(isConnectingState);

//       // Handle error display logic
//       if (status.state === ConnectionState.CONNECTED) {
//         hasConnectedOnceRef.current = true;
//         setShouldShowError(false);
//         // Clear any existing error timeout
//         if (errorTimeoutRef.current) {
//           clearTimeout(errorTimeoutRef.current);
//           errorTimeoutRef.current = null;
//         }
//       } else if (status.state === ConnectionState.FAILED && status.error) {
//         const isInitialConnection = !hasConnectedOnceRef.current;
//         const isReconnectionFailure = hasConnectedOnceRef.current;

//         let showError = false;
//         if (isInitialConnection && showErrorOnInitialConnect) {
//           showError = true;
//         } else if (isReconnectionFailure && showErrorOnReconnect) {
//           showError = true;
//         }

//         setShouldShowError(showError);

//         // Auto-hide error after specified time
//         if (showError && hideErrorAfterSeconds > 0) {
//           if (errorTimeoutRef.current) {
//             clearTimeout(errorTimeoutRef.current);
//           }
//           errorTimeoutRef.current = setTimeout(() => {
//             setShouldShowError(false);
//           }, hideErrorAfterSeconds * 1000);
//         }
//       }
//     };

//     // Store references
//     connectCallbackRef.current = handleConnect;
//     disconnectCallbackRef.current = handleDisconnect;
//     stateChangeCallbackRef.current = handleConnectionStateChange;

//     // Add callbacks to service and store cleanup functions
//     const cleanupConnect = singletonService.addOnConnect(handleConnect);
//     const cleanupDisconnect =
//       singletonService.addOnDisconnect(handleDisconnect);
//     const cleanupStateChange = singletonService.addOnConnectionStateChange(
//       handleConnectionStateChange,
//     );

//     cleanupFunctionsRef.current = [
//       cleanupConnect,
//       cleanupDisconnect,
//       cleanupStateChange,
//     ];

//     // Set initial state based on current connection status
//     setConnected(singletonService.isConnected());
//     const currentStatus = singletonService.getConnectionStatus();
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
//   }, [
//     initService,
//     showErrorOnInitialConnect,
//     showErrorOnReconnect,
//     hideErrorAfterSeconds,
//   ]);

//   const connect = useCallback(async () => {
//     if (!singletonService) {
//       console.log('[useWebSocket] Service not initialized');
//       return;
//     }

//     if (singletonService.isConnected()) {
//       console.log('[useWebSocket] Already connected');
//       return;
//     }

//     if (
//       singletonService.getConnectionState() === ConnectionState.CONNECTING ||
//       singletonService.getConnectionState() === ConnectionState.RECONNECTING
//     ) {
//       console.log('[useWebSocket] Connection already in progress');
//       return;
//     }

//     try {
//       console.log('[useWebSocket] Initiating connection...');
//       await singletonService.connect();
//       console.log('[useWebSocket] Connection successful');
//     } catch (error) {
//       console.log('[useWebSocket] Connection failed:', error);
//     }
//   }, []);

//   const disconnect = useCallback(() => {
//     if (!singletonService) {
//       console.log('[useWebSocket] Service not initialized');
//       return;
//     }

//     singletonService.disconnect();
//     setConnected(false);
//     setConnecting(false);
//     setShouldShowError(false);
//     hasConnectedOnceRef.current = false;
//   }, []);

//   const retryConnection = useCallback(async () => {
//     if (!singletonService) {
//       console.log('[useWebSocket] Service not initialized');
//       return;
//     }

//     setShouldShowError(false);
//     if (errorTimeoutRef.current) {
//       clearTimeout(errorTimeoutRef.current);
//       errorTimeoutRef.current = null;
//     }

//     try {
//       await singletonService.retryConnection();
//     } catch (error) {
//       console.log('[useWebSocket] Retry connection failed:', error);
//     }
//   }, []);

//   const dismissError = useCallback(() => {
//     setShouldShowError(false);
//     if (errorTimeoutRef.current) {
//       clearTimeout(errorTimeoutRef.current);
//       errorTimeoutRef.current = null;
//     }
//   }, []);

//   const subscribe = useCallback(
//     (
//       destination: string,
//       callback: (message: IMessage) => void,
//     ): StompSubscription | undefined => {
//       if (!singletonService) {
//         console.log(
//           '[useWebSocket] Tried to subscribe before initializing service',
//         );
//         return undefined;
//       }
//       return singletonService.subscribe(destination, callback);
//     },
//     [],
//   );

//   const unsubscribe = useCallback((destination: string) => {
//     if (!singletonService) {
//       console.log(
//         '[useWebSocket] Tried to unsubscribe before initializing service',
//       );
//       return;
//     }
//     singletonService.unsubscribe(destination);
//   }, []);

//   const send = useCallback(
//     (
//       destination: string,
//       headers: Record<string, string> = {},
//       body: string = '',
//     ) => {
//       if (!singletonService) {
//         console.log('[useWebSocket] Tried to send before initializing service');
//         return;
//       }
//       singletonService.send(destination, headers, body);
//     },
//     [],
//   );

//   // Auto-connect effect
//   useEffect(() => {
//     const autoConnectAsync = async () => {
//       if (
//         autoConnect &&
//         singletonService &&
//         !singletonService.isConnected() &&
//         singletonService.getConnectionState() !== ConnectionState.CONNECTING &&
//         singletonService.getConnectionState() !== ConnectionState.RECONNECTING
//       ) {
//         console.log('[useWebSocket] Auto-connecting...');
//         await connect();
//       }
//     };

//     autoConnectAsync();
//   }, [connect, autoConnect]);

//   return {
//     connect,
//     disconnect,
//     retryConnection,
//     dismissError,
//     subscribe,
//     unsubscribe,
//     send,
//     isConnected: connected,
//     isConnecting: connecting,
//     isReconnecting: connectionStatus.state === ConnectionState.RECONNECTING,
//     connectionStatus,
//     shouldShowError,
//     // Legacy support - keep the old property names
//     connecting: connecting,
//   };
// };
