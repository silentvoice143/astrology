import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useWebSocket} from './use-socket-new';
import {
  setActiveSession,
  setCallSession,
  setSession,
  toggleCountRefresh,
} from '../store/reducer/session';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {decodeMessageBody} from '../utils/utils';
import {useUserRole} from './use-role';
import Toast from 'react-native-toast-message';
import {setOnlineAstrologer} from '../store/reducer/astrologers';
import {setBalance} from '../store/reducer/auth';
import {getTransactionHistory} from '../store/reducer/payment';

export const useSessionEvents = (
  userId: string = '',
  isAuthenticated: boolean = false,
  isConnected: boolean = false,
) => {
  const {subscribe, unsubscribe} = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const role = useUserRole();
  const subscriptionsRef = useRef<string[]>([]);

  const getTransactionDetails = async () => {
    try {
      const payload = await dispatch(
        getTransactionHistory({userId: userId, query: `?page=1`}),
      ).unwrap();

      if (payload.success) {
        dispatch(setBalance({balance: payload?.wallet?.balance ?? 0}));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to get transactions',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to get transactions',
      });
    }
  };

  const subscribeAll = () => {
    if (!isAuthenticated || !isConnected || !userId) return;

    const queueDest = `/topic/queue/${userId}`;
    const requestDest = `/topic/chat/${userId}/chatId`;
    const callSessionDest = `/topic/call/${userId}/session`;
    const onlineAstroDest = `/topic/online/astrologer`;
    const activeSessionDest = `/topic/session/${userId}`;

    unsubscribeAll();

    subscriptionsRef.current = [
      queueDest,
      requestDest,
      callSessionDest,
      onlineAstroDest,
      activeSessionDest,
    ];

    // if (role === 'ASTROLOGER') {
    //   subscriptionsRef.current.push(activeSessionDest);
    // }

    subscribe(queueDest, msg => {
      try {
        const res = JSON.parse(decodeMessageBody(msg));
        dispatch(toggleCountRefresh());
        Toast.show({
          type: 'success',
          text1: 'Session',
          text2: res.msg,
        });
      } catch (err) {
        console.log('Failed to parse queue message:', err);
      }
    });

    subscribe(callSessionDest, msg => {
      try {
        const sessionData = JSON.parse(decodeMessageBody(msg));
        dispatch(setCallSession(sessionData));
        getTransactionDetails();
      } catch (err) {
        console.log('Session details parse error:', err);
      }
    });

    subscribe(requestDest, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        dispatch(setActiveSession(data));
        dispatch(setSession(data));
        getTransactionDetails();
        Toast.show({
          type: 'success',
          text1: role === 'USER' ? 'Request Accepted' : 'Request Accepted',
          text2:
            role === 'USER'
              ? 'Request accepted by the astrologer'
              : 'Session will start soon',
        });
      } catch (err) {
        console.log('Failed to parse chat id:', err);
      }
    });

    subscribe(onlineAstroDest, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log('Online astrologer---------------------------:', data);

        dispatch(setOnlineAstrologer(data));
      } catch (err) {
        console.log('Failed to parse online astrologer list:', err);
      }
    });

    subscribe(activeSessionDest, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));

        console.log('Active session update---------------------------:', data);
      } catch (err) {
        console.log('Failed to parse active session data:', err);
      }
    });
  };

  const unsubscribeAll = () => {
    subscriptionsRef.current.forEach(dest => {
      unsubscribe(dest);
    });
    subscriptionsRef.current = [];
  };

  useEffect(() => {
    if (isAuthenticated && isConnected && userId) {
      subscribeAll();
    }

    return () => {
      console.log('[useSessionEvents] Cleaning up...');
      unsubscribeAll();
    };
  }, [userId, isAuthenticated, isConnected, role]);
};
