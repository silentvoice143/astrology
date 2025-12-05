import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {bookAppointmentReq} from './action';

interface BookingState {}

const initialState: BookingState = {};

const authSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: builder => {},
});

export const {} = authSlice.actions;
export {bookAppointmentReq};
export default authSlice.reducer;
