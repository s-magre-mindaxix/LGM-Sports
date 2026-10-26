import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { CompanyGroup } from "./types";

export const getCompanyGroups = async (): Promise<CompanyGroup[]> => {
    const res = await apiClient.get(API_ENDPOINTS.CompanyGroup);
    return res.data;
};

export const getCompanyGroupById = async (id: number): Promise<CompanyGroup> => {
    const res = await apiClient.get(`${API_ENDPOINTS.CompanyGroup}/${id}`);
    return res.data;
};

export const createCompanyGroup = async (data: CompanyGroup): Promise<CompanyGroup> => {
    const res = await apiClient.post(API_ENDPOINTS.CompanyGroup, data);
    return res.data; 
};

export const updateCompanyGroup = async (id: number, data: CompanyGroup): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.CompanyGroup}/${id}`, data);
};

export const deleteCompanyGroup = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.CompanyGroup}/${id}`);
};