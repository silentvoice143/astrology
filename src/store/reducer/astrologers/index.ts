import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getAllAstrologerById, getAllAstrologers} from './action';

export interface AstrologersState {}

const initialState: AstrologersState = {};

const userSlice = createSlice({
  name: 'astrologers',
  initialState,
  reducers: {
    setInitialUserData: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(getAllAstrologers.fulfilled, (state, {payload}) => {
      if (payload?.success) {
        return payload.data;
      }
    })
    builder.addCase(getAllAstrologerById.fulfilled, (state, {payload}) => {
      if (payload?.success) {
        return payload.data;
      }
    });
  },
});

export const {setInitialUserData} = userSlice.actions;
export {getAllAstrologers,getAllAstrologerById};
export default userSlice.reducer;
