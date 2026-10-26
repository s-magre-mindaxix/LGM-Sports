import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { CHABillListDto, CHABillDetailsDto, CreateCHABillDto, EligibleShipmentDto } from "./types";

const ENDPOINT = API_ENDPOINTS.CHABill;

export const getCHABills = async (): Promise<CHABillListDto[]> => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
};

export const getCHABillById = async (id: number): Promise<CHABillDetailsDto> => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
};

export const createCHABill = async (data: CreateCHABillDto) => {
    return await apiClient.post(ENDPOINT, data);
};

export const updateCHABill = async (data: any) => {
    return await apiClient.put(ENDPOINT, data);
};

export const deleteCHABill = async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const getEligibleCHAShipments = async (): Promise<EligibleShipmentDto[]> => {
    const res = await apiClient.get(`${ENDPOINT}/eligible-shipments`);
    return res.data;
};