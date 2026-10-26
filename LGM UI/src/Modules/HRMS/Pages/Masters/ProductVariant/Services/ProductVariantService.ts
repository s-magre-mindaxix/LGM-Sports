import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ProductVariant } from "./types";


export const getProductVariants = () => apiClient.get(API_ENDPOINTS.ProductVariant).then(res => res.data);
export const saveProductVariant = (data: ProductVariant) => 
    data.id > 0 
    ? apiClient.put(`${API_ENDPOINTS.ProductVariant}/${data.id}`, data) 
    : apiClient.post(API_ENDPOINTS.ProductVariant, data);
    
export const deleteProductVariant = (id: number) => apiClient.delete(`${API_ENDPOINTS.ProductVariant}/${id}`);