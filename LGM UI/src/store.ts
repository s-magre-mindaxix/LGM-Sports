import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/User/authSlice";
import notificationReducer from "./features/Notifications/notificationSlice"; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
