import {AppState} from 'react-native';
import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from './redux-hook';
import {
  getQueueRequest,
  setQueueCount,
  toggleCountRefresh,
} from '../store/reducer/session'; // <-- your count action
import Toast from 'react-native-toast-message';

export const useQueueCountOnResume = (
  isAuthenticated: boolean,
  role: string,
) => {
  if (role !== 'ASTROLOGER') return;
  const dispatch = useAppDispatch();
  const {countRefresh} = useAppSelector(state => state.session);
  const appState = useRef(AppState.currentState);

  const fetchQueueCount = async () => {
    try {
      const payload = await dispatch(getQueueRequest()).unwrap();
      if (payload.success) {
        dispatch(setQueueCount(payload?.users.length));
      } else {
        Toast.show({
          type: 'info',
          text1: 'Something went wrong! try again',
        });
      }
    } catch (err) {
    } finally {
      dispatch(toggleCountRefresh());
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        fetchQueueCount(); // refresh on resume
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (countRefresh) {
      fetchQueueCount();
    }
  }, [isAuthenticated, countRefresh]);
};
