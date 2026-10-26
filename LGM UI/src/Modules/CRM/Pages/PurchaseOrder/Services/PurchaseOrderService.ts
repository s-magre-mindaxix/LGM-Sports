import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { PurchaseOrder, POListItem,PurchaseOrderPdfData  } from "./types";

const URL = API_ENDPOINTS.BaseUrl + "/PurchaseOrder";

export const getPOs = async (): Promise<POListItem[]> => {
    const res = await apiClient.get(URL);
    return res.data;
};

export const getPOById = async (id: number): Promise<PurchaseOrder> => {
    const res = await apiClient.get(`${URL}/${id}`);
    return res.data;
};

// This matches the import in your Wizard
export const getNextPONumber = async () => {
    const res = await apiClient.get(`${URL}/next-number`);
    return res.data.number;
};

// This matches the import in your Wizard
export const getFinalOAs = async () => {
    const res = await apiClient.get(`${URL}/final-oas`);
    return res.data;
};

export const savePO = async (data: PurchaseOrder): Promise<void> => {
    if (data.purchaseOrderId > 0) {
        await apiClient.put(`${URL}/${data.purchaseOrderId}`, data);
    } else {
        await apiClient.post(URL, data);
    }
};

export const deletePO = async (id: number): Promise<void> => {
    await apiClient.delete(`${URL}/${id}`);
};

export const getPOPdfData = async (id: number): Promise<PurchaseOrderPdfData> => {
    const res = await apiClient.get(`${URL}/pdf/${id}`);
    return res.data;
};

export const getDataForPOFromOAs = async (oaIds: number[]): Promise<PurchaseOrder> => {
    const res = await apiClient.post(`${URL}/data-from-oas`, oaIds);
    return res.data;
};


export const getFinalServiceOAs = async () => {
    const res = await apiClient.get(`${URL}/final-service-oas`);
    return res.data;
};