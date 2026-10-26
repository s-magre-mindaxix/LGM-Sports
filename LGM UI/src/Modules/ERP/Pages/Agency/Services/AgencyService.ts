import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Agency } from "./types";

export const getAgencies = async (): Promise<Agency[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Agency);
    // Handle cases where data is nested
    if (Array.isArray(res.data)) {
        return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    return []; 
};

const convertToFormData = (data: Agency): FormData => {
    const formData = new FormData();

    // 1. Agency Properties (PascalCase to match C# DTO)
    formData.append("Id", (data.id || 0).toString());
    formData.append("AgencyName", data.agencyName || "");
    formData.append("AgencyCode", data.agencyCode || "");
    formData.append("AgencyTypeId", (data.agencyTypeId || 0).toString());
    formData.append("AgencyShortName", data.agencyShortName || "");
    formData.append("PANNo", data.panNo || "");
    formData.append("TANNo", data.tanNo || "");
    formData.append("GSTIN", data.gstin || "");
    formData.append("CINNo", data.cinNo || "");
    formData.append("IATACode", data.iataCode || "");
    formData.append("FMCCode", data.fmcCode || "");
    formData.append("LicenseNo", data.licenseNo || "");
    formData.append("Website", data.website || "");
    
    if (data.logoFile instanceof File) {
        formData.append("LogoFile", data.logoFile);
    } else if (typeof data.agencyLogo === 'string') {
        formData.append("AgencyLogo", data.agencyLogo);
    }

    // 2. Addresses
    data.addresses?.forEach((addr, i) => {
        formData.append(`Addresses[${i}].Id`, (addr.id || 0).toString());
        formData.append(`Addresses[${i}].AddressType`, addr.addressType || "");
        formData.append(`Addresses[${i}].FlatBlockNo`, addr.flatBlockNo || "");
        formData.append(`Addresses[${i}].Premises`, addr.premises || "");
        formData.append(`Addresses[${i}].RoadStreetLane`, addr.roadStreetLane || "");
        formData.append(`Addresses[${i}].Area`, addr.area || "");
        formData.append(`Addresses[${i}].TownCity`, addr.townCity || "");
        formData.append(`Addresses[${i}].Pincode`, addr.pincode || "");
        formData.append(`Addresses[${i}].CountryId`, (addr.countryId || 0).toString());
        formData.append(`Addresses[${i}].StateId`, (addr.stateId || 0).toString());
        formData.append(`Addresses[${i}].MobileNo`, addr.mobileNo || "");
        formData.append(`Addresses[${i}].AlternateMobileNo`, addr.alternateMobileNo || "");
        formData.append(`Addresses[${i}].EmailAddress`, addr.emailAddress || "");
        formData.append(`Addresses[${i}].AlternateEmailAddress`, addr.alternateEmailAddress || "");
    });

    // 3. Contacts
    data.contacts?.forEach((contact, i) => {
        formData.append(`Contacts[${i}].Id`, (contact.id || 0).toString());
        formData.append(`Contacts[${i}].PersonName`, contact.personName || "");
        formData.append(`Contacts[${i}].Designation`, contact.designation || "");
        formData.append(`Contacts[${i}].Department`, contact.department || "");
        formData.append(`Contacts[${i}].MobileNo`, contact.mobileNo || "");
        formData.append(`Contacts[${i}].AlternateMobileNo`, contact.alternateMobileNo || "");
        formData.append(`Contacts[${i}].EmailAddress`, contact.emailAddress || "");
        
        if (contact.contactFile instanceof File) {
            formData.append(`Contacts[${i}].ContactFile`, contact.contactFile);
        } else {
            formData.append(`Contacts[${i}].DocsAttachment`, contact.docsAttachment || "");
        }
    });

    // 4. Bank Details
    data.bankDetails?.forEach((bank, i) => {
        formData.append(`BankDetails[${i}].Id`, (bank.id || 0).toString());
        formData.append(`BankDetails[${i}].BankName`, bank.bankName || "");
        formData.append(`BankDetails[${i}].BankAddress`, bank.bankAddress || "");
        formData.append(`BankDetails[${i}].AccountHolderName`, bank.accountHolderName || "");
        formData.append(`BankDetails[${i}].AccountNo`, bank.accountNo || "");
        formData.append(`BankDetails[${i}].IFSCCode`, bank.ifscCode || "");
        formData.append(`BankDetails[${i}].SwiftCode`, bank.swiftCode || "");
        formData.append(`BankDetails[${i}].IBANNo`, bank.ibanNo || "");
        formData.append(`BankDetails[${i}].EmailAddress`, bank.emailAddress || "");
    });

    return formData;
};

export const createAgency = async (data: Agency): Promise<void> => {
    const formData = convertToFormData(data);
    await apiClient.post(API_ENDPOINTS.Agency, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const updateAgency = async (data: Agency): Promise<void> => {
    const formData = convertToFormData(data);
    await apiClient.put(API_ENDPOINTS.Agency, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getAgencyById = async (id: number): Promise<Agency> => {
  const res = await apiClient.get(`${API_ENDPOINTS.Agency}/${id}`);
  return res.data;
};

export const deleteAgency = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Agency}/${id}`);
};

// NOTE: Add an endpoint in your AgencyController to generate codes if needed.
// For now, this is a placeholder.
export const getGeneratedAgencyCode = async (): Promise<string> => {
  // const response = await apiClient.get(`${API_ENDPOINTS.Agency}/generate-code`);
  // return response.data;
  return `AG${Date.now().toString().slice(-6)}`; // Placeholder implementation
};