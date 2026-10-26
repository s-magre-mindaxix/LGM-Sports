import { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";

export interface LeaveType {
  id: number;
  leaveTypeName: string;
}

export interface LeaveBalance {
  leaveTypeName: string;
  allocatedDays: number;
  availedDays: number;
  balanceDays: number;
}

export interface LeaveApplication {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  days: number; 
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
}

export interface NewLeaveRequestPayload {
  employeeID: number;
  leaveTypeID: number;
  fromDate: string;
  toDate: string;
  reason: string;
  isHalfDay: boolean;
  halfDayPeriod: string | null;
}

export interface EmployeeBalanceReport {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  balances: LeaveBalance[];
}

export interface UpdateStatusPayload {
  status: "Approved" | "Rejected";
  approvedByEmployeeId: number;
}

export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  try {
    const response = await apiClient.get<LeaveType[]>(API_ENDPOINTS.LeaveTypes);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leave types:", error);
    throw new Error("Could not fetch leave types.");
  }
};

export const getLeaveBalance = async (
  employeeId: number,
  year: number
): Promise<LeaveBalance[]> => {
  try {
    const response = await apiClient.get<LeaveBalance[]>(
      `${API_ENDPOINTS.LeaveBalance}/${employeeId}?year=${year}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leave balance:", error);
    throw new Error("Could not fetch leave balance.");
  }
};

export const getPendingApprovals = async (
  managerId: number
): Promise<LeaveApplication[]> => {
  try {
    const response = await apiClient.get<LeaveApplication[]>(
      `${API_ENDPOINTS.PendingApprovals}/${managerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pending approvals:", error);
    throw new Error("Could not fetch pending leave applications.");
  }
};

export const applyForLeave = async (
  payload: NewLeaveRequestPayload
): Promise<LeaveApplication> => {
  try {
    const response = await apiClient.post<LeaveApplication>(
      API_ENDPOINTS.ApplyLeave,
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error("An unexpected error occurred while applying for leave.");
  }
};

export const updateLeaveStatus = async (
  leaveRequestId: number,
  payload: UpdateStatusPayload
): Promise<LeaveApplication> => {
  try {
    const response = await apiClient.put<LeaveApplication>(
      `${API_ENDPOINTS.UpdateLeaveStatus}/${leaveRequestId}`,
      payload
    );
    return response.data;
  } catch  {
    throw new Error("Failed to update leave status.");
  }
};

export const getLeaveHistory = async (
  employeeId: number
): Promise<LeaveApplication[]> => {
  try {
    const response = await apiClient.get<LeaveApplication[]>(
      `${API_ENDPOINTS.LeaveHistory}/${employeeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leave history:", error);
    throw new Error("Could not fetch leave history.");
  }
};

export const getFilteredTeamLeaveHistory = async (
  managerId: number
): Promise<LeaveApplication[]> => {
  try {
    const response = await apiClient.get<LeaveApplication[]>(
      `${API_ENDPOINTS.GetTeamLeaveHistory}/${managerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch filtered team leave history:", error);
    throw new Error("Could not fetch the team's leave history.");
  }
};

export const getAllEmployeesBalances = async (
  year: number
): Promise<EmployeeBalanceReport[]> => {
  try {
    const response = await apiClient.get<EmployeeBalanceReport[]>(
      API_ENDPOINTS.GetAllEmployeesBalances,
      {
        params: { year },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch all employee balances:", error);
    throw new Error("Could not fetch the master balance report.");
  }
};
