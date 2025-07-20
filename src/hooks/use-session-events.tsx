import {useEffect} from 'react';
import {useWebSocket} from './use-socket';
import {
  addMessage,
  clearSession,
  setSession,
  toggleCountRefresh,
} from '../store/reducer/session';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {decodeMessageBody} from '../utils/utils';

import {useUserRole} from './use-role';
import Toast from 'react-native-toast-message';

let hasSubscribed = false;

export const useSessionEvents = (
  userId: string = '',
  active: boolean = false,
) => {
  const {subscribe, unsubscribe} = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const {session} = useAppSelector(state => state.session);
  const role = useUserRole();

  useEffect(() => {
    // Guard: If already subscribed, don't do it again
    if (!active || !userId || hasSubscribed) return;
    let queueDest = `/topic/queue/${userId}`;
    let requestDest = `/topic/chat/${userId}/chatId`;

    console.log('[useSessionEvents] Subscribing globally...');
    hasSubscribed = true; // mark as subscribed

    const queueSub = subscribe(queueDest, msg => {
      try {
        console.log(decodeMessageBody(msg));
        dispatch(toggleCountRefresh());
        Toast.show({
          type: 'success',
          text1: 'Session',
          text2: decodeMessageBody(msg),
        });
      } catch (err) {
        console.error('Failed to parse queue message:', err);
      }
    });

    const chatSub = subscribe(requestDest, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        dispatch(setSession(data));
        Toast.show({
          type: 'success',
          text1: role === 'USER' ? 'Request Accepted' : 'Request Accepted',
          text2:
            role === 'USER'
              ? 'Request accepted by the astrologer'
              : 'Session will start soon',
        });
        console.log(data);
      } catch (err) {
        console.error('Failed to parse chat id:', err);
      }
    });

    return () => {
      console.log('[useSessionEvents] Cleaning up global subscriptions...');
      queueSub && unsubscribe(queueDest);
      chatSub && unsubscribe(requestDest);
      hasSubscribed = false;
    };
  }, [subscribe, userId, active]);
};
