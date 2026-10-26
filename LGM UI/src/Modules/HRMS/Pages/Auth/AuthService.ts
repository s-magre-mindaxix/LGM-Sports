import { AxiosError } from "axios";
import type { Permission } from "../Masters/AccessControl/AccessControlService";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  email: string;
  role: string;
  workLocationID: number;
  departmentID: number;
  employeeId: number;
  designationID: number;
  employeeStatus: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions: Permission[];
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface ApiResponse {
  message: string;
}

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.Login,
      credentials
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Invalid email or password."
    );
  }
};

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.ForgotPassword,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || "An error occurred.");
  }
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.ResetPassword,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Password reset failed."
    );
  }
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.ChangePassword,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to change password."
    );
  }
};
