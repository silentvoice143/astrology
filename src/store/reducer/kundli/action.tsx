import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const getPersonKundliDetail = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('kundli/detail', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/kundli', payload.data, {
      params: payload.query,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const kundliChart = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('kundli/chart', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/kundli/chart', payload.body, {
      params: payload.query,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const kundliVimshottari = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('kundli/chart-vimshottari', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post(
      '/api/v1/kundli/vimshottari-dasha',
      payload.body,
      {
        params: payload.query,
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
