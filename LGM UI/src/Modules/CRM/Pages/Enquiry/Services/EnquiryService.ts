import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Enquiry, EnquiryListItem } from "./types";

export const getEnquiries = async (): Promise<EnquiryListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Enquiries);
    return res.data;
};

export const getEnquiryById = async (id: number): Promise<Enquiry> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Enquiries}/${id}`);
    return res.data;
};

export const saveEnquiry = async (data: Enquiry): Promise<void> => {
    if (data.enquiryId > 0) {
        await apiClient.put(`${API_ENDPOINTS.Enquiries}/${data.enquiryId}`, data);
    } else {
        await apiClient.post(API_ENDPOINTS.Enquiries, data);
    }
};

export const deleteEnquiry = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Enquiries}/${id}`);
};

export const getCustomerContacts = async (customerId: number) => {
    const res = await apiClient.get(`${API_ENDPOINTS.Enquiries}/customer-contacts/${customerId}`);
    return res.data;
};
