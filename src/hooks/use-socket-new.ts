import {useCallback, useEffect, useState, useRef} from 'react';
import {WebSocketService} from '../services/socket-service-new'; // Make sure this path is correct
import {IMessage, StompSubscription} from '@stomp/stompjs';

// Module-level singleton
let singletonService: WebSocketService | null = null;

export const useWebSocket = (userId: string, socketUrl?: string) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // Initialize service
  const initService = useCallback(() => {
    if (!singletonService) {
      const url =
        socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat';
      // 'https://quagga-driving-socially.ngrok-free.app/ws-chat';

      singletonService = new WebSocketService(userId, url);
      console.log('[useWebSocket] Service initialized with URL:', url);
    }
  }, [userId, socketUrl]);

  // Set up connection callbacks
  useEffect(() => {
    initService();

    // After initService, singletonService should now be initialized.
    // We add a check here to ensure TypeScript understands it's non-null
    // for the rest of this effect's scope.
    if (!singletonService) {
      console.log(
        '[useWebSocket] Fatal: WebSocketService singleton failed to initialize.',
      );
      return; // Exit if initialization failed unexpectedly
    }

    const updateConnectionStatus = () => {
      // Now, TypeScript knows singletonService is not null here
      setConnected(singletonService!.isConnected());
      setConnecting(singletonService!.isConnectingSocket());
    };

    const handleConnect = () => {
      console.log('[useWebSocket] Connected callback triggered');
      updateConnectionStatus();
    };

    const handleDisconnect = () => {
      console.log('[useWebSocket] Disconnected callback triggered');
      updateConnectionStatus();
    };

    // Add callbacks to service and store cleanup functions
    // Use non-null assertion as we've confirmed it's not null above
    const cleanupConnect = singletonService!.addOnConnect(handleConnect);
    const cleanupDisconnect =
      singletonService!.addOnDisconnect(handleDisconnect);

    cleanupFunctionsRef.current = [cleanupConnect, cleanupDisconnect];

    // Set initial state based on current connection status
    updateConnectionStatus();

    // Cleanup function
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [initService]); // initService is stable due to useCallback

  const connect = useCallback(async () => {
    if (!singletonService) {
      console.warn('[useWebSocket] Service not initialized, cannot connect.');
      return;
    }

    if (singletonService.isConnected()) {
      console.log('[useWebSocket] Already connected');
      setConnected(true);
      setConnecting(false);
      return;
    }

    if (singletonService.isConnectingSocket()) {
      console.log('[useWebSocket] Connection already in progress');
      setConnecting(true);
      return;
    }

    try {
      setConnecting(true);
      console.log('[useWebSocket] Initiating connection...');
      await singletonService.connect();
      // States will be updated by handleConnect callback if successful
    } catch (error) {
      console.log('[useWebSocket] Connection failed:', error);
      setConnecting(false);
      setConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (!singletonService) {
      console.warn(
        '[useWebSocket] Service not initialized, cannot disconnect.',
      );
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

  // Auto-connect effect
  useEffect(() => {
    const autoConnect = async () => {
      // Ensure singletonService is not null before accessing its methods
      if (
        singletonService &&
        !singletonService.isConnected() &&
        !singletonService.isConnectingSocket()
      ) {
        console.log('[useWebSocket] Auto-connecting...');
        await connect();
      }
    };

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
