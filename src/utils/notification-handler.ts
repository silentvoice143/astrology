import {useNavigation} from '@react-navigation/native';

export const handleNotificationNavigation = (data: any) => {
  const navigation = useNavigation<any>();
  const navigate = navigation.navigate;
  if (!data) return;

  switch (data.type) {
    case 'BOOKING_APPROVED':
      navigate('MainTabs', {
        screen: 'Booking',
        params: {
          screen: 'MyBooking',
        },
      });
      break;

    case 'SESSION_CREATED':
      navigate('MainTabs', {
        screen: 'Booking',
        params: {
          screen: 'MyBooking',
        },
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
