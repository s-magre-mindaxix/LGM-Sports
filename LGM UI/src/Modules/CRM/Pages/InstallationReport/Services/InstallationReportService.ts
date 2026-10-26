import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { InstallationReport } from "./types";

export const getInstallationReports = async (): Promise<InstallationReport[]> => {
    const response = await apiClient.get<InstallationReport[]>(API_ENDPOINTS.InstallationReports);
    return response.data;
};


export const getInstallationReportById = async (id: number): Promise<InstallationReport> => {
    const response = await apiClient.get<InstallationReport>(`${API_ENDPOINTS.InstallationReports}/${id}`);
    return response.data;
};


export const createInstallationReport = async (data: InstallationReport): Promise<InstallationReport> => {
    const response = await apiClient.post<InstallationReport>(API_ENDPOINTS.InstallationReports, data);
    return response.data;
};


export const updateInstallationReport = async (id: number, data: InstallationReport): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.InstallationReports}/${id}`, data);
};


export const deleteInstallationReport = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.InstallationReports}/${id}`);
};


export const getAllCompanies = async (): Promise<{ id: number; companyName: string }[]> => {
   const response = await apiClient.get<{ id: number; companyName: string }[]>(API_ENDPOINTS.Company);
   return response.data;
};

export const getAllCustomers = async (): Promise<{ id: number; customerName: string }[]> => {
   const response = await apiClient.get<{ id: number; customerName: string }[]>(API_ENDPOINTS.Customer);
   return response.data;
};