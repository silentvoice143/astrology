export type RootStackParamList = {
  Home: undefined; // if no params
  Profile: {userId: string}; // example with params
};

//users interface

export interface UserPersonalDetail {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number | null;
  longitude: number | null;
}

export interface UserDetail {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string; // Format: 'YYYY-MM-DD'
  birthTime: string; // Format: 'HH:mm:ss'
  birthPlace: string;
  latitude: number;
  longitude: number;
  mobile: string;
  role: 'USER' | 'ADMIN' | string;
  walletBalance: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

import {ImageSourcePropType} from 'react-native';

export interface Review {
  id: number;
  phoneNumber: string;
  date: string;
  rating: number;
  isFreeRating: boolean;
}

export interface AstrologerData {
  name: string;
  languages: string[];
  experience: string;
  followers: number;
  rating: number;
  consultationCharge: string;
  avatar: string;
  isOnline: boolean;
  isVerified: boolean;
  about: string;
  reviews: Review[];
  totalReviews: number;
}

// Interface for ReviewAvatarProps (if you decide to use it from here)
export interface ReviewAvatarProps {
  phoneNumber: string;
  size?: number;
}

// Interface for CircularRatingProps (if you decide to use it from here)
export interface CircularRatingProps {
  rating: number;
  size?: number;
}
