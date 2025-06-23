// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {KundliDetailResponse, UserPersonalDetail} from '../../../utils/types';
import {getPersonKundliDetail, kundliChart} from './action';

const now = new Date();

const initialUser: UserPersonalDetail = {
  name: '',
  gender: '',
  birthDate: now.toISOString().split('T')[0],
  birthTime: now.toTimeString().split(' ')[0],
  birthPlace: '',
  latitude: null,
  longitude: null,
};

// Define the shape of your kundliDetail data for better type safety
interface KundliState {
  kundliPerson: UserPersonalDetail;
  defaultUser: UserPersonalDetail;
  kundliDetail: KundliDetailResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: KundliState = {
  kundliPerson: initialUser,
  defaultUser: initialUser,
  kundliDetail: null,
  isLoading: false,
  error: null,
};

const kundliSlice = createSlice({
  name: 'kundli',
  initialState,
  reducers: {
    setKundliPerson(state, action: PayloadAction<UserPersonalDetail>) {
      state.kundliPerson = action.payload;
    },
    resetToDefaultUser(state) {
      state.kundliPerson = state.defaultUser;
    },
    setDefaultUser(state, action: PayloadAction<UserPersonalDetail>) {
      state.defaultUser = action.payload;
      state.kundliPerson = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPersonKundliDetail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPersonKundliDetail.fulfilled, (state, {payload}) => {
        state.isLoading = false;
        if (payload.success) {
          state.kundliDetail = payload.data.data;
        } else {
          state.error = 'Failed to load kundli details';
        }
      })
      .addCase(getPersonKundliDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(kundliChart.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kundliChart.fulfilled, (state, {payload}) => {
        state.isLoading = false;

        if (payload.success) {
          state.kundliDetail = payload.data.data;
        } else {
          state.error = 'Failed to load kundli chart';
        }
      })
      .addCase(kundliChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
  kundliSlice.actions;
export {getPersonKundliDetail, kundliChart};
export default kundliSlice.reducer;
