import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Vendor } from "./types";

export const getVendors = async (): Promise<Vendor[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Vendor);
    if (Array.isArray(res.data)) {
        return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    return []; 
};

const convertToFormData = (data: Vendor): FormData => {
    const formData = new FormData();

    // 1. Vendor Properties
    formData.append("Id", (data.id || 0).toString());
    formData.append("VendorName", data.vendorName || "");
    formData.append("VendorCode", data.vendorCode || "");
    formData.append("VendorShortName", data.vendorShortName || "");
    formData.append("VendorDivision", data.vendorDivision || "");
    formData.append("VendorPAN", data.vendorPAN || "");
    formData.append("VendorTAN", data.vendorTAN || "");
    formData.append("VATNo", data.vatNo || "");
    formData.append("MSMENo", data.msmeNo || "");
    formData.append("GSTIN", data.gstin || "");
    formData.append("CIN", data.cin || "");
    if (data.vendorLogo instanceof File) {
        formData.append("LogoFile", data.vendorLogo);
    } else if (typeof data.vendorLogo === 'string') {
        formData.append("VendorLogo", data.vendorLogo);
    }

    // 2. Addresses (Ensure Alt fields are appended)
    data.addresses?.forEach((addr, i) => {
        formData.append(`Addresses[${i}].AddressType`, addr.addressType || "");
        formData.append(`Addresses[${i}].FlatBlockNo`, addr.flatBlockNo || "");
        formData.append(`Addresses[${i}].Premises`, addr.premises || "");
        formData.append(`Addresses[${i}].RoadStrLane`, addr.roadStrLane || "");
        formData.append(`Addresses[${i}].Area`, addr.area || "");
        formData.append(`Addresses[${i}].Town`, addr.town || "");
        formData.append(`Addresses[${i}].PinNo`, addr.pinNo || "");
        formData.append(`Addresses[${i}].CountryId`, (addr.countryId || 0).toString());
        formData.append(`Addresses[${i}].StateId`, (addr.stateId || 0).toString());
        formData.append(`Addresses[${i}].MobileNo`, addr.mobileNo || "");
        formData.append(`Addresses[${i}].EmailAddress`, addr.emailAddress || "");
        
        // Ensure these are sent as strings to satisfy nullable validation
        formData.append(`Addresses[${i}].AltMobileNo`, addr.altMobileNo || "");
        formData.append(`Addresses[${i}].AltEmailAddress`, addr.altEmailAddress || "");
    });

    // 3. Principal Contacts
    data.principalContacts?.forEach((contact, i) => {
        formData.append(`PrincipalContacts[${i}].PersonName`, contact.personName || "");
        formData.append(`PrincipalContacts[${i}].Designation`, contact.designation || "");
        formData.append(`PrincipalContacts[${i}].MobileNo`, contact.mobileNo || "");
        formData.append(`PrincipalContacts[${i}].EmailAddress`, contact.emailAddress || "");
        // formData.append(`PrincipalContacts[${i}].DocsAttachment`, ""); // Important for validation
        if (contact.docsAttachment instanceof File) {
            formData.append(`PrincipalContacts[${i}].ContactFile`, contact.docsAttachment);
        } else {
            formData.append(`PrincipalContacts[${i}].DocsAttachment`, contact.docsAttachment || "");
        }
    });
    // 4. Bank Details
    data.bankDetails?.forEach((bank, i) => {
        formData.append(`BankDetails[${i}].BankName`, bank.bankName || "");
        formData.append(`BankDetails[${i}].BankAddress`, bank.bankAddress || "");
        formData.append(`BankDetails[${i}].AccountNo`, bank.accountNo || "");
        formData.append(`BankDetails[${i}].IFSCCode`, bank.ifscCode || "");
        formData.append(`BankDetails[${i}].EmailAddress`, bank.emailAddress || "");
        formData.append(`BankDetails[${i}].AccountHolderName`, bank.accountHolderName || "");
        formData.append(`BankDetails[${i}].SwiftCode`, bank.swiftCode || "");
        formData.append(`BankDetails[${i}].IBANNo`, bank.ibanNo || "");
    });

    return formData;
};

export const createVendor = async (data: Vendor): Promise<void> => {
    const formData = convertToFormData(data);
    await apiClient.post(API_ENDPOINTS.Vendor, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const updateVendor = async (id: number, data: Vendor): Promise<void> => {
    const formData = convertToFormData(data);
    
    await apiClient.put(`${API_ENDPOINTS.Vendor}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getVendorById = async (id: number): Promise<Vendor> => {
  const res = await apiClient.get(`${API_ENDPOINTS.Vendor}/${id}`);
  return res.data;
};

export const deleteVendor = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Vendor}/${id}`);
};

export const getGeneratedVendorCode = async (): Promise<string> => {
  const response = await apiClient.get(`${API_ENDPOINTS.Vendor}/generate-code`);
  return response.data;
};

