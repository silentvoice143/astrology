import {store} from '../store';

export const getTokenFromStore = (): string | null => {
  const state = store.getState();
  return state.auth.token; // Adjust path if you renamed `auth`
};
