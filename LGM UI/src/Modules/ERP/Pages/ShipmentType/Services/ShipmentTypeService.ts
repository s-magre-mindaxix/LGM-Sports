// /Masters/ShipmentType/Services/ShipmentTypeService.ts

import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ShipmentType } from "./types";

export const getShipmentTypes = async (): Promise<ShipmentType[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ShipmentType);
    if (Array.isArray(res.data)) {
        return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    return [];
};

export const getShipmentTypeById = async (id: number): Promise<ShipmentType> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentType}/${id}`);
    return res.data;
};

// Based on your DTOs, the payload for create won't include 'id'
type CreateShipmentTypePayload = Omit<ShipmentType, "id" | "shipmentMode">;

export const createShipmentType = async (data: CreateShipmentTypePayload): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ShipmentType, data);
};

// The update payload will include 'id'
type UpdateShipmentTypePayload = Omit<ShipmentType, "shipmentMode">;

export const updateShipmentType = async (data: UpdateShipmentTypePayload): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.ShipmentType, data);
};

export const deleteShipmentType = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.ShipmentType}/${id}`);
};