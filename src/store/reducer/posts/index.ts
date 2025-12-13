import {getPosts} from './action';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PostState {}

const initialState: PostState = {};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: builder => {},
});

export const {} = postSlice.actions;
export {getPosts};
export default postSlice.reducer;
