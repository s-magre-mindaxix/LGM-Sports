import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { QAStatusUpdatePayload, QualityAssurance } from "./types";


// 1. Get Pending Items
export const getPendingQA = async (): Promise<QualityAssurance[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.QA}/pending`);
    return res.data;
};

// 2. Get Processed History
export const getQAHistory = async (): Promise<QualityAssurance[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.QA}/history`);
    return res.data;
};

// 3. Update Status (FIXED NAME HERE)
export const updateQAStatus = async (payload: QAStatusUpdatePayload): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.QA}/update-status`, payload);
};