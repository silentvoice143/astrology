import {useAppDispatch} from '../hooks/redux-hook';
import {navigate} from './navigation';

export const handleNotificationNavigation = (data: any) => {
  if (!data) return;
  // const decodedData = JSON.parse(data);

  switch (data.type) {
    case 'BOOKING_APPROVED':
    case 'SESSION_CREATED':
      navigate('MainTabs', {
        screen: 'Booking',
        params: {screen: 'MyBooking'},
      });
      break;

    case 'POST_CREATED':
      navigate('MainTabs', {
        screen: 'Feeds',
      });
      break;

    case 'CHAT_MESSAGE':
      navigate('ChatScreen');
      break;

    default:
      navigate('Notification');
  }
};
