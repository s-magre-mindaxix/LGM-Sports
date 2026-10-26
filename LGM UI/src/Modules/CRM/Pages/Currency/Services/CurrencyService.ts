import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Currency } from "./types";


export const getCurrencies = async (): Promise<Currency[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Currency);
    return res.data;
};

export const saveCurrency = (data: Currency) => 
    data.id > 0 
    ? apiClient.put(`${API_ENDPOINTS.Currency}/${data.id}`, data) 
    : apiClient.post(API_ENDPOINTS.Currency, data);

export const deleteCurrency = (id: number) => apiClient.delete(`${API_ENDPOINTS.Currency}/${id}`);