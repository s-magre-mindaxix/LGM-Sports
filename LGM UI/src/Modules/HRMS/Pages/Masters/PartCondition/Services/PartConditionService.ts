import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { PartCondition } from "./types";
export const getPartConditions = async (): Promise<PartCondition[]> => {
    const res = await apiClient.get(API_ENDPOINTS.PartCondition);
    return res.data;
};

export const savePartCondition = (data: PartCondition) => 
    data.id > 0 
    ? apiClient.put(`${API_ENDPOINTS.PartCondition}/${data.id}`, data) 
    : apiClient.post(API_ENDPOINTS.PartCondition, data);

export const deletePartCondition = (id: number) => apiClient.delete(`${API_ENDPOINTS.PartCondition}/${id}`);