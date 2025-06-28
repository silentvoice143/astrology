import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const sendSessionRequest = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('session/request', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/chat/request', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const acceptSessionRequest = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('session/accept', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post(`/api/v1/chat/accept/${payload}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
