import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Booking from '../../screens/booking';
import AllBookings from '../../screens/booking/all-booking';

import Astrologers from '../../screens/astrologers';
import AstrologersList from '../../screens/astrologer-list';

const Stack = createNativeStackNavigator();

export default function AstrologerStack() {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            initialRouteName="AstrologersList">
            <Stack.Screen name="AstrologersList" component={AstrologersList} />
            <Stack.Screen name="AstrologerDetails" component={Astrologers} />
            <Stack.Screen name="BookAppointment" component={Booking} />
        </Stack.Navigator>
    );
}
