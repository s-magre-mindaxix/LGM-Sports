import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import { AxiosError } from "axios";

// He AllocatedLeave interface tasa ch राहील.
export interface AllocatedLeave {
  assignLeaveTypeID: number;
  employeeID: number;
  employeeName: string;
  leaveTypeName: string;
  allocatedDays: number;
  financialYear: number;
}

export interface EmployeeSelection {
  id: number;
  fullName: string;
}

// Backend la data pathavnya saathi navin type define kela ahe.
export interface LeaveAllocationPayload {
  leaveTypeID: number;
  allocatedDays: number;
  financialYear: number;
   employeeID?: number; 
}

export interface LeaveUpdatePayload {
  allocatedDays: number;
}

export const getEmployeeSelectionList = async (): Promise<EmployeeSelection[]> => {
  try {
    const response = await apiClient.get<EmployeeSelection[]>(API_ENDPOINTS.EmployeeSelectionList);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee selection list:", error);
    throw new Error("Failed to fetch employee list.");
  }
};

// Adhichya function la ya navin function ne replace kel ahe.
export const allocateLeavesToAll = async (payload: LeaveAllocationPayload): Promise<{ message: string }> => {
  try {
    // Navin endpoint la POST request pathavto ani body madhe payload deto.
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AllocateLeaves, // Tumchya apiConfig madhe ha endpoint add kara lagel: '/api/LeaveManagement/allocate-leaves'
      payload
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error instanceof AxiosError && typeof error.response?.data === 'string') {
      throw new Error(error.response.data);
    }
    throw new Error("An unexpected error occurred during leave allocation.");
  }
};

// He function jasha cha tasa राहील.
export const getAllocatedLeavesForYear = async (financialYear: number): Promise<AllocatedLeave[]> => {
  const response = await apiClient.get<AllocatedLeave[]>(
    `${API_ENDPOINTS.ViewAllocatedLeaves}/${financialYear}`
  );
  return response.data;
};

export const updateAllocatedLeave = async (
  assignLeaveTypeID: number,
  payload: LeaveUpdatePayload
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.put<{ message: string }>(
      `${API_ENDPOINTS.UpdateAllocatedLeave}/${assignLeaveTypeID}`, // This ensures the URL is "/api/.../update-allocation/2"
      payload
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.response?.data;
      if (typeof errorMessage === 'string' && errorMessage) {
        throw new Error(errorMessage);
      }
    }
    throw new Error("An error occurred while updating the allocation. Please check the console.");
  }
};