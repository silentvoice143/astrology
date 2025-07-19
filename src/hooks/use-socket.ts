// hooks/useWebSocket.ts
import {useCallback, useEffect, useState} from 'react';
import {WebSocketService} from '../services/socket-service';
import {IMessage, StompSubscription} from '@stomp/stompjs';

// 🔹 Module-level singleton reference (global across your app)
let singletonService: WebSocketService | null = null;

export const useWebSocket = (userId: string, socketUrl?: string) => {
  const [connected, setConnected] = useState(false);

  const initService = useCallback(() => {
    if (!singletonService) {
      singletonService = new WebSocketService(
        userId,
        socketUrl || process.env.BASE_URL || 'https://astrosevaa.com/ws-chat',
        // socketUrl || 'https://quagga-driving-socially.ngrok-free.app/ws-chat',
        // socketUrl || 'https://gorilla-fitting-feline.ngrok-free.app/ws-chat',
      );

      singletonService.setOnConnect(() => setConnected(true));
      singletonService.setOnDisconnect(() => setConnected(false));
    }
  }, [userId, socketUrl]);

  const connect = useCallback(() => {
    initService();
    singletonService?.connect();
  }, [initService]);

  const disconnect = useCallback(() => {
    singletonService?.disconnect();
  }, []);

  const subscribe = useCallback(
    (
      destination: string,
      callback: (message: IMessage) => void,
    ): StompSubscription | undefined => {
      if (!singletonService) {
        console.warn('[useWebSocket] Tried to subscribe before initializing.');
        return undefined;
      }
      return singletonService.subscribe(destination, callback);
    },
    [],
  );

  const send = useCallback(
    (
      destination: string,
      headers: Record<string, string> = {},
      body: string = '',
    ) => {
      if (!singletonService) {
        console.warn('[useWebSocket] Tried to send before initializing.');
        return;
      }
      singletonService.send(destination, headers, body);
    },
    [],
  );

  return {
    connect,
    disconnect,
    subscribe,
    send,
    isConnected: connected,
  };
};
