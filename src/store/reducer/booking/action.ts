import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const bookAppointmentReq = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('auth/register-via-password', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/booking', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
