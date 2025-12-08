import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {bookAppointmentReq, getMyAppointment} from './action';

interface BookingState {}

const initialState: BookingState = {};

const authSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: builder => {},
});

export const {} = authSlice.actions;
export {bookAppointmentReq, getMyAppointment};
export default authSlice.reducer;
