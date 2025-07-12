import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';
import {UserPersonalDetail} from '../../../utils/types';

type UserResponse = any;
type ThunkApiConfig = {
  rejectValue: any;
};

export const userDetail = createAsyncThunk<UserResponse, void, ThunkApiConfig>(
  'login/user-detail',
  async (_, {rejectWithValue}) => {
    try {
      const response = await api.get('/api/v1/users');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const postUserDetail = createAsyncThunk<
  UserResponse,
  UserPersonalDetail, // Accepts a User object as the payload
  ThunkApiConfig
>('post/user-detail', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.post('/api/v1/users', payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
