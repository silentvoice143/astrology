import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

type UserResponse = any;
type ThunkApiConfig = {
  rejectValue: any;
};

export const getAllAstrologers = createAsyncThunk<
  UserResponse,
  void,
  ThunkApiConfig
>('astrologers/getAllAstrologers', async (_, {rejectWithValue}) => {
  try {
    const response = await api.get('/api/v1/astrologers?size=20');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
export const getAllAstrologerById = createAsyncThunk<
  UserResponse,
  {id: string},
  ThunkApiConfig
>('astrologers/getAllAstrologersById', async (id, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/astrologers/${id.id}`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
