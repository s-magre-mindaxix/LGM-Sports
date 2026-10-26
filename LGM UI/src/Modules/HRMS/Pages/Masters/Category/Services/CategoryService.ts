import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { Category } from "./types";


export const getCategories = () => apiClient.get(API_ENDPOINTS.Category).then(res => res.data);
export const saveCategory = (data: Category) => 
    data.id > 0 ? apiClient.put(`${API_ENDPOINTS.Category}/${data.id}`, data) : apiClient.post(API_ENDPOINTS.Category, data);
export const deleteCategory = (id: number) => apiClient.delete(`${API_ENDPOINTS.Category}/${id}`);