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

//kundli

export interface KundliDetailResponse {
  nakshatra_details: {
    nakshatra: {
      id: number;
      name: string;
      pada: number;
      lord: {
        id: number;
        name: string;
        vedic_name: string;
      };
    };
    chandra_rasi: {
      id: number;
      name: string;
      lord: {
        id: number;
        name: string;
        vedic_name: string;
      };
    };
    soorya_rasi: {
      id: number;
      name: string;
      lord: {
        id: number;
        name: string;
        vedic_name: string;
      };
    };
    zodiac: {
      id: number;
      name: string;
    };
    additional_info: {
      deity: string;
      ganam: string;
      symbol: string;
      animal_sign: string;
      nadi: string;
      color: string;
      best_direction: string;
      syllables: string;
      birth_stone: string;
      gender: string;
      planet: string;
      enemy_yoni: string;
    };
  };
  mangal_dosha: {
    has_dosha: boolean;
    description: string;
  };
  yoga_details: {
    name: string;
    description: string;
  }[];
}

//session

export interface ChatSession {
  id: string;
  userId: string;
  astrologerId: string;
  startedAt: string;
  endedAt?: string | null;
  totalCost: number;
  totalMinutes: number;
  status: 'ACTIVE' | 'ENDED';
}

export interface SessionState {
  session: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  queueMessage: string | null;
  userId: string;
  otherUserId: string;
  sessionEnded: boolean;
  messages: Message[];
}

export interface Message {
  senderId: string;
  receiverId: string;
  sessionId: string;
  message: string;
  type: 'TEXT' | 'IMAGE';
  timestamp: string;
}
