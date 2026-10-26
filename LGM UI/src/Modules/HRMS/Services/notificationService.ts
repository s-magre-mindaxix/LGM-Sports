import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import type { Notification } from '../../../features/Notifications/notificationSlice';

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>(API_ENDPOINTS.Notifications);
    return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.MarkAllNotificationsRead);
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    const url = `${API_ENDPOINTS.Notifications}/${notificationId}/read`;
    await apiClient.put(url);
};