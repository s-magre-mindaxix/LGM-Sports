import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Offer, OfferListItem } from "./types";

// Helper to prevent 'undefined' URL errors
const getOffersUrl = () => {
    if (!API_ENDPOINTS.Offers) {
        console.error("CRITICAL ERROR: API_ENDPOINTS.Offers is undefined! Please check apiConfig.ts");
        return "https://localhost:44363/api/Offers"; // Hardcoded fallback for testing
    }
    return API_ENDPOINTS.Offers;
};

export const getOffers = async (): Promise<OfferListItem[]> => {
    const res = await apiClient.get(getOffersUrl());
    return res.data;
};

export const getOfferById = async (id: number): Promise<Offer> => {
    const res = await apiClient.get(`${getOffersUrl()}/${id}`);
    return res.data;
};

export const saveOffer = async (data: Offer): Promise<void> => {
    const url = data.offerId > 0 ? `${getOffersUrl()}/${data.offerId}` : getOffersUrl();
    await apiClient[data.offerId > 0 ? 'put' : 'post'](url, data);
};

export const deleteOffer = async (id: number): Promise<void> => {
    await apiClient.delete(`${getOffersUrl()}/${id}`);
};

export const getFinalEnquiries = async () => {
    try {
        const res = await apiClient.get(`${getOffersUrl()}/final-enquiries`);
        return Array.isArray(res.data) ? res.data : []; 
    } catch (error) {
        console.error("Error fetching final enquiries", error);
        return [];
    }
};

export const getFinalServices = async (): Promise<any[]> => {
    try {
        const res = await apiClient.get(`${getOffersUrl()}/final-services`);
        // Ensure we always return an array even if the API fails
        return Array.isArray(res.data) ? res.data : []; 
    } catch (error) {
        console.error("Error fetching final services", error);
        return [];
    }
};