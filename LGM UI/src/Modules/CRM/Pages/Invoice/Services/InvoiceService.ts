// src/services/offerReportService.ts
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";
import type { FinalDummyInvoice, InvoiceData } from "./types";

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

export const getCustomerContacts = async (customerId: number) => {
  const res = await apiClient.get(
    `${API_ENDPOINTS.Enquiries}/customer-contacts/${customerId}`,
  );
  return res.data;
};

export const getBanksByCompanyId = async (id: number) => {
  const url = `${API_ENDPOINTS.Company}/${id}/banks`;
  const res = await apiClient.get(url);
  return res.data;
};

export const getAllInvoices = async () => {
  const res = await apiClient.get(API_ENDPOINTS.GetAllInvoices);
  return res.data;
};

export const saveInvoice = async (data: InvoiceData) => {
  const payload = {
     orderAcceptanceId: data.orderAcceptanceId,
    productGroupId: Number(data.group?.value),
    invoiceNo: data.invoiceNo,
    invoiceDate: data.invoiceDate,
    invoiceDueDate: data.invoiceDueDate,
    customerPo: data.customerPo,
    companyPoDate: data.companyPoDate,
    consigneeNameAddress: data.consigneeNameAddress,
    description: data.description,
    subTotal: data.subtotal,
    freightCharges: data.freightCharges,
    grandTotal: data.grandTotal,
    advanceReceived: data.advanceReceived,
    advanceAmount: data.advanceAmount,
    balanceAmount: data.balanceAmount,
    companyId: Number(data.company?.value),
    vendorId: Number(data.vendor?.value),
    customerId: Number(data.customerCompany?.value),
    companyGroupId: Number(data.companyGroup?.value),
    responsiblePersonId: Number(data.responsiblePersonName?.value),
    currencyId: Number(data.currency?.value),
    placeOfSupplyId: Number(data.placeOfSupply?.value),
    bankDetailId: Number(data.bankDetail?.value),
    serviceId: data.serviceId,
     serviceReportId: data.serviceReportId, 
    termsConditions: data.termsConditions,
    customerNotes: data.customerNotes,

    items: data.items.map((i) => ({
      itemType: i.itemType,
      productId: i.productId,
      accessoryId: i.accessoryId,
      description: i.description,
      hsnSacCode: i.hsnSacCode,
      quantity: i.quantity,
      rate: i.rate,
      discount: i.discount,
      total: i.total,
      gstAmount: i.gstAmount,
      cgstAmount: i.cgstAmount,
      sgstAmount: i.sgstAmount,
      igstAmount: i.igstAmount,
      price: i.finalPrice,
      taxPercentage: i.taxPercentage,
      accessoryIds: i.accessoryIds,
    })),
  };

  const res = await fetch(API_ENDPOINTS.SaveInvoice, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
  const error = await res.json();

  throw new Error(
    error.message || "Failed to save invoice"
  );
}

return await res.json();
};

export const updateInvoice = async (data: InvoiceData) => {
  const payload = {
    invoiceId: data.invoiceId,
    productGroupId: Number(data.group?.value),
    invoiceNo: data.invoiceNo,
    invoiceDate: data.invoiceDate,
    invoiceDueDate: data.invoiceDueDate,

    customerPo: data.customerPo,
    companyPoDate: data.companyPoDate,
    consigneeNameAddress: data.consigneeNameAddress,
    description: data.description,

    subTotal: data.subtotal,
    freightCharges: data.freightCharges,
    grandTotal: data.grandTotal,
    advanceReceived: data.advanceReceived,
    advanceAmount: data.advanceAmount,
    balanceAmount: data.balanceAmount,
    companyId: Number(data.company?.value),
    vendorId: Number(data.vendor?.value),
    customerId: Number(data.customerCompany?.value),
    companyGroupId: Number(data.companyGroup?.value),
    responsiblePersonId: Number(data.responsiblePersonName?.value),
    currencyId: Number(data.currency?.value),
    placeOfSupplyId: Number(data.placeOfSupply?.value),
    bankDetailId: Number(data.bankDetail?.value),
      serviceId: data.serviceId,
       serviceReportId: data.serviceReportId,
    termsConditions: data.termsConditions,
    customerNotes: data.customerNotes,

    items: data.items.map((i) => ({
      itemType: i.itemType,     
      productId: i.productId,
      accessoryId: i.accessoryId,
      description: i.description,
      hsnSacCode: i.hsnSacCode,
      quantity: i.quantity,
      rate: i.rate,
      discount: i.discount,
      total: i.total,
      gstAmount: i.gstAmount,
      cgstAmount: i.cgstAmount,
      sgstAmount: i.sgstAmount,
      igstAmount: i.igstAmount,
      price: i.finalPrice,
      taxPercentage: i.taxPercentage,
      accessoryIds: i.accessoryIds,
    })),
  };

  const res = await fetch(API_ENDPOINTS.UpdateInvoice, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update invoice");
  }

  return res.json();
};

export const getCustomerAddress = async (customerId: number) => {
  const res = await apiClient.get(
    `${API_ENDPOINTS.Customer}/${customerId}/address`,
  );
  return res.data;
};

export const getInvoicePdfData = async (invoiceId: number) => {
  const res = await apiClient.get(
    `${API_ENDPOINTS.GetInvoicePdf}/${invoiceId}`,
  );
  return res.data;
};

export const deleteInvoice = async (invoiceId: number) => {
  const res = await apiClient.delete(
    `${API_ENDPOINTS.DeleteInvoice}/${invoiceId}`,
  );
  return res.data;
};


export const getActiveOrderAcceptances = async (): Promise<any[]> => {
  const res = await apiClient.get(API_ENDPOINTS.GetActiveOrderAcceptances);
  return res.data?.data || res.data?.result || res.data || [];
};

export const getDataFromOrderAcceptance = async (id: number) => {
  const res = await apiClient.get(`${API_ENDPOINTS.GetDataFromOrderAcceptance}/${id}`);
  return res.data?.data || res.data;
};

const getInvoicesUrl = () => API_ENDPOINTS.Invoice;

export const getDataForFinalDummyInvoice = async (id: number): Promise<FinalDummyInvoice> => {
    const url = `${getInvoicesUrl()}/${id}/for-dummy-invoice`;
    const res = await apiClient.get(url);
    return res.data;
};

export const saveFinalDummyInvoice = async (data: FinalDummyInvoice): Promise<void> => {
    const url = `${getInvoicesUrl()}/create-final-dummy-invoice`;
    await apiClient.post(url, data);
};

export const getFinalDummyInvoices = async (): Promise<any[]> => {
    const res = await apiClient.get(`${getInvoicesUrl()}/get-all-final-dummy`);
    return res.data;
};

export const checkFinalDummyExists = async (id: number): Promise<boolean> => {
  const res = await apiClient.get(
    `${getInvoicesUrl()}/has-final-dummy/${id}`
  );
  return res.data;
};

export const getDummyInvoicePdfData = async (dummyInvoiceId: number) => {
  const url = `${getInvoicesUrl()}/dummy-invoice-pdf/${dummyInvoiceId}`;
  const res = await apiClient.get(url);
  return res.data;
};

export const getServiceReportSerials = async (): Promise<any[]> => {
 const url = `${getInvoicesUrl()}/service-report-serials`;
  const res = await apiClient.get(url);
  return res.data?.data || res.data?.result || res.data || [];
};

export const getDataFromServiceReport = async (serviceReportId: number) => {
 const url = `${getInvoicesUrl()}/service-report/${serviceReportId}`;
  const res = await apiClient.get(url);
  return res.data?.data || res.data;
};


export const getActiveProformaInvoices = async (): Promise<any[]> => {
  const url = `${getInvoicesUrl()}/proforma-dropdown`;

  const res = await apiClient.get(url);

  return res.data?.data || res.data?.result || res.data || [];
};

export const getDataFromProformaInvoice = async (
  proformaInvoiceId: number
) => {
  const url = `${getInvoicesUrl()}/from-proforma/${proformaInvoiceId}`;

  const res = await apiClient.get(url);

  return res.data?.data || res.data;
};

export const downloadInvoiceExcel = async (invoiceId: number) => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.Invoice}/export-excel/${invoiceId}`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Invoice_${invoiceId}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
