import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { 
    DebitNoteDto, 
    DebitNoteListDto, 
    CreateDebitNoteDto, 
    InvoiceDropdownDto 
} from "./types";

const BASE_URL = API_ENDPOINTS.DebitNote;

export const getInvoiceDropdown = async (): Promise<InvoiceDropdownDto[]> => {
    const res = await apiClient.get(`${BASE_URL}/GetInvoiceDropdown`);
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

export const getInvoiceForDebitNote = async (invoiceId: number): Promise<DebitNoteDto> => {
    const res = await apiClient.get(`${BASE_URL}/GetInvoiceForDebitNote/${invoiceId}`);
    return res.data?.data || res.data;
};

export const getAllDebitNotes = async (): Promise<DebitNoteListDto[]> => {
    const res = await apiClient.get(`${BASE_URL}/GetAll`);
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

export const getDebitNoteById = async (id: number): Promise<DebitNoteDto> => {
    const res = await apiClient.get(`${BASE_URL}/GetById/${id}`);
    return res.data?.data || res.data;
};

export const createDebitNote = async (dto: CreateDebitNoteDto) => {
    const res = await apiClient.post(`${BASE_URL}/Create`, dto);
    return res.data;
};

export const updateDebitNote = async (id: number, dto: CreateDebitNoteDto) => {
    const res = await apiClient.put(`${BASE_URL}/Update/${id}`, dto);
    return res.data;
};

export const deleteDebitNote = async (id: number) => {
    const res = await apiClient.delete(`${BASE_URL}/Delete/${id}`);
    return res.data;
};

export const getDebitNotePdfData = async (id: number): Promise<any> => {
    const res = await apiClient.get(`${BASE_URL}/GetDebitNotePdf/${id}`);
    return res.data?.data || res.data;
};


export const downloadDebitNoteExcel = async (id: number, fileName: string) => {
    const res = await apiClient.get(`${BASE_URL}/DownloadExcel/${id}`, {
        responseType: 'blob', // Important for binary data
    });
    
    // Create a hidden link to trigger the download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); 
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};


export const getLastDebitNoteNo = async (): Promise<string> => {
    const res = await apiClient.get(`${BASE_URL}/GetLastDebitNoteNo`);
    return res.data;
};