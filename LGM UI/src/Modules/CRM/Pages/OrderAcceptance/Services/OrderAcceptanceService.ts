

import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { OrderAcceptance, OAListItem } from "./types";

const URL = API_ENDPOINTS.BaseUrl + "/OrderAcceptance";

export const getOAs = async (): Promise<OAListItem[]> => {
    const res = await apiClient.get(URL);
    return res.data;
};

export const getOAById = async (id: number): Promise<OrderAcceptance> => {
    const res = await apiClient.get(`${URL}/${id}`);
    return res.data;
};

export const getNextOANumber = async () => {
    const res = await apiClient.get(`${URL}/next-number`);
    return res.data.number;
};

// MODIFIED: This now expects an array of { value, label, currencyId } from the backend.
export const getFinalOffers = async () => {
    const res = await apiClient.get(`${URL}/final-offers`);
    return res.data;
};

// ADDED: New function to get aggregated data from multiple offer IDs.
export const getAggregatedOfferData = async (offerIds: number[]): Promise<OrderAcceptance> => {
    // We use a POST request to send the array of IDs in the request body.
    const res = await apiClient.post(`${URL}/aggregated-offer-data`, offerIds);
    return res.data;
};

export const saveOA = async (data: OrderAcceptance): Promise<void> => {
    if (data.orderAcceptanceId > 0) {
        await apiClient.put(`${URL}/${data.orderAcceptanceId}`, data);
    } else {
        await apiClient.post(URL, data);
    }
};

export const deleteOA = async (id: number): Promise<void> => {
    await apiClient.delete(`${URL}/${id}`);
};


export const getFinalServiceOffers = async () => {
    const res = await apiClient.get(`${URL}/final-service-offers`);
    return res.data;
};