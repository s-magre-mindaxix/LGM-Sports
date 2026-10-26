import type {
    CreditNoteDto,
    CreditNoteListDto,
    CreateCreditNoteDto,
    InvoiceDropdownDto
} from "./types";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

// Use the endpoint defined in your apiConfig
const BASE_URL = API_ENDPOINTS.CreditNote; 

export const getInvoiceDropdown = async (): Promise<InvoiceDropdownDto[]> => {
    const res = await apiClient.get(`${BASE_URL}/GetInvoiceDropdown`);
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

export const getInvoiceForCreditNote = async (invoiceId: number): Promise<CreditNoteDto> => {
    const res = await apiClient.get(`${BASE_URL}/GetInvoiceForCreditNote/${invoiceId}`);
    return res.data?.data || res.data;
};

export const getAllCreditNotes = async (): Promise<CreditNoteListDto[]> => {
    const res = await apiClient.get(`${BASE_URL}/GetAll`);
    // This fix prevents the "data.filter is not a function" error
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

export const getCreditNoteById = async (id: number): Promise<CreditNoteDto> => {
    const res = await apiClient.get(`${BASE_URL}/GetById/${id}`);
    return res.data?.data || res.data;
};

export const createCreditNote = async (dto: CreateCreditNoteDto) => {
    const res = await apiClient.post(`${BASE_URL}/Create`, dto);
    return res.data;
};

export const updateCreditNote = async (id: number, dto: CreateCreditNoteDto) => {
    const res = await apiClient.put(`${BASE_URL}/Update/${id}`, dto);
    return res.data;
};

export const deleteCreditNote = async (id: number) => {
    const res = await apiClient.delete(`${BASE_URL}/Delete/${id}`);
    return res.data;
};

export const getFullInvoiceDetails = async (id: number) => {
    const res = await apiClient.get(`${API_ENDPOINTS.Invoice}/${id}`); // Use your existing Invoice GetById
    return res.data;
};

export const downloadCreditNoteExcel = async (id: number) => {
    const response = await apiClient.get(
        `${BASE_URL}/download-excel/${id}`,
        {
            responseType: "blob",
        }
    );

    const blob = new Blob(
        [response.data],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CreditNote_${id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const getCreditNotePdfData = async (id: number): Promise<any> => {
    const res = await apiClient.get(`${BASE_URL}/pdf/${id}`);
    return res.data?.data || res.data;
};

export const getLastCreditNoteNo = async (): Promise<string> => {
    const res = await apiClient.get(
        `${BASE_URL}/GetLastCreditNoteNo`
    );

    return res.data;
};
