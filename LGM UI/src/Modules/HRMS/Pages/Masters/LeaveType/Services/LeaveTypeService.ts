
import { AxiosError } from "axios";
import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface LeaveType {
  id: number;
  leaveTypeName: string;
}

export interface LeaveTypeCreatePayload {
  leaveTypeName: string;
}

export const getAllLeaveTypes = async (): Promise<LeaveType[]> => {
  const response = await apiClient.get<LeaveType[]>(API_ENDPOINTS.LeaveTypes);
  return response.data;
};

export const createLeaveType = async (payload: LeaveTypeCreatePayload): Promise<LeaveType> => {
  try {
    const response = await apiClient.post<LeaveType>(API_ENDPOINTS.LeaveTypes, payload);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error("An unexpected error occurred while creating the leave type.");
  }
};

export const updateLeaveType = async (id: number, payload: LeaveTypeCreatePayload): Promise<void> => {
  try {
    await apiClient.put(`${API_ENDPOINTS.LeaveTypes}/${id}`, payload);
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error("An unexpected error occurred while updating the leave type.");
  }
};

export const deleteLeaveType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.LeaveTypes}/${id}`);
};