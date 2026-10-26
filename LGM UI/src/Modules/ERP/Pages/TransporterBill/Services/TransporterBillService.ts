import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { TransporterBillListDto, TransporterBillDetailsDto, CreateTransporterBillDto, EligibleShipmentDto } from "./types";

const ENDPOINT = API_ENDPOINTS.TransporterBill;

export const getTransporterBills = async (): Promise<TransporterBillListDto[]> => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
};

export const getTransporterBillById = async (id: number): Promise<TransporterBillDetailsDto> => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
};

export const createTransporterBill = async (data: CreateTransporterBillDto) => {
    return await apiClient.post(ENDPOINT, data);
};

export const updateTransporterBill = async (data: any) => {
    return await apiClient.put(ENDPOINT, data);
};

export const deleteTransporterBill = async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const getEligibleTransporterShipments = async (): Promise<EligibleShipmentDto[]> => {
    const res = await apiClient.get(`${ENDPOINT}/eligible-shipments`);
    return res.data;
};