import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ShipmentMode } from "./types";

export const getShipmentModes = async (): Promise<ShipmentMode[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ShipmentMode);
    if (Array.isArray(res.data)) {
        return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    return [];
};

export const getShipmentModeById = async (id: number): Promise<ShipmentMode> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentMode}/${id}`);
    return res.data;
};

// The create DTO likely doesn't need the 'id'
type CreateShipmentModePayload = Omit<ShipmentMode, "id">;

export const createShipmentMode = async (data: CreateShipmentModePayload): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ShipmentMode, data);
};

// The update DTO requires the 'id'
export const updateShipmentMode = async (data: ShipmentMode): Promise<void> => {
    // The backend endpoint for PUT might not need the ID in the URL
    // but expects it in the body. Adjust if your API differs.
    await apiClient.put(API_ENDPOINTS.ShipmentMode, data);
};

export const deleteShipmentMode = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.ShipmentMode}/${id}`);
};