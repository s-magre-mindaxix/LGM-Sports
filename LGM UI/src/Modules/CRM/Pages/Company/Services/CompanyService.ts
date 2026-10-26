

import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

import type { Company, CompanyListItem } from "./types";

// UPDATE the return type of this function
export const getCompanies = async (): Promise<CompanyListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Company);
    return res.data;
};

export const getCompanyById = async (id: number): Promise<Company> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Company}/${id}`);
    return res.data;
};
export const deleteCompany = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Company}/${id}`);
};

export const getBanksByCompanyId = async (id: number) => {
    // This creates: https://localhost:xxxx/api/Company/1/banks
    const url = `${API_ENDPOINTS.Company}/${id}/banks`;
    const res = await apiClient.get(url);
    return res.data;
};
// --- END Unchanged code ---

// The main function to orchestrate saving everything
// export const saveCompany = async (data: Company): Promise<void> => {
//   const formData = new FormData();

//   // 1. Basic Company Details
//   formData.append('CompanyId', (data.companyId || 0).toString());
//   formData.append('CompanyCode', data.companyCode);
//   formData.append('CompanyName', data.companyName);
//   formData.append('CompanyShortName', data.companyShortName || '');
//   formData.append('PAN', data.pan || '');
//   formData.append('TAN', data.tan || '');
//   formData.append('GSTIN', data.gstin || '');
//   formData.append('CIN', data.cin || '');
  
//   if (data.companyLogo instanceof File) {
//     formData.append('CompanyLogo', data.companyLogo);
//   }

//   // 2. Map Addresses List
//   data.addresses.forEach((addr, index) => {
//     formData.append(`Addresses[${index}].AddressType`, addr.addressType);
//     formData.append(`Addresses[${index}].FlatBlock`, addr.flatBlock || '');
//     formData.append(`Addresses[${index}].Premises`, addr.premises || '');
//     formData.append(`Addresses[${index}].Road`, addr.road || '');
//     formData.append(`Addresses[${index}].Area`, addr.area || '');
//     formData.append(`Addresses[${index}].Town`, addr.town || '');
//     formData.append(`Addresses[${index}].PinCode`, addr.pinCode || '');
//     formData.append(`Addresses[${index}].Country`, addr.country || '');
//     formData.append(`Addresses[${index}].State`, addr.state || '');
//     formData.append(`Addresses[${index}].MobileNo`, addr.mobileNo || '');
//     formData.append(`Addresses[${index}].AltMobileNo`, addr.altMobileNo || '');
//     formData.append(`Addresses[${index}].Email`, addr.email || '');
//     formData.append(`Addresses[${index}].AltEmail`, addr.altEmail || '');
//   });

//   // 3. Map Directors List (Including Files)
//   data.directors.forEach((dir, index) => {
//     formData.append(`Directors[${index}].DirectorName`, dir.directorName);
//     formData.append(`Directors[${index}].Designation`, dir.designation);
//     formData.append(`Directors[${index}].MobileNo`, dir.mobileNo);
//     formData.append(`Directors[${index}].Email`, dir.email);
//     formData.append(`Directors[${index}].Website`, dir.website || '');
    
//     if (dir.docsAttachment instanceof File) {
//       formData.append(`Directors[${index}].DocsAttachment`, dir.docsAttachment);
//     }
//     if (dir.presentationPPT instanceof File) {
//       formData.append(`Directors[${index}].PresentationPPT`, dir.presentationPPT);
//     }
//   });

//   // 4. Map Bank Details List
//   data.bankDetails.forEach((bank, index) => {
//     formData.append(`BankDetails[${index}].BankName`, bank.bankName);
//     formData.append(`BankDetails[${index}].BankAddress`, bank.bankAddress || '');
//     formData.append(`BankDetails[${index}].AccountNo`, bank.accountNo);
//     formData.append(`BankDetails[${index}].IFSC`, bank.ifsc);
//     formData.append(`BankDetails[${index}].SwiftCode`, bank.swiftCode || '');
//     formData.append(`BankDetails[${index}].IBAN`, bank.iban || '');
//     formData.append(`BankDetails[${index}].AccountHolderName`, bank.accountHolderName);
//   });

//   // 5. Send Request (POST for Create, PUT for Update)
//   if (data.companyId && data.companyId > 0) {
//     // Single PUT request for everything
//     await apiClient.put(`${API_ENDPOINTS.Company}/${data.companyId}`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   } else {
//     // Single POST request for everything
//     await apiClient.post(API_ENDPOINTS.Company, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   }
// };


const isValidEmail = (email: string) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidMobile = (mobile: string) => {
    if (!mobile) return false;
    return /^\d{10}$/.test(mobile);
};

export const getAllBanks = async () => {
    const res = await apiClient.get(API_ENDPOINTS.CompanyBanks);
    return res.data;
};

/**
 * Main Save Function (Create & Update)
 */
export const saveCompany = async (data: Company): Promise<void> => {
    
    // --- 1. FRONT-END VALIDATION ---
    // Validate Main Company Contact (if exists in addresses)
    for (const addr of data.addresses) {
        if (!isValidMobile(addr.mobileNo)) {
            throw new Error(`Invalid Mobile No in ${addr.addressType} Address. Exactly 10 digits required.`);
        }
        if (!isValidEmail(addr.email)) {
            throw new Error(`Invalid Email Address format in ${addr.addressType} Address.`);
        }
        // Validate Alt fields only if they have values
        if (addr.altMobileNo && !isValidMobile(addr.altMobileNo)) {
            throw new Error(`Invalid Alt Mobile No in ${addr.addressType} Address.`);
        }
        if (addr.altEmail && !isValidEmail(addr.altEmail)) {
            throw new Error(`Invalid Alt Email format in ${addr.addressType} Address.`);
        }
    }

    // Validate Directors
    for (const dir of data.directors) {
        if (!isValidMobile(dir.mobileNo)) {
            throw new Error(`Invalid Mobile No for Director: ${dir.directorName}.`);
        }
        if (!isValidEmail(dir.email)) {
            throw new Error(`Invalid Email format for Director: ${dir.directorName}.`);
        }
    }

    // --- 2. PREPARE FORM DATA ---
    const formData = new FormData();

    // Company Basic Details
    formData.append('CompanyId', (data.companyId || 0).toString());
    formData.append('CompanyCode', data.companyCode);
    formData.append('CompanyName', data.companyName);
    formData.append('CompanyShortName', data.companyShortName || '');
    formData.append('PAN', data.pan || '');
    formData.append('TAN', data.tan || '');
    formData.append('GSTIN', data.gstin || '');
    formData.append('CIN', data.cin || '');
    
    // Logo File
    if (data.companyLogo instanceof File) {
        formData.append('CompanyLogo', data.companyLogo);
    }

    // Addresses List
    data.addresses.forEach((addr, index) => {
        formData.append(`Addresses[${index}].AddressType`, addr.addressType);
        formData.append(`Addresses[${index}].FlatBlock`, addr.flatBlock || '');
        formData.append(`Addresses[${index}].Premises`, addr.premises || '');
        formData.append(`Addresses[${index}].Road`, addr.road || '');
        formData.append(`Addresses[${index}].Area`, addr.area || '');
        formData.append(`Addresses[${index}].Town`, addr.town || '');
        formData.append(`Addresses[${index}].PinCode`, addr.pinCode || '');
        formData.append(`Addresses[${index}].Country`, addr.country || '');
        formData.append(`Addresses[${index}].State`, addr.state || '');
        formData.append(`Addresses[${index}].MobileNo`, addr.mobileNo || '');
        formData.append(`Addresses[${index}].AltMobileNo`, addr.altMobileNo || ''); // FIXED
        formData.append(`Addresses[${index}].Email`, addr.email || '');
        formData.append(`Addresses[${index}].AltEmail`, addr.altEmail || ''); // FIXED
    });

    // Directors List
    data.directors.forEach((dir, index) => {
        formData.append(`Directors[${index}].DirectorName`, dir.directorName);
        formData.append(`Directors[${index}].Designation`, dir.designation);
        formData.append(`Directors[${index}].MobileNo`, dir.mobileNo);
        formData.append(`Directors[${index}].Email`, dir.email);
        formData.append(`Directors[${index}].Website`, dir.website || '');
        
        // IMPORTANT: Send the existing paths back so the server knows what files to keep
        formData.append(`Directors[${index}].DocsAttachmentPath`, dir.docsAttachmentPath || '');
        formData.append(`Directors[${index}].PresentationPPTPath`, dir.presentationPPTPath || '');

        // If a new file is selected, attach it
        if (dir.docsAttachment instanceof File) {
            formData.append(`Directors[${index}].DocsAttachment`, dir.docsAttachment);
        }
        if (dir.presentationPPT instanceof File) {
            formData.append(`Directors[${index}].PresentationPPT`, dir.presentationPPT);
        }
    });

    // Bank Details List
    data.bankDetails.forEach((bank, index) => {
        formData.append(`BankDetails[${index}].BankName`, bank.bankName);
        formData.append(`BankDetails[${index}].BankAddress`, bank.bankAddress || '');
        formData.append(`BankDetails[${index}].AccountNo`, bank.accountNo);
        formData.append(`BankDetails[${index}].IFSC`, bank.ifsc);
        formData.append(`BankDetails[${index}].SwiftCode`, bank.swiftCode || ''); // FIXED
        formData.append(`BankDetails[${index}].IBAN`, bank.iban || '');           // FIXED
        formData.append(`BankDetails[${index}].AccountHolderName`, bank.accountHolderName);
    });

    // --- 3. EXECUTE API CALL ---
    if (data.companyId && data.companyId > 0) {
        // UPDATE (PUT)
        await apiClient.put(`${API_ENDPOINTS.Company}/${data.companyId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    } else {
        // CREATE (POST)
        await apiClient.post(API_ENDPOINTS.Company, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
};