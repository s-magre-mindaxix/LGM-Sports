import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ProductGroup } from "./types";


export const getProductGroups = () => apiClient.get(API_ENDPOINTS.ProductGroup).then(res => res.data);
export const saveProductGroup = (data: ProductGroup) => 
    data.id > 0 
    ? apiClient.put(`${API_ENDPOINTS.ProductGroup}/${data.id}`, data) 
    : apiClient.post(API_ENDPOINTS.ProductGroup, data);
export const deleteProductGroup = (id: number) => apiClient.delete(`${API_ENDPOINTS.ProductGroup}/${id}`);