// utils/handle-api-error.ts

import Toast from 'react-native-toast-message';

type ApiError = {
  message?: string;
  error?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

export const handleApiError = (
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.',
) => {
  console.log('API Error:', error);

  const err = error as ApiError;

  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    err?.error ||
    fallbackMessage;

  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  });

  return message;
};
