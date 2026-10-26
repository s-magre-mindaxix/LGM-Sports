import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ServiceMaster } from "./types";

const URL = API_ENDPOINTS.BaseUrl + "/ServiceMaster";

export const getServices = async (): Promise<ServiceMaster[]> => {
    const res = await apiClient.get(URL);
    return res.data;
};

export const getServiceById = async (id: number): Promise<ServiceMaster> => {
    const res = await apiClient.get(`${URL}/${id}`);
    return res.data;
};

export const saveService = async (data: ServiceMaster): Promise<void> => {
    if (data.serviceId > 0) {
        await apiClient.put(URL, data);
    } else {
        await apiClient.post(URL, data);
    }
};

export const deleteService = async (id: number): Promise<void> => {
    await apiClient.delete(`${URL}/${id}`);
};