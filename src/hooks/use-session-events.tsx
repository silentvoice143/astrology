import {useEffect} from 'react';
import {useWebSocket} from './use-socket';

function decodeMessageBody(message: any): string {
  if (message.isBinaryBody && message._binaryBody) {
    const byteArray = Object.values(message._binaryBody) as number[];
    const uint8Arr = new Uint8Array(byteArray);
    return new TextDecoder('utf-8').decode(uint8Arr);
  } else if (typeof message.body === 'string') {
    return message.body;
  } else {
    console.warn('Unknown message format:', message);
    return '';
  }
}

export const useSessionEvents = (
  userId: string = '',
  active: boolean = false,
) => {
  const {subscribe} = useWebSocket(userId);
  console.log(userId, 'Subscribing to session events...');

  useEffect(() => {
    if (!active || !userId) return;

    const queueSub = subscribe(`/topic/queue/${userId}`, msg => {
      try {
        console.log(decodeMessageBody(msg));
        // const data = JSON.parse(msg.body);
        // console.log('Queue message:', data);
      } catch (err) {
        console.error('Failed to parse queue message:', err);
      }
    });

    const chatSub = subscribe(`/topic/chat/${userId}/chatId`, msg => {
      try {
        // const data = msg;
        console.log(JSON.parse(decodeMessageBody(msg)));
      } catch (err) {
        console.error('Failed to parse chat message:', err);
      }
    });

    return () => {
      queueSub?.unsubscribe();
      chatSub?.unsubscribe();
    };
  }, [subscribe, userId, active]);
};
