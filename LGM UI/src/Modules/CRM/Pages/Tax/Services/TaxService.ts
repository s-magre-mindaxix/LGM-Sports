import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Tax, TaxListItem } from "./types";

const normalizeTax = (item: any): Tax => ({
    taxId: item?.taxId ?? item?.TaxId ?? 0,
    code:
        item?.code ??
        item?.Code ??
        item?.taxCode ??
        item?.TaxCode ??
        "",
    name:
        item?.name ??
        item?.Name ??
        item?.taxName ??
        item?.TaxName ??
        "",
    rate: Number(item?.rate ?? item?.Rate ?? 0),
    taxType: item?.taxType ?? item?.TaxType ?? "",
    effectiveFrom: item?.effectiveFrom ?? item?.EffectiveFrom ?? "",
    effectiveTo: item?.effectiveTo ?? item?.EffectiveTo ?? "",
    isActive: item?.isActive ?? item?.IsActive ?? true,
});

export const getTaxes = async (): Promise<TaxListItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.Tax);
    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data.map(normalizeTax) : [];
};

// Generate a code from the first word of the tax name.
export const getGeneratedTaxCode = async (
    taxName: string,
    excludeTaxId = 0,
): Promise<string> => {
    const firstWord = taxName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const taxes = await getTaxes();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = taxes
        .filter((tax) => tax.taxId !== excludeTaxId)
        .map((tax) => tax.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getTaxById = async (id: number): Promise<Tax> => {
    const response = await apiClient.get(`${API_ENDPOINTS.Tax}/${id}`);
    const item = response.data?.data ?? response.data;

    if (!item || typeof item !== "object") {
        throw new Error("Tax details were not returned by the API.");
    }

    return normalizeTax(item);
};

export const saveTax = async (data: Tax): Promise<void> => {
    const taxCode =
        data.taxId > 0
            ? data.code.trim()
            : data.code.trim() || await getGeneratedTaxCode(data.name);

    const payload = {
        taxId: data.taxId || 0,
        taxCode,
        taxName: data.name.trim(),
        rate: Number(data.rate),
        taxType: data.taxType,
        effectiveFrom: data.effectiveFrom
            ? `${data.effectiveFrom.slice(0, 10)}T00:00:00`
            : null,
        effectiveTo: data.effectiveTo
            ? `${data.effectiveTo.slice(0, 10)}T00:00:00`
            : null,
        isActive: data.isActive,
    };

    if (!payload.effectiveFrom) {
        throw new Error("Please select Effective From date.");
    }

    if (data.taxId > 0) {
        await apiClient.put(`${API_ENDPOINTS.Tax}/${data.taxId}`, payload);
    } else {
        await apiClient.post(API_ENDPOINTS.Tax, payload);
    }
};

export const deleteTax = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Tax}/${id}`);
};