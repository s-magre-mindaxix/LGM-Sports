import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { InventoryItem, ScrapRecord, StockAdjustmentPayload, ScrapRequestPayload } from "./types";

export const getInventorySummary = async (typeFilter: string = "All"): Promise<InventoryItem[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Inventory}/summary?typeFilter=${typeFilter}`);
    return res.data;
};

export const getScrapHistory = async (): Promise<ScrapRecord[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Inventory}/scrap-history`);
    return res.data;
};

export const adjustStock = async (payload: StockAdjustmentPayload): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.Inventory}/adjust`, payload);
};

export const moveToScrap = async (payload: ScrapRequestPayload): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.Inventory}/scrap`, payload);
};

export const getTransactionHistory = async () => {
    const res = await apiClient.get(`${API_ENDPOINTS.Inventory}/transactions`);
    return res.data;
};