import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const getQueueRequest = createAsyncThunk<
  any, // response type as any
  void,
  {rejectValue: any}
>('session/get-requests', async (_, {rejectWithValue}) => {
  try {
    const response = await api.get('/api/v1/chat/queue');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const sendSessionRequest = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('session/post-request', async (payload, {rejectWithValue}) => {
  try {
    console.log(payload, '-----bodyyy');
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
    const response = await api.get(`/api/v1/chat/accept/${payload}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
