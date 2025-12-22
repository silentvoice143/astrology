import {
  getPosts,
  likePost,
  addComment,
  deleteComment,
  getPostComments,
} from './action';
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
export {getPosts, likePost, addComment, deleteComment, getPostComments};
export default postSlice.reducer;
