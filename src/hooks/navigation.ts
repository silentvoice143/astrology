export type RootStackParamList = {
  Home: undefined;
  DetailsProfile: {id: string};
  Astrologers: {sort: string; initialSearch: string};
  chat: undefined;
  // Add other screens here
};

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type TypedNavigation = NativeStackNavigationProp<RootStackParamList>;

export const useTypedNavigation = () => useNavigation<TypedNavigation>();
