// src/services/offerReportService.ts
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";

export const getProductGroups = async () => {
  const res = await apiClient.get(API_ENDPOINTS.ProductGroup);
  return res.data;
};

export const getCompanies = async () => {
  const res = await apiClient.get(API_ENDPOINTS.Company);
  return res.data;
};

export const getVendors = async () => {
  const res = await apiClient.get(API_ENDPOINTS.Vendor);
  return res.data;
};

export const getCurrencies = async () => {
  const res = await apiClient.get(API_ENDPOINTS.Currency);
  return res.data;
};

export const getStates = async () => {
  const res = await apiClient.get(API_ENDPOINTS.State);
  return res.data;
};

export const getCompanyGroups = async () => {
  const res = await apiClient.get(API_ENDPOINTS.CompanyGroup);
  return res.data;
};

export const getCustomersByCompanyGroup = async (companyGroupId: number) => {
  const res = await apiClient.get(
    `${API_ENDPOINTS.Customer}/by-company-group/${companyGroupId}`,
  );
  return res.data;
};

export const getOfferReport = async (filters: any) => {
  const res = await apiClient.post(API_ENDPOINTS.OfferReport, filters);
  return res.data;
};

export const getOrderAcceptanceReport = async (filters: any) => {
  const res = await apiClient.post(API_ENDPOINTS.OAReport, filters);
  return res.data;
};

export const getPurchaseOrderReport = async (filters: any) => {
  const res = await apiClient.post(API_ENDPOINTS.POReport, filters);
  return res.data;
};

export const getProformaInvoiceReport = async (filters: any) => {
  const res = await apiClient.post(
    API_ENDPOINTS.ProformaInvoiceReport,
    filters,
  );
  return res.data;
};

export const getInvoiceReport = async (filters: any) => {
  const res = await apiClient.post(API_ENDPOINTS.InvoiceReport, filters);
  return res.data;
};

//Final Note API
export const updateOrderAcceptanceFinalNote = async (payload: {
  orderAcceptanceId: number;
  finalNote: string;
}) => {
  const response = await apiClient.put(
    API_ENDPOINTS.UpdateOAFinalNote,
    payload,
  );

  return response.data;
};

export const updateInvoiceFinalNote = async (payload: {
  invoiceId: number;
  finalNote: string;
}) => {
  const response = await apiClient.put(
    API_ENDPOINTS.UpdateInvoiceFinalNote,
    payload,
  );

  return response.data;
};

export const updateProformaInvoiceFinalNote = async (payload: {
  proformaInvoiceId: number;
  finalNote: string;
}) => {
  const response = await apiClient.put(
    API_ENDPOINTS.UpdateProformaInvoiceFinalNote,
    payload,
  );

  return response.data;
};

export const updatePOFinalNote = async (payload: {
  purchaseOrderId: number;
  finalNote: string;
}) => {
  const response = await apiClient.put(
    API_ENDPOINTS.UpdatePoFinalNote,
    payload,
  );

  return response.data;
};

export const updateOfferFinalNote = async (payload: {
  offerId: number;
  finalNote: string;
}) => {
  const response = await apiClient.put(
    API_ENDPOINTS.UpdateOfferFinalNote,
    payload,
  );

  return response.data;
};

