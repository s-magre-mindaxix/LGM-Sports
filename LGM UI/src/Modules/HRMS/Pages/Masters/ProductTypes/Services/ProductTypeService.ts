import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ProductType } from "./types";

export const getProductTypes = () => apiClient.get(API_ENDPOINTS.ProductType).then(res => res.data);
export const saveProductType = (data: ProductType) => 
    data.id > 0 
    ? apiClient.put(`${API_ENDPOINTS.ProductType}/${data.id}`, data) 
    : apiClient.post(API_ENDPOINTS.ProductType, data);
export const deleteProductType = (id: number) => apiClient.delete(`${API_ENDPOINTS.ProductType}/${id}`);