import {useEffect, useState} from 'react';
import {useWebSocket} from './use-socket';
import {
  setCallSession,
  setSession,
  toggleCountRefresh,
} from '../store/reducer/session';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {decodeMessageBody} from '../utils/utils';

import {useUserRole} from './use-role';
import Toast from 'react-native-toast-message';

interface CallRequest {
  userId: string;
  callType: 'VOICE' | 'VIDEO';
}

let hasSubscribed = false;

export const useSessionEvents = (
  userId: string = '',
  active: boolean = false,
) => {
  const {subscribe, unsubscribe} = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const {session} = useAppSelector(state => state.session);
  const role = useUserRole();
  const [callRequestNotification, setCallRequestNotification] = useState(false);
  const [callRequest, setCallRequest] = useState<CallRequest>({
    userId: '',
    callType: 'VOICE',
  });

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
        const res = JSON.parse(decodeMessageBody(msg));
        dispatch(toggleCountRefresh());
        Toast.show({
          type: 'success',
          text1: 'Session',
          text2: res.msg,
        });
        setCallRequest(res);
        setCallRequestNotification(true);
      } catch (err) {
        console.error('Failed to parse queue message:', err);
      }
    });

    const callSessionSub = subscribe(`/topic/call/${userId}/session`, msg => {
      console.log('call session received');
      try {
        const sessionData = JSON.parse(decodeMessageBody(msg));
        console.log('Session details received:', sessionData);
        dispatch(setCallSession(sessionData));
      } catch (err) {
        console.error('Session details parse error:', err);
      }
    });

    const chatSub = subscribe(requestDest, msg => {
      try {
        console.log('chat session received');
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
      unsubscribe(queueDest);
      unsubscribe(requestDest);
      unsubscribe(`/topic/call/${userId}/session`);
      hasSubscribed = false; // allow re-subscription if needed on remount
    };
  }, [subscribe, userId, active]);

  return {callRequest, callRequestNotification};
};
