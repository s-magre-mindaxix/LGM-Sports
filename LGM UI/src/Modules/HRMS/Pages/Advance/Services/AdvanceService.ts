
import { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";

// Advance chi list dakhvanyasathi
export interface Advance {
  id: number;
  employeeID: number;
  employeeName: string;
  amount: number;
  requestDate: string;
  reason: string;
  status: string;
  totalRepaid: number;
  balance: number;
}

// Navin advance create kartana lagnara data
export interface AdvanceCreatePayload {
  employeeID: number;
  amount: number;
  requestDate: string; // ISO string format: "YYYY-MM-DD"
  reason: string;
}

// Paratphed (Repayment) add kartana lagnara data
export interface AdvanceRepaymentPayload {
  repaymentAmount: number;
  repaymentDate: string; // ISO string format: "YYYY-MM-DD"
  notes: string;
  createdByEmployeeId: number;
}

// Paratphedicha itihas (History) dakhvanyasathi
export interface AdvanceRepaymentView {
  repaymentAmount: number;
  repaymentDate: string;
  notes: string;
  createdByName: string;
}

export interface AdvanceHistory {
  advanceId: number;
  employeeName: string;
  originalAmount: number;
  requestDate: string;
  reason: string;
  totalRepaid: number;
  balance: number;
  repayments: AdvanceRepaymentView[];
}

// === API FUNCTIONS ===

export const getAllAdvances = async (): Promise<Advance[]> => {
  const response = await apiClient.get<Advance[]>(API_ENDPOINTS.Advances);
  return response.data;
};

export const createAdvance = async (payload: AdvanceCreatePayload): Promise<Advance> => {
  try {
    const response = await apiClient.post<Advance>(API_ENDPOINTS.Advances, payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to create advance record.");
  }
};

export const deleteAdvance = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${API_ENDPOINTS.Advances}/${id}`);
    } catch  {
        throw new Error("Failed to delete the advance record.");
    }
};

export const addRepayment = async (advanceId: number, payload: AdvanceRepaymentPayload): Promise<void> => {
  try {
    // URL ithe banavla ahe.
    await apiClient.post(`${API_ENDPOINTS.Advances}/${advanceId}/repayment`, payload);
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to add repayment.");
  }
};

export const getAdvanceHistory = async (advanceId: number): Promise<AdvanceHistory> => {
    // URL ithe banavla ahe.
    const response = await apiClient.get<AdvanceHistory>(`${API_ENDPOINTS.Advances}/${advanceId}/history`);
    return response.data;
};