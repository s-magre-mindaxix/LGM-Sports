// import apiClient from "../../../../../API/apiClient";
// import { API_ENDPOINTS } from "../../../../../API/apiConfig";
// import type { Product, ProductListItem } from "./types";


// export const getProducts = async (): Promise<ProductListItem[]> => {
//     const res = await apiClient.get(API_ENDPOINTS.Products);
//     return res.data;
// };

// export const getProductById = async (id: number): Promise<Product> => {
//     const res = await apiClient.get(`${API_ENDPOINTS.Products}/${id}`);
//     return res.data;
// };

// export const saveProduct = async (data: Product): Promise<void> => {
//     const formData = new FormData();
    
//     // Convert object to FormData for file upload support
//     Object.entries(data).forEach(([key, value]) => {
//         if (value !== null && value !== undefined) {
//             if (key === 'productImageFile' && value instanceof File) {
//                 formData.append('ProductImageFile', value);
//             } else if (!(value instanceof File)) {
//                 formData.append(key, value.toString());
//             }
//         }
//     });

//     if (data.productId > 0) {
//         await apiClient.put(`${API_ENDPOINTS.Products}/${data.productId}`, formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//     } else {
//         await apiClient.post(API_ENDPOINTS.Products, formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//     }
// };

// export const deleteProduct = async (id: number): Promise<void> => {
//     await apiClient.delete(`${API_ENDPOINTS.Products}/${id}`);
// };


import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Product, ProductListItem } from "./types";

// 1. Get All Products
export const getProducts = async (): Promise<ProductListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Products);
    return res.data;
};

export const getVendors = async () => {
  const res = await apiClient.get(API_ENDPOINTS.Vendor);
  return res.data;
};

// 2. Get Single Product by ID
export const getProductById = async (id: number): Promise<Product> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Products}/${id}`);
    return res.data;
};

export const getGeneratedProductCode = async (
  vendorId: number,
  productSource: "Local" | "Imported"
): Promise<string> => {

  if (!vendorId) return "";

  const typeCode = 1; // Product = 01
  const originCode = productSource === "Imported" ? 1 : 2;

  const res = await apiClient.get(
    `${API_ENDPOINTS.Products}/generate-code?vendorId=${vendorId}&typeCode=${typeCode}&originCode=${originCode}`
  );

  return res.data?.productCode ?? "";
};
// export const getGeneratedProductCode = async (name: string): Promise<string> => {
//     if (!name || name.length < 2) return "";
//     const res = await apiClient.get(`${API_ENDPOINTS.Products}/generate-code/${name}`);
//     return res.data.productCode;
// };


// 3. Save Product (CREATE & UPDATE)
// We use "export const" to match the import { saveProduct } in the Wizard
export const saveProduct = async (data: Product): Promise<void> => {
    const formData = new FormData();
    
    // Convert the Product object to FormData to support File Upload (Image)
    // Keys must match the C# DTO Property names exactly
    formData.append('ProductId', (data.productId || 0).toString());
    formData.append('VendorId', data.vendorId.toString());
    // ProductDto marks ProductCode as required; include it even though the API
    // regenerates the final code when creating a product.
    formData.append('ProductCode', data.productCode || '');
    formData.append('ProductSKU', (data.productSKU || '').trim());
    formData.append('ProductName', data.productName);
    formData.append('ProductShortName', data.productShortName || '');
    formData.append('CompanyNameOfProduct', data.companyNameOfProduct || '');
    
    // IDs for Dropdowns
    if (data.productGroupId) formData.append('ProductGroupId', data.productGroupId.toString());
    if (data.categoryId) formData.append('CategoryId', data.categoryId.toString());
    if (data.brandId) formData.append('BrandId', data.brandId.toString());
    if (data.productTypeId) formData.append('ProductTypeId', data.productTypeId.toString());
    if (data.variantId) formData.append('VariantId', data.variantId.toString());
    if (data.versionId) formData.append('VersionId', data.versionId.toString());
    if (data.currencyId) formData.append('CurrencyId', data.currencyId.toString());
    if (data.partConditionId) formData.append('PartConditionId', data.partConditionId.toString());
    if (data.unitId) formData.append('UnitId', data.unitId.toString());
    if (data.taxId) formData.append('TaxId', data.taxId.toString());
    formData.append('PartNo', data.partNo || '');

    // Brief Info
    formData.append('ProductDescription', data.productDescription || '');
    formData.append('Specification', data.specification || '');
    // formData.append('PartUnique', data.partUnique || '');
    if (data.manufacturingDate) formData.append('ManufacturingDate', data.manufacturingDate);
    if (data.expiryDate) formData.append('ExpiryDate', data.expiryDate);
    formData.append('WarrantyPeriod', data.warrantyPeriod || '');

    // Other Info
    formData.append('HSNCode', data.hsnCode || '');
    formData.append('UOM', data.uom || '');
    formData.append('HasAccessories', data.hasAccessories || 'No');
    formData.append('MapAccessories', data.mapAccessories || '');

    // Rate Info
    formData.append('PurchasePrice', (data.purchasePrice || 0).toString());
    formData.append('SalePrice', (data.salePrice || 0).toString());
    formData.append('MRP', (data.mrp || 0).toString());
    formData.append('TaxPreference', data.taxPreference || 'Taxable');
    if (data.taxRateId !== undefined && data.taxRateId !== null) formData.append('TaxRateId', data.taxRateId.toString());
    formData.append('AvailableQuantity', (data.availableQuantity || 0).toString());
    formData.append('OutOfStockWarning', (data.outOfStockWarning ?? 5).toString());
    formData.append('MinStock', (data.minStock || 0).toString());
    formData.append('ReorderLevel', (data.reorderLevel || 0).toString());
    formData.append('TrackStock', String(data.trackStock ?? true));
    formData.append('TrackSerial', String(data.trackSerial ?? false));
    formData.append('TrackBatch', String(data.trackBatch ?? false));
    formData.append('IsActive', String(data.isActive ?? true));
    formData.append('IsCalibration', data.isCalibration.toString());
    formData.append('CalibrationFrequency', data.isCalibration ? (data.calibrationFrequency || '') : '');
     formData.append('ProductSource', data.productSource || 'Local'); // Default to Local if empty
    formData.append('BCD', (data.bcd || 0).toString());
    formData.append('SWS', (data.sws || 0).toString());
    formData.append('IGST', (data.igst || 0).toString());

    // --- 3. MULTI-CURRENCY PRICES ---
    // ProductsController binds a ProductFormDto and deserializes this JSON field.
    formData.append('CurrencyPricesJson', JSON.stringify(data.currencyPrices || []));
    // Handle Image File
    if (data.productImageFile instanceof File) {
        formData.append('ProductImageFile', data.productImageFile);
    }

    // Determine if we are updating or creating
    if (data.productId && data.productId > 0) {
        // UPDATE (PUT)
        await apiClient.put(`${API_ENDPOINTS.Products}/${data.productId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } else {
        // CREATE (POST)
        await apiClient.post(API_ENDPOINTS.Products, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// 4. Delete Product (Soft Delete)
export const deleteProduct = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Products}/${id}`);
};

/// NEW FUNCTION TO HANDLE EXCEL IMPORT
export const importProductsExcel = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    // CHANGE THIS LINE: Add the API_ENDPOINTS.Products base path
    const response = await apiClient.post(`${API_ENDPOINTS.Products}/upload-excel`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// NEW FUNCTION TO HANDLE EXCEL DOWNLOAD
export const downloadProductsExcel = async (): Promise<Blob> => {
    // CHANGE THIS LINE: Add the API_ENDPOINTS.Products base path
    const response = await apiClient.get(`${API_ENDPOINTS.Products}/export-excel`, {
        responseType: 'blob', // This is crucial to handle the file response
    });
    return response.data;
};
