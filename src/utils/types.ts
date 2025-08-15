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
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  mobile: string;
  role: 'USER' | 'ADMIN' | string;
  walletBalance: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  imgUri: string;
  freeChatUsed?: boolean;
}

export interface Astrologers {
  about: string | null;
  blocked: boolean;
  experienceYears: number;
  expertise: string;
  id: string;
  languages: string;
  online: boolean;
  pricePerMinuteChat: number;
  pricePerMinuteVideo: number;
  pricePerMinuteVoice: number;
  user: UserDetail;
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

export interface OtherUserType {
  id: string;
  astrologerId?: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  mobile: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  imageUri?: string;
}

export interface CallSession {
  id: string;
  user: {
    id: string;
    name: string;
    imgUri?: string;
  };
  astrologer: {
    id: string;
    name: string;
    imgUri?: string;
  };
  startedAt: string;
  endedAt: string | null;
  status: 'ACTIVE' | 'ENDED';
  sessionType: 'VOICE' | 'VIDEO';
  totalMinutes: number;
  totalCost: number;
  agoraChannelName: string;
  agoraToken?: string;
}

export interface SessionState {
  activeSession: ChatSession | null;
  session: ChatSession | null;
  callSession: CallSession | null;
  user: UserDetail | null;
  otherUser: UserDetail | null;
  sessionEnded: boolean;
  messages: Message[];
  queueRequestCount: number;
  countRefresh: boolean;
  sessionRequest: {
    userId: string;
    type: 'AUDIO' | 'VIDEO' | 'CHAT';
  } | null;
}

export interface Message {
  senderId: string;
  receiverId: string;
  sessionId: string;
  message: string;
  type: 'TEXT' | 'IMAGE';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  status: 'ACTIVE' | 'ENDED';
  totalCost: number;
  totalMinutes: number;
  astrologer: UserDetail;
  user: UserDetail;
}

// ========================================Wallets===============================

export interface Transaction {
  id: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  timestamp: string; // ISO date string
}

// =============Astrologer thunk===============
// Payload for create/edit action (JSON part)
export interface AstrologerFormPayload {
  name: string;
  mobile: string;
  expertise: string;
  experienceYears: number;
  pricePerMinuteChat: number;
  pricePerMinuteVoice: number;
  pricePerMinuteVideo: number;
  about?: string;
  languages?: string;
}

// Payload for createAstrologer thunk
export interface CreateAstrologerThunkInput {
  astrologerData: AstrologerFormPayload;
  imageFile?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

// Payload for editAstrologer thunk
export interface EditAstrologerThunkInput extends CreateAstrologerThunkInput {
  id: string;
}
