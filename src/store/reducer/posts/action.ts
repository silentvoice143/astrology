import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

export const getPosts = createAsyncThunk<
  any, // response type as any
  any, // argument type
  {rejectValue: any}
>('posts/getposts', async (payload, {rejectWithValue}) => {
  try {
    const response = await api.get(
      `/api/v1/posts?page=${payload.page}&size=${payload.limit}`,
      {},
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
