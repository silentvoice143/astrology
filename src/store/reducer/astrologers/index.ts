import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getAllAstrologerById, getAllAstrologers} from './action';

export interface AstrologersState {
  onlineAstrologer: string[];
}

const initialState: AstrologersState = {
  onlineAstrologer: [],
};

const userSlice = createSlice({
  name: 'astrologers',
  initialState,
  reducers: {
    setInitialUserData: () => {
      return initialState;
    },
    setOnlineAstrologer: (state, action) => {
      state.onlineAstrologer = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(getAllAstrologers.fulfilled, (state, {payload}) => {
      if (payload?.success) {
        return payload.data;
      }
    });
    builder.addCase(getAllAstrologerById.fulfilled, (state, {payload}) => {
      if (payload?.success) {
        return payload.data;
      }
    });
  },
});

export const {setInitialUserData, setOnlineAstrologer} = userSlice.actions;
export {getAllAstrologers, getAllAstrologerById};
export default userSlice.reducer;
