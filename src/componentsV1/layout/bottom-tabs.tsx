import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text} from 'react-native';
import Home from '../../screens/home/index';
import {COLORS} from '../../constants/colors';
import Feeds from '../../screens/feeds';
import Astrologers from '../../screens/astrologers/index';
import Booking from '../../screens/booking';
import Remedies from '../../screens/remedies/index';
import HomeIcon from '../../assets/svgs/home-icon';
import FeedIcon from '../../assets/svgs/feed-icon';
import AstrologerIcon from '../../assets/svgs/astrologer-icon';
import BookingIcon from '../../assets/svgs/booking-icon';
import RemediesIcon from '../../assets/svgs/remedies-icon';
import CustomerSupport from '../../screens/customer-support/index';
import HomeStack from './home-stack';

const Tab = createBottomTabNavigator();

function DummyIcon({focused}) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: focused ? COLORS.theme.secondary : COLORS.theme.white,
      }}
    />
  );
}

const getTabIcon = (routeName: string, focused: boolean, color: string) => {
  const size = focused ? 24 : 24; // slightly bigger when active

  switch (routeName) {
    case 'Home':
      return <HomeIcon size={size} color={color} />;

    case 'Feeds':
      return <FeedIcon size={22} color={color} />;

    case 'Astrologers':
      return <AstrologerIcon size={size} color={color} />;

    case 'Bookings':
      return <BookingIcon size={size} color={color} />;

    case 'Remedies':
      return <RemediesIcon size={size} color={color} />;

    default:
      return null;
  }
};

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: true, // show text
        tabBarActiveTintColor: COLORS.theme.secondary,
        tabBarInactiveTintColor: COLORS.theme.white,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.theme.primary,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          //   borderTopLeftRadius: 16,
          //   borderTopRightRadius: 16,
          position: 'absolute',
        },

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarIcon: ({focused, color}) =>
          getTabIcon(route.name, focused, color),
      })}>
      {/* <Tab.Screen name="Home" component={HomeStack} /> */}
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Feeds" component={Feeds} />
      <Tab.Screen name="Astrologers" component={Astrologers} />
      <Tab.Screen name="Bookings" component={Booking} />
      <Tab.Screen name="Remedies" component={Remedies} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
