import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  getAllAstrologerById,
  getAllAstrologers,
  getOnlineAstrologer,
} from './action';

export interface AstrologersState {
  onlineAstrologer: string[];
  onlineAstrologerDetails: any[];
}

const initialState: AstrologersState = {
  onlineAstrologer: [],
  onlineAstrologerDetails: [],
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
    setOnlineAstrologerDetails: (state, action) => {
      state.onlineAstrologerDetails = action.payload;
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
    builder.addCase(getOnlineAstrologer.fulfilled, (state, {payload}) => {
      if (payload?.success) {
        return payload.data;
      }
    });
  },
});

export const {
  setInitialUserData,
  setOnlineAstrologer,
  setOnlineAstrologerDetails,
} = userSlice.actions;
export {getAllAstrologers, getAllAstrologerById, getOnlineAstrologer};
export default userSlice.reducer;
