import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const bookAppointmentReq = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('appointment/booking', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/appointment/booking', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getMyAppointment = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('appointment/mybooking', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(
      `/api/v1/appointment?page=${payload.page}&size=${payload.limit}`,
      {},
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const cancelMyAppointment = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('appointment/mybooking-cancel', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.patch(
      `/api/v1/appointment/${payload.id}`,
      payload.body,
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
