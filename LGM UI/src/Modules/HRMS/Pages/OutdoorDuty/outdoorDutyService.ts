import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

export interface OutdoorDutyView {
  id: number;
  employeeID: number;
  employeeName: string;
  employeeCode: string;
  fromDate: string; 
  toDate: string; 
  totalDays: number;
  description: string;
  appliedDate: string; 
  status: "Pending" | "Approved" | "Rejected";
  approverName: string;
  managerRemarks?: string;
}

export interface CreateODPayload {
  fromDate: string; 
  toDate: string;
  description: string;
}

export interface UpdateODStatusPayload {
  status: "Approved" | "Rejected";
  managerRemarks?: string;
}

export const createOD = async (payload: CreateODPayload): Promise<OutdoorDutyView> => {
  const response = await apiClient.post(API_ENDPOINTS.OutdoorDuty, payload);
  return response.data;
};

export const getMyODs = async (): Promise<OutdoorDutyView[]> => {
  const response = await apiClient.get(API_ENDPOINTS.MyOutdoorDuties);
  return response.data;
};

export const getPendingODs = async (): Promise<OutdoorDutyView[]> => {
  const response = await apiClient.get(API_ENDPOINTS.PendingODApprovals);
  return response.data;
};

export const updateODStatus = async (
  odId: number,
  payload: UpdateODStatusPayload
): Promise<OutdoorDutyView> => {
  const response = await apiClient.put(
    `${API_ENDPOINTS.UpdateODStatus}/${odId}/status`,
    payload
  );
  return response.data;
};

export const getODHistory = async (): Promise<OutdoorDutyView[]> => {
  const response = await apiClient.get(API_ENDPOINTS.OutdoorDutyHistory);
  return response.data;
};