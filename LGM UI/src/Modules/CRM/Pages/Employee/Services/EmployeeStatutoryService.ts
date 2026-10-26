// src/components/EmployeeMaster/EmployeeStatutoryService.ts
import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface StatutoryDetails {
  id: number;
  aadhaarNumber: string;
  panNumber: string;
  uanNo?: string;
  pfNo?: string;
  esiNo?: string;
  employeeID: number;
  isDeleted: boolean;
}

export interface UpdateStatutoryPayload {
  aadhaarNumber: string;
  panNumber: string;
  uanNo?: string;
  pfNo?: string;
  esiNo?: string;
}

export const getStatutoryDetailsByEmployeeId = async (
  employeeId: number
): Promise<StatutoryDetails | null> => {
  try {
    const response = await apiClient.get<StatutoryDetails>(
      `${API_ENDPOINTS.EmployeeStatutoryDetails}/by-employee/${employeeId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null; 
    }
    console.error(
      `Failed to fetch statutory details for employee ${employeeId}:`,
      error
    );
    throw new Error("Could not fetch statutory details.");
  }
};

export const updateStatutoryDetails = async (
  employeeId: number,
  payload: UpdateStatutoryPayload
): Promise<StatutoryDetails> => {
  try {
    const response = await apiClient.put<StatutoryDetails>(
      `${API_ENDPOINTS.EmployeeStatutoryDetails}/by-employee/${employeeId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update statutory details for employee ${employeeId}:`,
      error
    );
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "An unexpected error occurred while updating statutory details."
    );
  }
};
