import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ProductVersion } from "./types";


export const getProductVersions = async (): Promise<ProductVersion[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ProductVersion);
    return res.data;
};

export const saveProductVersion = (data: ProductVersion) => 
    data.id > 0 
    ? apiClient.put(`${API_ENDPOINTS.ProductVersion}/${data.id}`, data) 
    : apiClient.post(API_ENDPOINTS.ProductVersion, data);

export const deleteProductVersion = (id: number) => apiClient.delete(`${API_ENDPOINTS.ProductVersion}/${id}`);