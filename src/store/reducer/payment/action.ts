import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis'; // assumes axios instance is configured here

export const getTransactionHistory = createAsyncThunk<
  any, // response type
  any, // payload must be FormData
  {rejectValue: any}
>(
  'get-payment-history',
  async (payload: {userId: string; query: string}, {rejectWithValue}) => {
    try {
      const response = await api.get(`/api/v1/users/wallet${payload?.query}`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
