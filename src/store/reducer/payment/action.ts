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

export const getWithdrawalRequest = createAsyncThunk<
  any,
  any,
  {rejectValue: any}
>(
  'get-payment-history-withdrawal',
  async (payload: number, {rejectWithValue}) => {
    try {
      const response = await api.get(
        `/api/v1/withdraw/request?amount=${payload}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const postTopUp = createAsyncThunk<
  any, // response type
  number, // payload must be FormData
  {rejectValue: any}
>('post-top-up', async (payload: number, {rejectWithValue}) => {
  try {
    const response = await api.post(`/api/v1/payment/topup`, {amount: payload});

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
