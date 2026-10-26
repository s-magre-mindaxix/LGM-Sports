import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { 
    ShipmentPaymentListDto, 
    ShipmentPaymentDetailsDto, 
    CreateShipmentPaymentDto, 
    UpdateShipmentPaymentDto, 
    EligibleTransitDto
} from "./types";

const ENDPOINT = API_ENDPOINTS.ShipmentPayment;

export const getShipmentPayments = async (): Promise<ShipmentPaymentListDto[]> => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
};

export const getShipmentPaymentById = async (id: number): Promise<ShipmentPaymentDetailsDto> => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
};

export const createShipmentPayment = async (data: CreateShipmentPaymentDto) => {
    return await apiClient.post(ENDPOINT, data);
};

export const updateShipmentPayment = async (data: UpdateShipmentPaymentDto) => {
    return await apiClient.put(ENDPOINT, data);
};

export const deleteShipmentPayment = async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const getEligibleTransits = async (): Promise<EligibleTransitDto[]> => {
    const res = await apiClient.get(`${ENDPOINT}/eligible-transits`);
    return res.data;
};