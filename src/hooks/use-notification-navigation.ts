// hooks/useNotificationNavigation.ts
import {useNavigation} from '@react-navigation/native';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {RootStackParamList} from '../navigation/types';

// type NavigationProp = StackNavigationProp<any>;

export const useNotificationNavigation = () => {
  const navigation = useNavigation<any>();

  const handleNotificationNavigation = (data: any) => {
    if (!data) return;

    switch (data.type) {
      case 'BOOKING_APPROVED':
        navigation.navigate('BookingDetail', {
          bookingId: data.metadata?.bookingId,
        });
        break;

      case 'SESSION_CREATED':
        navigation.navigate('SessionScreen', {
          sessionId: data.metadata?.sessionId,
          sessionType: data.metadata?.sessionType,
        });
        break;

      case 'POST_CREATED':
        navigation.navigate('PostDetail', {
          postId: data.metadata?.postId,
        });
        break;

      default:
        navigation.navigate('Notifications');
    }
  };

  return {handleNotificationNavigation};
};
