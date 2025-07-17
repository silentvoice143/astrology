import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis'; // assumes axios instance is configured here

export const uploadImage = createAsyncThunk<
  any, // response type
  FormData, // payload must be FormData
  {rejectValue: any}
>('image/upload-POST', async (formData, {rejectWithValue}) => {
  console.log(formData, 'this api hits,....');
  try {
    const response = await api.post('/api/v1/chat/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
