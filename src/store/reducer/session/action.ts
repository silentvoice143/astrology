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

export const skipSessionRequest = createAsyncThunk<
  any,
  string,
  {rejectValue: any}
>('session/post-skip-request', async (userId, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/chat/skip/${userId}`);
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

// ===================Chat history===================
export const getChatHistory = createAsyncThunk<
  any, // response type as any
  any,
  {rejectValue: any}
>('chat-history/get', async (payload: any, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/chat/history${payload}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
export const getChatMessages = createAsyncThunk<
  any, // response type as any
  any,
  {rejectValue: any}
>('chat-messages/get', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/chat/messages${payload}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
