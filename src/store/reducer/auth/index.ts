import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {loginUser, verifyOtp} from './action';
import {UserDetail} from '../../../utils/types';
const isProfileComplete = (user: UserDetail): boolean => {
  return Boolean(
    user.name &&
      user.gender &&
      user.birthDate &&
      user.birthTime &&
      user.birthPlace &&
      user.latitude &&
      user.longitude,
  );
};
interface AuthState {
  isAuthenticated: boolean;
  astrologer_id?: string;
  astrologer_detail?: AstrologerProfile;
  name: string;
  token: string | null;
  mobile: string | null;
  firstTime: boolean;
  freeChatModalShown: boolean;
  otp: string;
  user: UserDetail;
  isProfileComplete: boolean;
  isProfileModalOpen: boolean;
}

export interface AstrologerProfile {
  id: string;
  about: string | null;
  blocked: boolean;
  experienceYears: number;
  expertise: string;
  imgUri: string;
  languages: string; // You can convert this to string[] if needed
  pricePerMinuteChat: number;
  pricePerMinuteVoice: number;
  pricePerMinuteVideo: number;
}

const initialState: AuthState = {
  name: '',
  isAuthenticated: false,
  astrologer_detail: {
    id: '',
    about: null,
    blocked: false,
    experienceYears: 0,
    expertise: '',
    imgUri: '',
    languages: '',
    pricePerMinuteChat: 0,
    pricePerMinuteVoice: 0,
    pricePerMinuteVideo: 0,
  },
  token: null,
  mobile: null,
  firstTime: true,
  freeChatModalShown: false,
  otp: '',
  user: {
    id: '',
    name: '',
    gender: 'MALE',
    birthDate: new Date().toISOString().split('T')[0], // e.g., "2025-06-21"
    birthTime: new Date().toTimeString().split(' ')[0], // e.g., "13:42:42"
    birthPlace: '',
    latitude: 0,
    longitude: 0,
    mobile: '',
    role: 'USER',
    walletBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imgUri: '',
    freeChatUsed: false,
  },
  isProfileComplete: false,
  isProfileModalOpen: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      return initialState;
    },
    setMobile(state, action) {
      state.mobile = action.payload.mobile;
    },
    setFirstTime(state) {
      state.firstTime = false;
    },
    setFreeChatModalShown: state => {
      state.freeChatModalShown = true;
    },
    setUser(state, action) {
      state.user = {...action.payload};
      state.isProfileComplete = isProfileComplete(action.payload);
    },
    setProfileModelToggle(state) {
      if (!state.isProfileModalOpen && !state.isProfileComplete) {
        state.isProfileModalOpen = true;
      } else {
        state.isProfileModalOpen = false;
      }
    },
    setAstrologer(state, action) {
      state.astrologer_detail = {...action.payload};
    },
    setAuthentication(state, action) {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.fulfilled, (state, {payload}) => {
        if (payload?.success) {
          state.otp = payload.otp;
        }
      })
      .addCase(verifyOtp.fulfilled, (state, {payload}) => {
        if (payload?.success) {
          state.token = payload.token;
          state.mobile = payload?.user?.mobile;
          state.user = {...payload?.user};
          state.name = payload?.user?.name;
          state.isProfileComplete = isProfileComplete(payload.user);
        }
      });
  },
});

export const {
  logout,
  setMobile,
  setFirstTime,
  setUser,
  setAstrologer,
  setProfileModelToggle,
  setAuthentication,
  setFreeChatModalShown,
} = authSlice.actions;
export {loginUser, verifyOtp};
export default authSlice.reducer;
