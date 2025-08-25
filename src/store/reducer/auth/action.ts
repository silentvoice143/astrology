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

export const registerUser = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('auth/register-via-password', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/auth/register', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const loginUserPassword = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('auth/login-via-password', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/auth/login-by-password', payload);
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

export const onlineStatus = createAsyncThunk<
  any, // response type as any
  {onlineType: 'CHATONLINE' | 'AUDIOONLINE' | 'VIDEOONLINE'; status: boolean}, // argument type
  {rejectValue: any}
>('auth/online-status', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post(
      '/api/v1/astrologers/change-online',
      payload,
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const registerDevice = createAsyncThunk<
  any, // response type as any
  {deviceToken: string},
  {rejectValue: any}
>('auth/register-device', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/device-token/register', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const logoutDevice = createAsyncThunk<
  any, // response type as any
  void,
  {rejectValue: any}
>('auth/logout', async (_, {rejectWithValue}) => {
  try {
    const response = await api.get('/api/v1/auth/logout');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

//
