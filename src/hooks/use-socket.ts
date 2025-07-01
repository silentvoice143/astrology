// hooks/useWebSocket.ts
import {useCallback, useEffect, useRef, useState} from 'react';
import {WebSocketService} from '../services/socket-service';
import {IMessage, StompSubscription} from '@stomp/stompjs';

export const useWebSocket = (
  userId: string,
  socketUrl?: string,
  autoConnect: boolean = true,
) => {
  const serviceRef = useRef<WebSocketService | null>(null);
  const [connected, setConnected] = useState(false);

  const initService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new WebSocketService(
        userId,
        socketUrl || 'https://gorilla-fitting-feline.ngrok-free.app/ws-chat',
      );

      // 🔹 Set connection state callbacks
      serviceRef.current.setOnConnect(() => setConnected(true));
      serviceRef.current.setOnDisconnect(() => setConnected(false));
    }
  }, [userId, socketUrl]);

  const connect = useCallback(() => {
    initService();
    serviceRef.current?.connect();
  }, [initService]);

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
  }, []);

  const subscribe = useCallback(
    (
      destination: string,
      callback: (message: IMessage) => void,
    ): StompSubscription | undefined => {
      console.log(`[useWebSocket] Subscribing to ${destination}`);
      return serviceRef.current?.subscribe(destination, callback);
    },
    [],
  );

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

  useEffect(() => {
    if (autoConnect) {
      connect();
      return () => disconnect();
    }
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    subscribe,
    send,
    isConnected: () => connected, // 🔥 Now exposes live connection state
  };
};
