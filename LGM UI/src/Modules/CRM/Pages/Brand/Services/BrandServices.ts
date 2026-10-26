
// import apiClient from "../../../../../API/apiClient";
// import { API_ENDPOINTS } from "../../../../../API/apiConfig";
// import type { Brand } from "./types";

// // Normalize backend response to frontend Brand type
// const normalizeBrand = (item: any): Brand => ({
//     brandId: item.brandId ?? item.BrandId ?? 0,
//     code: item.brandCode ?? item.BrandCode ?? item.code ?? item.Code ?? "",
//     name: item.brandName ?? item.BrandName ?? item.name ?? item.Name ?? "",
//     description: item.description ?? item.Description ?? "",
//     isActive: item.isActive ?? item.IsActive ?? true,
// });

// // Get all brands
// export const getBrands = async (): Promise<Brand[]> => {
//     const response = await apiClient.get(API_ENDPOINTS.Brand);

//     return (response.data as any[]).map(normalizeBrand);
// };

// // Get brand by ID
// export const getBrandById = async (id: number): Promise<Brand> => {
//     const response = await apiClient.get(`${API_ENDPOINTS.Brand}/${id}`);

//     return normalizeBrand(response.data);
// };

// // Create or update brand
// export const saveBrand = async (data: Brand): Promise<void> => {
//     const payload = {
//         brandId: data.brandId ?? 0,
//         brandCode: data.code.trim(),
//         brandName: data.name.trim(),
//         description: data.description?.trim() || null,
//         isActive: data.isActive,
//     };

//     if (data.brandId > 0) {
//         await apiClient.put(
//             `${API_ENDPOINTS.Brand}/${data.brandId}`,
//             payload
//         );
//     } else {
//         await apiClient.post(
//             API_ENDPOINTS.Brand,
//             payload
//         );
//     }
// };

// // Delete brand (soft delete handled by backend)
// export const deleteBrand = async (id: number): Promise<void> => {
//     await apiClient.delete(`${API_ENDPOINTS.Brand}/${id}`);
// };



 import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Brand } from "./types";

// Normalize backend response to frontend Brand type
const normalizeBrand = (item: any): Brand => ({
    brandId: item.brandId ?? item.BrandId ?? 0,
    code: item.brandCode ?? item.BrandCode ?? item.code ?? item.Code ?? "",
    name: item.brandName ?? item.BrandName ?? item.name ?? item.Name ?? "",
    description: item.description ?? item.Description ?? "",
    isActive: item.isActive ?? item.IsActive ?? true,
});

// Get all brands
export const getBrands = async (): Promise<Brand[]> => {
    const response = await apiClient.get(API_ENDPOINTS.Brand);
    const items = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];

    return items.map(normalizeBrand);
};

// Get brand by ID
export const getBrandById = async (id: number): Promise<Brand> => {
    const response = await apiClient.get(`${API_ENDPOINTS.Brand}/${id}`);
    return normalizeBrand(response.data);
};

/**
 * Generate a code from the first word of the brand name.
 * Examples: "Pune Industries" -> PUNE001, "MindAxis Innovation" -> MINDA001.
 * Existing codes are checked so the next available suffix is used.
 */
export const getGeneratedBrandCode = async (
    brandName: string,
    excludeBrandId = 0,
): Promise<string> => {
    const firstWord = brandName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord.slice(0, firstWord.length <= 4 ? 4 : 5).toUpperCase();
    const brands = await getBrands();
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const codePattern = new RegExp(`^${escapedPrefix}(\\d+)$`, "i");

    const usedNumbers = brands
        .filter((brand) => brand.brandId !== excludeBrandId)
        .map((brand) => brand.code.match(codePattern))
        .filter((match): match is RegExpMatchArray => match !== null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) nextNumber += 1;

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

// Create or update brand
export const saveBrand = async (data: Brand): Promise<void> => {
    const payload = {
        brandId: data.brandId ?? 0,
        brandCode: data.code.trim(),
        brandName: data.name.trim(),
        description: data.description?.trim() || null,
        isActive: data.isActive,
    };

    if (data.brandId > 0) {
        await apiClient.put(`${API_ENDPOINTS.Brand}/${data.brandId}`, payload);
    } else {
        await apiClient.post(API_ENDPOINTS.Brand, payload);
    }
};

// Delete brand (soft delete handled by backend)
export const deleteBrand = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Brand}/${id}`);
};
