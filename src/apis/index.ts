// src/api/api.ts
import axios from 'axios';
import {getTokenFromStore} from '../utils/get-token';
import Toast from 'react-native-toast-message';
import skipAuthPaths from './skip-path';

const baseUrl =
  process.env.BASE_URL ||
  'https://9efd-2401-4900-1c37-1a7e-84a5-5ef9-5fab-be16.ngrok-free.app';

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const urlPath = config.url || '';

    const shouldSkip = skipAuthPaths.some((path: string) =>
      urlPath.startsWith(path),
    );
    const token = shouldSkip ? '' : getTokenFromStore();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    Toast.show({
      type: 'error',
      text1: 'Request Error',
      text2: error.message || 'Something went wrong',
    });
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    Toast.show({
      type: 'error',
      text1: 'API Error',
      text2: message,
    });

    return Promise.reject(error);
  },
);

export default api;
