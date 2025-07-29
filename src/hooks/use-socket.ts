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
        socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';

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
      setConnecting(false);
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
      console.error('[useWebSocket] Service not initialized');
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
      console.log('[useWebSocket] Connection successful');
    } catch (error) {
      console.error('[useWebSocket] Connection failed:', error);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (!singletonService) {
      console.warn('[useWebSocket] Service not initialized');
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
        console.warn(
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
      console.warn(
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
        console.warn(
          '[useWebSocket] Tried to send before initializing service',
        );
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

    // Uncomment the next line if you want auto-connection
    // autoConnect();
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

// Alternative: Single hook approach (if you prefer not to have separate service file)
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
      setConnecting(false);
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
      console.error('Connection failed:', error);
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
