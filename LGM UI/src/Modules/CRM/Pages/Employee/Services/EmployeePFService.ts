// src/components/EmployeeMaster/Services/EmployeePFService.ts
import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface PFDetails {
  id: number;
  employeeID: number;
  pfDeductionPercentage: number;
  isCappedAt15k: boolean;
}

export const getPFDetailsByEmployeeId = async (
  employeeId: number
): Promise<PFDetails | null> => {
  try {
    const response = await apiClient.get<PFDetails>(
      `${API_ENDPOINTS.EmployeePFDetails}/${employeeId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    console.error(
      `Failed to fetch PF details for employee ${employeeId}:`,
      error
    );
    throw new Error("Could not fetch PF details.");
  }
};

export const upsertPFDetails = async (
  payload: Omit<PFDetails, "id">
): Promise<PFDetails> => {
  try {
    const response = await apiClient.post<PFDetails>(
      `${API_ENDPOINTS.EmployeePFDetails}/upsert`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to save PF details:", error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("An unexpected error occurred while saving PF details.");
  }
};
