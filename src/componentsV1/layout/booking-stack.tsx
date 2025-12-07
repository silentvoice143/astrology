import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Booking from '../../screens/booking';
import AllBookings from '../../screens/booking/all-booking';

const Stack = createNativeStackNavigator();

export default function BookingStack() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}
      initialRouteName="MyBooking">
      <Stack.Screen name="MyBooking" component={AllBookings} />
      <Stack.Screen name="BookAppointment" component={Booking} />
    </Stack.Navigator>
  );
}
