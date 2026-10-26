import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Customer } from "./types";

const ENDPOINT = API_ENDPOINTS.Customer || "/Customers";

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await apiClient.get(ENDPOINT);
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

const convertToFormData = (data: Customer): FormData => {
  const formData = new FormData();

  // Basic Info
  formData.append("Id", (data.id || 0).toString());
  formData.append("CustomerName", data.customerName || "");
  formData.append("CustomerCode", data.customerCode || "");
  formData.append("CustomerShortName", data.customerShortName || "");
  formData.append("Branch", data.branch || "");
  formData.append("PlantCode", data.plantCode || "");
  formData.append("CompanyGroupId", (data.companyGroupId || 0).toString());
  //if (data.vendorId) formData.append("VendorId", data.vendorId.toString());
  formData.append("VendorCode", data.vendorCode || "");
   formData.append("ForeignVendorCode", data.foreignVendorCode || "");
  // Legal/Tax Info
  formData.append("CustomerPAN", data.customerPAN || "");
  formData.append("CustomerTAN", data.customerTAN || "");
  formData.append("GSTIN", data.gstin || "");
  formData.append("CIN", data.cin || "");
  formData.append("MSMENo", data.msmeNo || "");

  // File Upload
  if (data.attachmentFile instanceof File) {
    formData.append("AttachmentFile", data.attachmentFile);
  } else if (data.docsAttachment) {
    formData.append("DocsAttachment", data.docsAttachment);
  }

  // Addresses
  data.addresses?.forEach((addr, i) => {
    Object.entries(addr).forEach(([key, val]) => {
      if (val !== undefined && val !== null)
        formData.append(
          `Addresses[${i}].${key.charAt(0).toUpperCase() + key.slice(1)}`,
          val.toString(),
        );
    });
  });

  // Contacts
  data.contacts?.forEach((contact, i) => {
    Object.entries(contact).forEach(([key, val]) => {
      if (val !== undefined && val !== null)
        formData.append(
          `Contacts[${i}].${key.charAt(0).toUpperCase() + key.slice(1)}`,
          val.toString(),
        );
    });
  });

  return formData;
};

export const createCustomer = async (data: Customer) => {
  return await apiClient.post(ENDPOINT, convertToFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateCustomer = async (id: number, data: Customer) => {
  return await apiClient.put(`${ENDPOINT}/${id}`, convertToFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const res = await apiClient.get(`${ENDPOINT}/${id}`);
  return res.data;
};

export const getCustomerAddressById = async (id: number): Promise<string> => {
  const res = await apiClient.get(`${ENDPOINT}/${id}/address`);
  return res.data; // The API returns plain text, so we directly return the data
};

export const deleteCustomer = async (id: number) => {
  return await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const getGeneratedCustomerCode = async (): Promise<string> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.Customer}/generate-code`,
  );
  return response.data;
};
