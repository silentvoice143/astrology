// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  getDailyHoroscope,
  getMonthlyHoroscope,
  getWeeklyHoroscope,
} from './action';

const initialState = {};

const horoscopeSlice = createSlice({
  name: 'horoscope',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getDailyHoroscope.fulfilled, state => {});
    builder.addCase(getMonthlyHoroscope.fulfilled, state => {});
    builder.addCase(getWeeklyHoroscope.fulfilled, state => {});
  },
});

// export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
//   kundliSlice.actions;
export {getDailyHoroscope, getWeeklyHoroscope, getMonthlyHoroscope};
export default horoscopeSlice.reducer;
