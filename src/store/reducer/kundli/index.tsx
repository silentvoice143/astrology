// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserPersonalDetail} from '../../../utils/types';

const now = new Date();

const initialUser: UserPersonalDetail = {
  name: '',
  gender: '',
  birthDate: now.toISOString().split('T')[0],
  birthTime: now.toTimeString().split(' ')[0],
  birthPlace: '',
  latitude: null,
  longitude: null,
};

interface KundliState {
  kundliPerson: UserPersonalDetail;
  defaultUser: UserPersonalDetail;
}

const initialState: KundliState = {
  kundliPerson: initialUser,
  defaultUser: initialUser,
};

const kundliSlice = createSlice({
  name: 'kundli',
  initialState,
  reducers: {
    setKundliPerson(state, action: PayloadAction<UserPersonalDetail>) {
      state.kundliPerson = action.payload;
    },
    resetToDefaultUser(state) {
      state.kundliPerson = state.defaultUser;
    },
    setDefaultUser(state, action: PayloadAction<UserPersonalDetail>) {
      state.defaultUser = action.payload;
      state.kundliPerson = action.payload;
    },
  },
});

export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
  kundliSlice.actions;
export default kundliSlice.reducer;
