import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis'; // assumes axios instance is configured here

export const getDailyHoroscope = createAsyncThunk<
  any, // response type
  string, // payload must be FormData
  {rejectValue: any}
>('get-daily-horoscope', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/horoscope/daily/${payload}`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getWeeklyHoroscope = createAsyncThunk<
  any, // response type
  string, // payload must be FormData
  {rejectValue: any}
>('get-weekly-horoscope', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/horoscope/weekly/${payload}`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getMonthlyHoroscope = createAsyncThunk<
  any, // response type
  string, // payload must be FormData
  {rejectValue: any}
>('get-monthly-horoscope', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/horoscope/monthly/${payload}`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
