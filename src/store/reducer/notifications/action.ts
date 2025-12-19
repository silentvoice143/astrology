import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const getAllNotifications = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('my-notifications', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(
      `/api/v1/notifications?page=${payload.page}&size=${payload.limit}`,
      {},
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const markNotificationRead = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('my-notifications-read', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.put(`/api/v1/notifications/read/${payload}`, {});
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
