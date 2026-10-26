
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { AgencyType } from "./types";

export const getAgencyTypes = async (): Promise<AgencyType[]> => {
    const res = await apiClient.get(API_ENDPOINTS.AgencyType);
    // Handle cases where the data is nested under a 'data' property
    if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    if (Array.isArray(res.data)) {
        return res.data;
    }
    return [];
};

export const getAgencyTypeById = async (id: number): Promise<AgencyType> => {
    const res = await apiClient.get(`${API_ENDPOINTS.AgencyType}/${id}`);
    return res.data;
};

// Based on C# DTOs, the payload for create won't include 'id'
type CreateAgencyTypePayload = Omit<AgencyType, "id">;

export const createAgencyType = async (data: CreateAgencyTypePayload): Promise<any> => {
    const res = await apiClient.post(API_ENDPOINTS.AgencyType, data);
    return res.data; // Return the response which includes the created object
};

// The update payload will include 'id'
type UpdateAgencyTypePayload = AgencyType;

export const updateAgencyType = async (data: UpdateAgencyTypePayload): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.AgencyType, data);
};

export const deleteAgencyType = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.AgencyType}/${id}`);
};
