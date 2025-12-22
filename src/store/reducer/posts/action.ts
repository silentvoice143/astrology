// import {createAsyncThunk} from '@reduxjs/toolkit';
// import api from '../../../apis';

// export const getPosts = createAsyncThunk<
//   any, // response type as any
//   any, // argument type
//   {rejectValue: any}
// >('posts/getposts', async (payload, {rejectWithValue}) => {
//   try {
//     const response = await api.get(
//       `/api/v1/posts?page=${payload.page}&size=${payload.limit}`,
//       {},
//     );
//     return response.data;
//   } catch (error: any) {
//     return rejectWithValue(error.response?.data || error.message);
//   }
// });

import {createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../../apis';

/* ----------------------------------------
   GET POSTS (FEED)
---------------------------------------- */

export const getPosts = createAsyncThunk<
  any,
  {page: number; limit: number},
  {rejectValue: any}
>('posts/getPosts', async ({page, limit}, {rejectWithValue}) => {
  try {
    const response = await api.get(`/api/v1/posts?page=${page}&size=${limit}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

/* ----------------------------------------
   LIKE / UNLIKE POST
---------------------------------------- */
export const likePost = createAsyncThunk<
  {postId: string; status: string},
  {postId: string; like: string},
  {rejectValue: any}
>('posts/likePost', async ({postId, like}, {rejectWithValue}) => {
  try {
    const response = await api.put(`/api/v1/posts/${postId}/likes`, {
      status: like,
    });

    return {
      postId,
      status: like,
      response,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

/* ----------------------------------------
   ADD COMMENT
---------------------------------------- */

export const addComment = createAsyncThunk<
  any,
  {postId: string; comment: string},
  {rejectValue: any}
>('posts/addComment', async ({postId, comment}, {rejectWithValue}) => {
  try {
    const response = await api.post(`/api/v1/posts/${postId}/comments`, {
      comment,
    });
    return {
      postId,
      comment: response.data,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

/* ----------------------------------------
   DELETE COMMENT
---------------------------------------- */

export const deleteComment = createAsyncThunk<
  any,
  {commentId: string; postId: string},
  {rejectValue: any}
>('posts/deleteComment', async ({commentId, postId}, {rejectWithValue}) => {
  try {
    const res = await api.delete(`/api/v1/posts/comments/${commentId}`);
    return {data: res.data, commentId};
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

/* ----------------------------------------
   GET COMMENTS (PAGINATED)
---------------------------------------- */

export const getPostComments = createAsyncThunk<
  any,
  {postId: string; page: number; limit: number},
  {rejectValue: any}
>('posts/getPostComments', async ({postId, page, limit}, {rejectWithValue}) => {
  console.log(postId, page, limit);

  try {
    const response = await api.get(
      `/api/v1/posts/${postId}/comments?page=${page}&size=${limit}`,
    );
    return {
      postId,
      data: response.data,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});
