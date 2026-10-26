
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { AccessoriesListItem } from "../../Accessories/Services/types";
import type { ServiceReport } from "./types";


const createServiceReportFormData = (data: ServiceReport & { filesToDelete?: string[] }): FormData => {
    const formData = new FormData();

    // Append standard fields
    if (data.id) formData.append('Id', data.id.toString());
    formData.append('Date', data.date);
    formData.append('CustomerId', data.customerId.toString());
    formData.append('OrderAcceptanceId', (data.orderAcceptanceId || 0).toString());
    // Ensure 0 or empty strings are handled for nullable backend fields
    formData.append('ProductId', data.productId ? data.productId.toString() : "0");
    formData.append('AccessoryId', data.accessoryId ? data.accessoryId.toString() : "0");
    
    formData.append('CustomerName', data.customerName || ""); 
    formData.append('ProductName', data.productName || "");
    formData.append('UploadedFiles', data.uploadedFiles || "");
    formData.append('SerialNumber', data.serialNumber || "");
    formData.append('InspectionSummary', data.inspectionSummary || "");
    formData.append('SoftwareCheck', data.softwareCheck || "");
    formData.append('PortTesting', data.portTesting || "");
    formData.append('FirmwareCheck', data.firmwareCheck || "");
    formData.append('PhysicalInspection', data.physicalInspection || "");
    formData.append('ICReplacement', data.icReplacement || "");
    formData.append('FinalComments', data.finalComments || "");
    formData.append("customerReported", data.customerReported ?? "");

    // --- FIX: APPEND DYNAMIC ITEMS TABLE ---
    if (data.items && data.items.length > 0) {
        data.items.forEach((item, index) => {
            formData.append(`Items[${index}].ItemType`, item.itemType);
            formData.append(`Items[${index}].ProductId`, (item.productId || 0).toString());
            formData.append(`Items[${index}].AccessoryId`, (item.accessoryId || 0).toString());
            formData.append(`Items[${index}].ServiceId`, (item.serviceId || 0).toString());
            formData.append(`Items[${index}].ServicePartNo`, item.servicePartNo || "");
            formData.append(`Items[${index}].Description`, item.description || "");
            formData.append(`Items[${index}].Quantity`, (item.quantity || 0).toString());
            formData.append(`Items[${index}].Rate`, (item.rate || 0).toString());
            formData.append(`Items[${index}].HsnSacCode`, item.hsnSacCode || "");
        formData.append(`Items[${index}].FinalPrice`, (item.finalPrice || 0).toString());
            formData.append(`Items[${index}].Discount`, (item.discount || 0).toString());
            formData.append(`Items[${index}].TaxPercentage`, (item.taxPercentage || 0).toString());
            formData.append(`Items[${index}].GstTax`, (item.gstTax || 0).toString());
        });
    }

    // Append new files
    if (data.reportFiles && data.reportFiles.length > 0) {
        for (const file of data.reportFiles) {
            formData.append('ReportFiles', file);
        }
    }
    
    // Handle files to delete (indexed format is safer for ASP.NET)
    if (data.filesToDelete && data.filesToDelete.length > 0) {
        data.filesToDelete.forEach((file, index) => {
            formData.append(`FilesToDelete[${index}]`, file);
        });
    }
    
    return formData;
};

export const getServiceReports = async (): Promise<ServiceReport[]> => {
    const response = await apiClient.get<ServiceReport[]>(API_ENDPOINTS.ServiceReport);
    return response.data;
};

export const getServiceReportById = async (id: number): Promise<ServiceReport> => {
    const response = await apiClient.get<ServiceReport>(`${API_ENDPOINTS.ServiceReport}/${id}`);
    return response.data;
};

export const createServiceReport = async (data: ServiceReport): Promise<ServiceReport> => {
    const formData = createServiceReportFormData(data);
    const response = await apiClient.post<ServiceReport>(API_ENDPOINTS.ServiceReport, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};


export const updateServiceReport = async (id: number, data: ServiceReport & { filesToDelete?: string[] }): Promise<void> => {
    const formData = createServiceReportFormData(data);
    await apiClient.put(`${API_ENDPOINTS.ServiceReport}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const deleteServiceReport = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.ServiceReport}/${id}`);
};


export const getAllCustomers = async (): Promise<{ id: number; customerName: string }[]> => {
   const response = await apiClient.get<{ id: number; customerName: string }[]>(API_ENDPOINTS.Customer);
   return response.data;
};

export const getAllProducts = async (): Promise<{ productId: number; productName:string }[]> => {
   const response = await apiClient.get<{ productId: number; productName: string }[]>(API_ENDPOINTS.Products);
   return response.data;
};
export const getAccessories = async (): Promise<AccessoriesListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Accessories);
    return res.data;
};


export const getOffersForServiceReport = async (): Promise<{ value: number; label: string }[]> => {
    // Make sure you have an endpoint like 'Offers' in your apiConfig that returns { value, label }
    const response = await apiClient.get<{ value: number; label: string }[]>(API_ENDPOINTS.Offers); 
    return response.data;
};


export const getOfferDetailsForReport = async (offerId: number): Promise<ServiceReport> => {
    // Make sure you have an endpoint like 'OfferReport' in your apiConfig
    const response = await apiClient.get<ServiceReport>(`${API_ENDPOINTS.Offers}/${offerId}`);
    return response.data;
};

