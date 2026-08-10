import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {bookAppointmentReq, getMyAppointment, startCall} from './action';

interface BookingState {}

const initialState: BookingState = {};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: builder => {},
});

export const {} = bookingSlice.actions;
export {bookAppointmentReq, getMyAppointment, startCall};
export default bookingSlice.reducer;
