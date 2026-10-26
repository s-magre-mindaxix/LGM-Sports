import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ShipmentUnderTransitListDto, ShipmentUnderTransitDetailsDto, CreateShipmentUnderTransitDto } from "./types";

const ENDPOINT = API_ENDPOINTS.ShipmentUnderTransit; // Ensure this is defined in your config

export const getTransits = async (): Promise<ShipmentUnderTransitListDto[]> => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
};

export const getTransitById = async (id: number): Promise<ShipmentUnderTransitDetailsDto> => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
};

export const createTransit = async (data: CreateShipmentUnderTransitDto) => {
    return await apiClient.post(ENDPOINT, data);
};

export const updateTransit = async (data: any) => {
    return await apiClient.put(ENDPOINT, data);
};

export const closeTransit = async (id: number) => {
    return await apiClient.put(`${ENDPOINT}/close/${id}`);
};

export const deleteTransit = async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const getOpenShipments = async (): Promise<any[]> => {
    const res = await apiClient.get(`${ENDPOINT}/shipment-dropdown`);
    return res.data;
};

export const addToInventory = async (id: number) => {
    return await apiClient.post(`${API_ENDPOINTS.ShipmentUnderTransit}/add-to-inventory/${id}`
    );
};