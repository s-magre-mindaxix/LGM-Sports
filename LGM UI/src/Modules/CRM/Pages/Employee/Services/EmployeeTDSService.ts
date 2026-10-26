import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface TDSDetails {
  id: number;
  employeeID: number;
  tdsAmount: number;
}

export const getTDSDetailsByEmployeeId = async (
  employeeId: number
): Promise<TDSDetails | null> => {
  try {
    const response = await apiClient.get<TDSDetails>(
      `${API_ENDPOINTS.EmployeeTDSDetails}/${employeeId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    console.error(
      `Failed to fetch TDS details for employee ${employeeId}:`,
      error
    );
    throw new Error("Could not fetch TDS details.");
  }
};

export const upsertTDSDetails = async (
  payload: Omit<TDSDetails, "id">
): Promise<TDSDetails> => {
  try {
    const response = await apiClient.post<TDSDetails>(
      `${API_ENDPOINTS.EmployeeTDSDetails}/upsert`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to save TDS details:", error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("An unexpected error occurred while saving TDS details.");
  }
};