import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {loginUser, verifyOtp} from './action';

interface AuthState {
  token: string | null;
  mobile: string | null;
  otp: string;
  role: string;
  walletBalance: number;
  name: string;
  firstTime: boolean;
}

const initialState: AuthState = {
  token: null,
  mobile: null,
  otp: '',
  role: '',
  name: '',
  walletBalance: 0,
  firstTime: true,
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
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.fulfilled, (state, {payload}) => {
        if (payload?.success) {
          state.otp = payload.otp;
        }
      })
      .addCase(
        verifyOtp.fulfilled,
        (
          state,
          action: PayloadAction<{
            token: string;
            user: {
              name: string;
              mobile: string;
              role: string;
              walletBalance: number;
            };
          }>,
        ) => {
          state.token = action.payload.token;
          state.name = action.payload.user.name;
          state.mobile = action.payload.user.mobile;
          state.role = action.payload.user.role;
          state.walletBalance = action.payload.user.walletBalance;
        },
      );
  },
});

export const {logout, setMobile, setFirstTime} = authSlice.actions;
export {loginUser, verifyOtp};
export default authSlice.reducer;
