import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

// Login thunk
export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async ({email, password}: {email: string; password: string}, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', {email, password});
      return response.data; // Usually includes token, user info
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);
