import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Accessories, AccessoriesListItem } from "./types";


export const getAccessories = async (): Promise<AccessoriesListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Accessories);
    return res.data;
};


export const getAccessoryById = async (id: number): Promise<Accessories> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Accessories}/${id}`);
    return res.data;
};


export const getGeneratedAccessoryCode = async (
  vendorId: number,
  productSource: "Local" | "Imported" // 1. Add productSource to the signature
): Promise<string> => {

  // 2. Add the same robust check
  if (!vendorId) return "";

  // 3. Define the type and origin codes, just like in ProductService
  const typeCode = 2; // Accessory = 02
  const originCode = productSource === "Imported" ? 1 : 2;

  // 4. Change the endpoint to the generic 'generate-part-number' with query params
  const res = await apiClient.get(
    `${API_ENDPOINTS.Accessories}/generate-part-number?vendorId=${vendorId}&typeCode=${typeCode}&originCode=${originCode}`
  );

  return res.data;
};

export const saveAccessory = async (data: Accessories): Promise<void> => {
    const formData = new FormData();


    formData.append('AccessoriesId', (data.accessoriesId || 0).toString());
    formData.append('AccessoriesName', data.accessoriesName);
    formData.append('AccessoriesShortName', data.accessoriesShortName || '');
    formData.append('CompanyNameOfProduct', data.companyNameOfProduct || '');
    formData.append('VendorId', data.vendorId.toString());

   
    if (data.productGroupId) formData.append('ProductGroupId', data.productGroupId.toString());
    if (data.categoryId) formData.append('CategoryId', data.categoryId.toString());
    if (data.productTypeId) formData.append('ProductTypeId', data.productTypeId.toString());
    if (data.variantId) formData.append('VariantId', data.variantId.toString());
    if (data.versionId) formData.append('VersionId', data.versionId.toString());
    if (data.currencyId) formData.append('CurrencyId', data.currencyId.toString());
    if (data.partConditionId) formData.append('PartConditionId', data.partConditionId.toString());

   
    formData.append('AccessoriesDescription', data.accessoriesDescription || '');
    formData.append('Specification', data.specification || '');
    formData.append('PartUnique', data.partUnique || '');
    if (data.manufacturingDate) formData.append('ManufacturingDate', data.manufacturingDate);
    if (data.expiryDate) formData.append('ExpiryDate', data.expiryDate);
    formData.append('WarrantyPeriod', data.warrantyPeriod || '');

  
    formData.append('HSNCode', data.hsnCode || '');
    formData.append('UOM', data.uom || '');


    formData.append('PurchasePrice', (data.purchasePrice || 0).toString());
    formData.append('SalePrice', (data.salePrice || 0).toString());
    formData.append('TaxPreference', data.taxPreference || 'Taxable');
    if (data.taxRateId) formData.append('TaxRateId', data.taxRateId.toString());
    formData.append('AvailableQuantity', (data.availableQuantity || 0).toString());
    formData.append('OutOfStockWarning', (data.outOfStockWarning || 5).toString());
    formData.append('ProductSource', data.productSource || 'Local'); 
    formData.append('BCD', (data.bcd || 0).toString());
    formData.append('SWS', (data.sws || 0).toString());
    formData.append('IGST', (data.igst || 0).toString());
    
formData.append('IsCalibration', data.isCalibration ? "true" : "false");
formData.append('CalibrationFrequency', data.calibrationFrequency || '');

  
    (data.currencyPrices || []).forEach((cp, index) => {
        formData.append(`CurrencyPrices[${index}].CurrencyId`, cp.currencyId.toString());
        formData.append(`CurrencyPrices[${index}].Price`, cp.price.toString());
    });
 
    if (data.accessoriesImageFile instanceof File) {
        formData.append('AccessoriesImageFile', data.accessoriesImageFile);
    }

  
    if (data.accessoriesId > 0) {
        
        await apiClient.put(`${API_ENDPOINTS.Accessories}/${data.accessoriesId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } else {
        
        await apiClient.post(API_ENDPOINTS.Accessories, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};


export const deleteAccessory = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Accessories}/${id}`);
};

// NEW FUNCTION TO HANDLE EXCEL IMPORT
export const importAccessoriesExcel = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${API_ENDPOINTS.Accessories}/upload-excel`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// NEW FUNCTION TO HANDLE EXCEL DOWNLOAD
export const downloadAccessoriesExcel = async (): Promise<Blob> => {
    const response = await apiClient.get(`${API_ENDPOINTS.Accessories}/export-excel`, {
        responseType: 'blob', // This is crucial to handle the file response
    });
    return response.data;
};