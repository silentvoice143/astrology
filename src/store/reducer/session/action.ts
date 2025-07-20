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

export const sendCallRequest = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('session/call-request', async (payload, {rejectWithValue}) => {
  try {
    console.log(payload, '-----bodyyy');
    const response = await api.post('/api/v1/call/request', payload);
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

export const acceptCallRequest = createAsyncThunk<any, any, {rejectValue: any}>(
  'session/accept-call',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await api.get(`/api/v1/call/accept/${payload}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// New action for rejecting call requests
export const rejectCallRequest = createAsyncThunk<
  any, // response type as any
  {
    sessionId: string;
    reason?: string;
  }, // argument type
  {rejectValue: any}
>('session/reject-call', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/call/reject', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// New action for ending calls
export const endCallRequest = createAsyncThunk<
  any, // response type as any
  {
    sessionId: string;
    userId: string;
  }, // argument type
  {rejectValue: any}
>('session/end-call', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/call/end', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
