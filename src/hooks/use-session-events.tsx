import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useWebSocket } from './use-socket-new';
import {

  setSession,

} from '../store/reducer/session';
import { useAppDispatch, useAppSelector } from './redux-hook';
import { decodeMessageBody } from '../utils/utils';
import { useUserRole } from './use-role';
import Toast from 'react-native-toast-message';
import {
  setOnlineAstrologer,
  setOnlineAstrologerDetails,
} from '../store/reducer/astrologers';
import { setBalance } from '../store/reducer/auth';
import { getTransactionHistory } from '../store/reducer/payment';

export const useSessionEvents = (
  userId: string = '',
  isAuthenticated: boolean = false,
  isConnected: boolean = false,
) => {

  const { subscribe, unsubscribe } = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const role = useUserRole();
  const subscriptionsRef = useRef<string[]>([]);

  const getTransactionDetails = async () => {
    try {
      const payload = await dispatch(
        getTransactionHistory({ userId: userId, query: `?page=1` }),
      ).unwrap();

      if (payload.success) {
        dispatch(setBalance({ balance: payload?.wallet?.balance ?? 0 }));
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
    const onlineAstrologerDest = '/topic/online/astrologer/list';
    const requestListDest = `/topic/requests/${userId}`;

    unsubscribeAll();

    subscriptionsRef.current = [
      queueDest,
      requestDest,
      callSessionDest,
      onlineAstroDest,
      activeSessionDest,
      onlineAstrologerDest,
    ];


    subscribe(onlineAstrologerDest, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log(
          'Online astrologer full details---------------------------:',
          data,
        );

        dispatch(setOnlineAstrologerDetails(data));
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
