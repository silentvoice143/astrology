import {useEffect} from 'react';
import {useWebSocket} from './use-socket';
import {addMessage, clearSession, setSession} from '../store/reducer/session';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {decodeMessageBody} from '../utils/utils';

import {useUserRole} from './use-role';
import Toast from 'react-native-toast-message';

let hasSubscribed = false;

export const useSessionEvents = (
  userId: string = '',
  active: boolean = false,
) => {
  const {subscribe} = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const {session} = useAppSelector(state => state.session);
  const role = useUserRole();

  useEffect(() => {
    // Guard: If already subscribed, don't do it again
    if (!active || !userId || hasSubscribed) return;

    console.log('[useSessionEvents] Subscribing globally...');
    hasSubscribed = true; // mark as subscribed

    const queueSub = subscribe(`/topic/queue/${userId}`, msg => {
      try {
        console.log(decodeMessageBody(msg));
        Toast.show({
          type: 'success',
          text1: 'Session',
          text2: decodeMessageBody(msg),
        });
      } catch (err) {
        console.error('Failed to parse queue message:', err);
      }
    });

    const chatSub = subscribe(`/topic/chat/${userId}/chatId`, msg => {
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
      queueSub?.unsubscribe();
      chatSub?.unsubscribe();

      hasSubscribed = false; // allow re-subscription if needed on remount
    };
  }, [subscribe, userId, active]);

  useEffect(() => {
    if (!session) return;

    const chatEnd = subscribe(`/topic/chat/${session.id}`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log(data);
        if (data.status === 'ended') {
          dispatch(clearSession());
          Toast.show({
            type: 'info',
            text1: 'Session Ended',
          });
        }
      } catch (err) {
        console.error('Failed to parse chat end message:', err);
      }
    });

    return () => {
      chatEnd?.unsubscribe();
    };
  }, [session, subscribe, userId]);
};
