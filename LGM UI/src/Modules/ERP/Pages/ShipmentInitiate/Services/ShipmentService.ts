import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { 
    ShipmentInitiate, 
    ShipmentDropdown, 
    ShipmentAutoFill, 
    ShipmentMode, 
    ShipmentType 
} from "./types";

export const getShipments = async (): Promise<ShipmentInitiate[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ShipmentInitiate);
    return Array.isArray(res.data) ? res.data : (res.data.data || []);
};

export const getShipmentById = async (id: number): Promise<ShipmentInitiate> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentInitiate}/${id}`);
    return res.data;
};

export const createShipment = async (data: ShipmentInitiate) => {
    return await apiClient.post(API_ENDPOINTS.ShipmentInitiate, data);
};

export const updateShipment = async (data: ShipmentInitiate) => {
    return await apiClient.put(API_ENDPOINTS.ShipmentInitiate, data);
};

export const deleteShipment = async (id: number) => {
    await apiClient.delete(`${API_ENDPOINTS.ShipmentInitiate}/${id}`);
};

export const getNextShipmentNo = async (): Promise<string> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentInitiate}/next-shipment-no`);
    return res.data;
};

// --- NEW: Dynamic Dropdown Services ---
export const getShipmentModes = async (): Promise<ShipmentMode[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ShipmentMode);
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
};

export const getShipmentTypes = async (): Promise<ShipmentType[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ShipmentType);
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
};

// --- Source Selection Services ---
export const getOADropdown = async (): Promise<ShipmentDropdown[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentInitiate}/oa-dropdown`);
    return res.data;
};

export const getPODropdown = async (): Promise<ShipmentDropdown[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentInitiate}/po-dropdown`);
    return res.data;
};

export const getOADetails = async (id: number): Promise<ShipmentAutoFill> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentInitiate}/oa-details/${id}`);
    return res.data;
};

export const getPODetails = async (id: number): Promise<ShipmentAutoFill> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentInitiate}/po-details/${id}`);
    return res.data;
};