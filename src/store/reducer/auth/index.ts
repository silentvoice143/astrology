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
  name: string;
  token: string | null;
  mobile: string | null;
  firstTime: boolean;
  otp: string;
  user: UserDetail;
  isProfileComplete: boolean;
}

const initialState: AuthState = {
  name: '',
  token: null,
  mobile: null,
  firstTime: true,
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
  },
  isProfileComplete: false,
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
    setUser(state, action) {
      state.user = action.payload;
      state.isProfileComplete = isProfileComplete(action.payload);
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
          state.mobile = payload.user.mobile;
          state.user = {...payload.user};
          state.name = payload.user.name;
          state.isProfileComplete = isProfileComplete(payload.user);
        }
      });
  },
});

export const {logout, setMobile, setFirstTime, setUser} = authSlice.actions;
export {loginUser, verifyOtp};
export default authSlice.reducer;
