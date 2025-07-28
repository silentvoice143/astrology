import {useEffect, useRef, useState} from 'react';
import {useWebSocket} from './use-socket';
import {
  setActiveSession,
  setCallSession,
  setOtherUser,
  setRequest,
  setSession,
  toggleCountRefresh,
} from '../store/reducer/session';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {decodeMessageBody} from '../utils/utils';

import {useUserRole} from './use-role';
import Toast from 'react-native-toast-message';
import {setOnlineAstrologer} from '../store/reducer/astrologers';

interface CallRequest {
  userId: string;
  callType: 'VOICE' | 'VIDEO';
}

export const useSessionEvents = (
  userId: string = '',
  isAuthenticated: boolean = false,
  isConnected: boolean = false,
) => {
  const {subscribe, unsubscribe} = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const {session} = useAppSelector(state => state.session);
  const role = useUserRole();

  const hasSubscribed = useRef(false);

  console.log(role, '---role');

  useEffect(() => {
    // Guard: If already subscribed, don't do it again
    if (!isAuthenticated || !isConnected || !userId || hasSubscribed.current)
      return;

    let queueDest = `/topic/queue/${userId}`;
    let requestDest = `/topic/chat/${userId}/chatId`;
    let activeSessionDest = `/topic/session/${userId}`;
    let onlineAstroDest = `/topic/online/astrologer`;

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
        console.log(res, res.userId, res.type, 'get call request');
        // dispatch(
        //   setRequest({
        //     userId: res.userId,
        //     type: res.type as 'AUDIO' | 'VIDEO' | 'CHAT',
        //   }),
        // );
        // setCallRequest(res);
        // setCallRequestNotification(true);
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
        const data = JSON.parse(decodeMessageBody(msg));
        console.log('chat session received', data);
        dispatch(setActiveSession(data));
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

    const onlineAstroSub = subscribe(onlineAstroDest, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        dispatch(setOnlineAstrologer(data));
      } catch (err) {
        console.error('Failed to parse chat id:', err);
      }
    });

    if (role === 'ASTROLOGER') {
      const activeSessionSub = subscribe(activeSessionDest, msg => {
        try {
          const data = JSON.parse(decodeMessageBody(msg));
          console.log('chat session received', data);
        } catch (err) {
          console.error('Failed to parse chat id:', err);
        }
      });
    }

    hasSubscribed.current = true;

    return () => {
      console.log('[useSessionEvents] Cleaning up global subscriptions...');
      unsubscribe(queueDest);
      unsubscribe(requestDest);
      unsubscribe(`/topic/call/${userId}/session`);
      unsubscribe(onlineAstroDest);
      if (role !== 'ASTROLOGER') {
        unsubscribe(activeSessionDest);
      }
      hasSubscribed.current = false;
    };
  }, [subscribe, userId, isAuthenticated, isConnected, role]);
};
