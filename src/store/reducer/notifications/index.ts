import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getAllNotifications, markNotificationRead} from './action';

/* 🔹 Notification model */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string | null;
  read: boolean;
}

/* 🔹 State interface */
interface NotificationState {
  notifications: Notification[];
  currentPage: number;
  isLastPage: boolean;
  loading: boolean;
}

/* 🔹 Initial state */
const initialState: NotificationState = {
  notifications: [],
  currentPage: 1,
  isLastPage: false,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    /* 🔹 Optimistic update for read status */
    markReadLocally: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload,
      );
      if (notification) {
        notification.read = true;
      }
    },
  },
  extraReducers: builder => {
    builder
      /* 🔹 Get all notifications */
      .addCase(getAllNotifications.pending, state => {
        state.loading = true;
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        const {notifications, currentPage, isLastPage} = action.payload;

        state.loading = false;
        state.currentPage = currentPage;
        state.isLastPage = isLastPage;

        if (currentPage === 1) {
          state.notifications = notifications;
        } else {
          state.notifications = [...state.notifications, ...notifications];
        }
      })
      .addCase(getAllNotifications.rejected, state => {
        state.loading = false;
      })

      /* 🔹 Mark notification as read (API success) */
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          n => n.id === action.payload,
        );
        if (notification) {
          notification.read = true;
        }
      });
  },
});

export const {markReadLocally} = notificationSlice.actions;
export {getAllNotifications, markNotificationRead};
export default notificationSlice.reducer;
