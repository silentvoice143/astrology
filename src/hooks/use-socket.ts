// hooks/useWebSocket.ts
import {useCallback, useEffect, useRef} from 'react';
import {WebSocketService} from '../services/socket-service';
import {IMessage, StompSubscription} from '@stomp/stompjs';

export const useWebSocket = (
  userId: string,
  socketUrl?: string,
  autoConnect: boolean = true,
) => {
  const serviceRef = useRef<WebSocketService | null>(null);

  const initService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new WebSocketService(
        userId,
        (socketUrl = 'https://quagga-driving-socially.ngrok-free.app/ws-chat'),
      );
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
  };
};
