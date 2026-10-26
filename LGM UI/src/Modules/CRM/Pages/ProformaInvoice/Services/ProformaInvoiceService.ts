
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { SelectOption } from "../../Company/Tabs/useAddressDropdowns";
import type { ProformaInvoice, ProformaInvoiceListItem, ProformaInvoicePdfData,ProformaInvoiceFromApi, DummyInvoice } from "./types";

const getProformaInvoicesUrl = () => {
    if (!API_ENDPOINTS.ProformaInvoices) {
        throw new Error("API endpoint for ProformaInvoices is not configured.");
    }
    return API_ENDPOINTS.ProformaInvoices;
};


export const getProformaInvoices = async (): Promise<ProformaInvoiceListItem[]> => {
    const res = await apiClient.get(getProformaInvoicesUrl());
    return res.data;
};


export const getProformaInvoiceById = async (id: number): Promise<ProformaInvoice> => {
    const res = await apiClient.get(`${getProformaInvoicesUrl()}/${id}`);
    return res.data;
};


export const saveProformaInvoice = async (data: ProformaInvoice): Promise<void> => {
    if (data.proformaInvoiceId > 0) {
        const url = `${getProformaInvoicesUrl()}/${data.proformaInvoiceId}`; 
        await apiClient.put(url, data);
    } else {
        const url = getProformaInvoicesUrl();
        await apiClient.post(url, data);
    }
};


export const deleteProformaInvoice = async (id: number): Promise<void> => {
    await apiClient.delete(`${getProformaInvoicesUrl()}/${id}`);
};


export const getActiveOffersForPI = async () => {
    try {
        const res = await apiClient.get(`${getProformaInvoicesUrl()}/active-offers`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error("Error fetching active offers for PI", error);
        return [];
    }
};


export const getDataFromOffer = async (orderAcceptanceId: number): Promise<ProformaInvoiceFromApi> => {
    const res = await apiClient.get(`${getProformaInvoicesUrl()}/from-offer/${orderAcceptanceId}`);
    return res.data;
};

export const getProformaInvoicePdfData = async (id: number): Promise<ProformaInvoicePdfData> => {
  const url = `${getProformaInvoicesUrl()}/${id}/pdf-details`;
  const response = await apiClient.get(url);
  return response.data;
};

export const getDataForDummyInvoice = async (id: number): Promise<DummyInvoice> => {
    const url = `${getProformaInvoicesUrl()}/${id}/for-dummy-invoice`;
    const res = await apiClient.get(url);
    return res.data;
};

export const saveDummyInvoice = async (data: DummyInvoice): Promise<void> => {
    const url = `${getProformaInvoicesUrl()}/create-dummy-invoice`;
    await apiClient.post(url, data);
};

export const getDummyInvoices = async (): Promise<any[]> => {
    const res = await apiClient.get(`${getProformaInvoicesUrl()}/GetAllDummy`);
    return res.data;
};

export const toggleProformaInvoiceStatus = async (id: number): Promise<void> => {
    await apiClient.patch(`${getProformaInvoicesUrl()}/toggle-status/${id}`);
};

export const checkDummyExists = async (id: number): Promise<boolean> => {
  const res = await apiClient.get(
    `${getProformaInvoicesUrl()}/has-dummy/${id}`
  );
  return res.data;
};


export const getDummyInvoicePdfData = async (id: number): Promise<ProformaInvoicePdfData> => {
  // Note the new URL pointing to our new controller action
  const url = `${getProformaInvoicesUrl()}/${id}/dummy-pdf-details`;
  const response = await apiClient.get(url);
  return response.data;
};


export const getActiveServiceReports = async (): Promise<SelectOption[]> => {
    try {
        const res = await apiClient.get(`${getProformaInvoicesUrl()}/service-reports`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error("Error fetching active service reports", error);
        return [];
    }
};

export const getDataFromServiceReport = async (serviceReportId: number): Promise<ProformaInvoiceFromApi> => {
    const res = await apiClient.get(`${getProformaInvoicesUrl()}/from-service/${serviceReportId}`);
    return res.data;
};

export const downloadProformaInvoiceExcel = async (
  id: number
): Promise<void> => {
  const response = await apiClient.get(
    `${getProformaInvoicesUrl()}/download-excel/${id}`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = `ProformaInvoice_${id}.xlsx`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};



