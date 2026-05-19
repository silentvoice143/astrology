import { NavigatorScreenParams } from '@react-navigation/native';

export type AstrologerStackParamList = {
  AstrologersList: undefined;
  AstrologerDetails: { id: string };
};

export type RootStackParamList = {
  Home: undefined;

  DetailsProfile: {
    id: string;
  };

  Astrologers: NavigatorScreenParams<AstrologerStackParamList>;

  chat: undefined;
};

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TypedNavigation = NativeStackNavigationProp<RootStackParamList>;

export const useTypedNavigation = () => useNavigation<TypedNavigation>();
