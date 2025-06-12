import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {userDetail} from './action';

export interface UserState {
  id: string;
  name: string | null;
  mobile: string;
  role: 'USER' | 'ASTROLOGER';
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

const initialState: UserState = {
  id: '',
  name: '',
  mobile: '',
  role: 'USER',
  walletBalance: 0,
  createdAt: '',
  updatedAt: '',
};

const userSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitialUserData: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(userDetail.fulfilled, (state, {payload}) => {
      if (payload?.success) {
        return payload.data;
      }
    });
  },
});

export const {setInitialUserData} = userSlice.actions;
export {userDetail};
export default userSlice.reducer;
