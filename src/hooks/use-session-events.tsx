import {useEffect} from 'react';
import {useWebSocket} from './use-socket';
import {clearSession, setSession} from '../store/reducer/session';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {decodeMessageBody} from '../utils/utils';
import {useNavigation} from '@react-navigation/native';
import {useUserRole} from './use-role';

export const useSessionEvents = (
  userId: string = '',
  active: boolean = false,
) => {
  const {subscribe} = useWebSocket(userId);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  console.log(userId, 'Subscribing to session events...');
  const session = useAppSelector(state => state.session.session);
  const role = useUserRole();

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
        const data = JSON.parse(decodeMessageBody(msg));
        dispatch(setSession(data));

        console.log(JSON.parse(decodeMessageBody(msg)));
      } catch (err) {
        console.error('Failed to parse chat id:', err);
      }
    });

    const chatMessage = subscribe(`/topic/chat/${userId}/messages`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));

        console.log(JSON.parse(decodeMessageBody(msg)));
      } catch (err) {
        console.error('Failed to parse chat message:', err);
      }
    });

    const typingMessage = subscribe(`/topic/chat/${userId}/typing`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log(JSON.parse(decodeMessageBody(msg)));
      } catch (err) {
        console.error('Failed to parse chat typing:', err);
      }
    });

    return () => {
      typingMessage?.unsubscribe();
      chatMessage?.unsubscribe();
      queueSub?.unsubscribe();
      chatSub?.unsubscribe();
    };
  }, [subscribe, userId, active]);

  useEffect(() => {
    if (!session) return;
    const chatEnd = subscribe(`/topic/chat/${session.id}`, msg => {
      try {
        const data = JSON.parse(decodeMessageBody(msg));
        console.log(JSON.parse(decodeMessageBody(msg)));
        if (data.status === 'ended') {
          dispatch(clearSession());
          role === 'USER'
            ? navigation.navigate('Astrologers')
            : navigation.navigate('session-request');
        }
      } catch (err) {
        console.error('Failed to parse chat message:', err);
      }
    });
    return () => chatEnd?.unsubscribe();
  }, [session, subscribe]);
};
