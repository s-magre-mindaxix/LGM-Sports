import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { 
    DispatchDto, 
    CreateDispatchDto, 
    UpdateDispatchDto, 
    DispatchShipmentDropdownDto, 
    DispatchShipmentDetailsDto 
} from "./types";

const ENDPOINT = API_ENDPOINTS.Dispatch;

export const getDispatches = async (): Promise<DispatchDto[]> => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
};

export const getDispatchById = async (id: number): Promise<DispatchDto> => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
};

export const createDispatch = async (data: CreateDispatchDto) => {
    return await apiClient.post(ENDPOINT, data);
};

export const updateDispatch = async (data: UpdateDispatchDto) => {
    return await apiClient.put(ENDPOINT, data);
};

export const deleteDispatch = async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const getShipmentDropdown = async (): Promise<DispatchShipmentDropdownDto[]> => {
    const res = await apiClient.get(`${ENDPOINT}/shipment-dropdown`);
    return res.data;
};

export const getShipmentDetails = async (id: number): Promise<DispatchShipmentDetailsDto> => {
    const res = await apiClient.get(`${ENDPOINT}/shipment-details/${id}`);
    return res.data;
};