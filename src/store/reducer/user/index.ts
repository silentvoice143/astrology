import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {postUserDetail, userDetail} from './action';
import {UserDetail, UserPersonalDetail} from '../../../utils/types';

const initialState: UserDetail = {
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
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setInitialUserData: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(userDetail.fulfilled, (state, {payload}) => {})
      .addCase(postUserDetail.fulfilled, (state, {payload}) => {});
  },
});

export const {setInitialUserData} = userSlice.actions;
export {userDetail, postUserDetail};
export default userSlice.reducer;
