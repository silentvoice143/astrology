import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

type LoginPayload = {
  mobile: string;
};

type verifyPayload = {
  mobile: string;
  otp: string;
};

export const loginUser = createAsyncThunk<
  any, // response type as any
  LoginPayload, // argument type
  {rejectValue: any}
>('auth/login', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/auth/login', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const verifyOtp = createAsyncThunk<
  any, // response type as any
  verifyPayload, // argument type
  {rejectValue: any}
>('auth/login/verify', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/auth/verify-otp', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
