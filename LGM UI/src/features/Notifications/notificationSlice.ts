// src/features/Notifications/notificationSlice.ts
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getNotifications as fetchNotificationsAPI,
  markNotificationAsRead,
} from "../../Modules/HRMS/Services/notificationService";

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async () => {
    const response = await fetchNotificationsAPI();
    return response;
  }
);

export const markOneNotificationRead = createAsyncThunk(
  "notifications/markOneRead",
  async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAllAsRead(state) {
      state.notifications.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.notifications = action.payload;
          state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        }
      )
      .addCase(
        markOneNotificationRead.fulfilled,
        (state, action: PayloadAction<number>) => {
          const notificationId = action.payload;
          const notification = state.notifications.find(
            (n) => n.id === notificationId
          );

          if (notification && !notification.isRead) {
            notification.isRead = true;
            state.unreadCount--;
          }
        }
      );
  },
});

export const { markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
