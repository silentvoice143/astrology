import {navigate} from './navigation';

export const handleNotificationNavigation = (data: any) => {
  if (!data) return;

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

    default:
      navigate('Notification');
  }
};
