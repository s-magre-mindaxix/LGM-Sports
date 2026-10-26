import type { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import apiClient from "../../../../../../API/apiClient";

export interface LeavePolicy {
  status: number;
  id: number;
  leaveTypeID: number;
  leaveTypeName: string;
  designationID: number;
  designationName: string;
  allocatedDays: number;
}

export interface LeavePolicyCreatePayload {
  leaveTypeID: number;
  designationID: number;
  allocatedDays: number;
}

export const getAllLeavePolicies = async (): Promise<LeavePolicy[]> => {
  const response = await apiClient.get<LeavePolicy[]>(API_ENDPOINTS.LeavePolicies);
  return response.data;
};

// export const createLeavePolicy = async (payload: LeavePolicyCreatePayload): Promise<LeavePolicy> => {
//   const response = await apiClient.post<LeavePolicy>(API_ENDPOINTS.LeavePolicies, payload);
//   return response.data;
// };

export const createLeavePolicy = async (
  payload: LeavePolicyCreatePayload
): Promise<AxiosResponse<LeavePolicy>> => {
  const response = await apiClient.post<LeavePolicy>(API_ENDPOINTS.LeavePolicies, payload, {
    validateStatus: () => true,
  });
  return response;
};

