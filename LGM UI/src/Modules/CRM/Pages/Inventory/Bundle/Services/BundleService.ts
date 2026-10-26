import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { Bundle, BundleListItem } from "./type";

const endpoint = API_ENDPOINTS.Bundle;

export const getBundles = async (): Promise<BundleListItem[]> => {
    const response = await apiClient.get(endpoint);
    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
};

// Generate a code from the first word of the bundle name.
export const getGeneratedBundleCode = async (
    bundleName: string,
    excludeBundleId = 0,
): Promise<string> => {
    const firstWord = bundleName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const bundles = await getBundles();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = bundles
        .filter((bundle) => bundle.bundleId !== excludeBundleId)
        .map((bundle) => bundle.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getBundleById = async (id: number): Promise<Bundle> => {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data?.data ?? response.data;
};

export const saveBundle = async (data: Bundle): Promise<void> => {
    const code =
        data.bundleId > 0
            ? data.code.trim()
            : data.code.trim() || await getGeneratedBundleCode(data.name);

    const payload = {
        bundleId: data.bundleId || 0,
        code,
        name: data.name.trim(),
        parentProductId: Number(data.parentProductId),
        packagePrice: Number(data.packagePrice),
        taxMode: data.taxMode.trim(),
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || null,
        isActive: data.isActive,
        isDeleted: data.isDeleted ?? false,
    };

    if (data.bundleId > 0) {
        await apiClient.put(`${endpoint}/${data.bundleId}`, payload);
    } else {
        await apiClient.post(endpoint, payload);
    }
};

export const deleteBundle = async (id: number): Promise<void> => {
    await apiClient.delete(`${endpoint}/${id}`);
};