import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ForwarderBillListDto, ForwarderBillDetailsDto, CreateForwarderBillDto } from "./types";

const ENDPOINT = API_ENDPOINTS.ForwarderBill;

export const getForwarderBills = async (): Promise<ForwarderBillListDto[]> => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
};

export const getForwarderBillById = async (id: number): Promise<ForwarderBillDetailsDto> => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
};

export const createForwarderBill = async (data: CreateForwarderBillDto) => {
    return await apiClient.post(ENDPOINT, data);
};

export const updateForwarderBill = async (data: any) => {
    return await apiClient.put(ENDPOINT, data);
};

export const deleteForwarderBill = async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
};

// This endpoint should return shipments that have agencies assigned but no bill yet
export const getEligibleShipments = async (): Promise<any[]> => {
    const res = await apiClient.get(`${ENDPOINT}/eligible-shipments`);
    return res.data;
};