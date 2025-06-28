import {useEffect} from 'react';
import {useWebSocket} from './use-socket';
import {useDispatch} from 'react-redux';
// import {
//   setSession,
//   setQueueMessage,
//   setSessionError,
// } from '../store/slices/sessionSlice';

export const useSessionEvents = (userId: string) => {
  const {subscribe} = useWebSocket(userId);
  const dispatch = useDispatch();

  useEffect(() => {
    const sub = subscribe(`/topic/chat/${userId}/id`, msg => {
      try {
        const data = JSON.parse(msg.body);
        console.log(data, '-----------data of session');
        // const { type, payload } = data;

        // switch (type) {
        //   case 'CHAT_REQUEST':
        //     // Show a modal/dialog for astrologer to accept or reject
        //     console.log('Incoming chat request', payload);
        //     // maybe dispatch to session UI or store temporary request
        //     break;

        //   case 'CHAT_ACCEPTED':
        //     dispatch(setSession(payload.session));
        //     break;

        //   case 'IN_QUEUE':
        //     dispatch(setQueueMessage(payload.message));
        //     break;

        //   case 'CHAT_ENDED':
        //     dispatch(setQueueMessage('Chat has ended.'));
        //     break;

        //   default:
        //     console.warn('Unknown chat message type:', type);
        // }
      } catch (err) {
        // dispatch(setSessionError('Failed to parse chat message.'));
        console.error(err);
      }
    });

    return () => sub?.unsubscribe();
  }, [subscribe, userId, dispatch]);
};
