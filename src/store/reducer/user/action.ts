import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

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
