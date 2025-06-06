// src/store/persistConfig.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PersistConfig} from 'redux-persist';
import {RootState} from './root-reducer';

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only persist auth
};

export default persistConfig;
