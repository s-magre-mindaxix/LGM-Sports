import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface BankDetails {
  id: number;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  employeeID: number;
}

interface BankDetailsResponse {
  employee: object;
  bankDetails: BankDetails | null;
}

export const getBankDetailsByEmployeeId = async (
  employeeId: number
): Promise<BankDetails | null> => {
  try {
    const response = await apiClient.get<BankDetailsResponse>(
      `${API_ENDPOINTS.EmployeeBankDetails}/${employeeId}`
    );
    return response.data.bankDetails;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    console.error(
      `Failed to fetch bank details for employee ${employeeId}:`,
      error
    );
    throw new Error("Could not fetch bank details.");
  }
};

export const createBankDetails = async (
  payload: Omit<BankDetails, "id">
): Promise<BankDetails> => {
  try {
    const response = await apiClient.post<BankDetails>(
      API_ENDPOINTS.EmployeeBankDetails,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create bank details:", error);
    throw new Error("Failed to create bank details.");
  }
};

export const updateBankDetails = async (
  id: number,
  payload: Omit<BankDetails, "id" | "employeeID">
): Promise<BankDetails> => {
  try {
    const response = await apiClient.put<BankDetails>(
      `${API_ENDPOINTS.EmployeeBankDetails}/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update bank details ${id}:`, error);
    throw new Error("Failed to update bank details.");
  }
};
