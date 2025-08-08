import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

type UserResponse = any;
type ThunkApiConfig = {
  rejectValue: any;
};

export const getAllAstrologers = createAsyncThunk<
  UserResponse,
  string,
  ThunkApiConfig
>('astrologers/getAllAstrologers', async (params, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/astrologers${params}`);
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

export const getOnlineAstrologer = createAsyncThunk<
  UserResponse,
  {id: string},
  ThunkApiConfig
>('astrologers/getOnlineAstrologer', async (id, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/astrologers/online/list`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
