import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { PriceList, PriceListListItem } from "./types";

const endpoint = API_ENDPOINTS.PriceList;

export const getPriceLists = async (): Promise<PriceListListItem[]> => {
    const response = await apiClient.get(endpoint);
    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
};

// Generate a code from the first word of the price list name.
export const getGeneratedPriceListCode = async (
    priceListName: string,
    excludePriceListId = 0,
): Promise<string> => {
    const firstWord = priceListName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const priceLists = await getPriceLists();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = priceLists
        .filter((priceList) => priceList.priceListId !== excludePriceListId)
        .map((priceList) => priceList.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getPriceListById = async (id: number): Promise<PriceList> => {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data?.data ?? response.data;
};

export const savePriceList = async (data: PriceList): Promise<void> => {
    const code =
        data.priceListId > 0
            ? data.code.trim()
            : data.code.trim() || await getGeneratedPriceListCode(data.name);

    const payload = {
        priceListId: data.priceListId || 0,
        code,
        name: data.name.trim(),
        customerChannelType: data.customerChannelType.trim(),
        id: Number(data.id),
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || null,
        isActive: data.isActive,
        isDeleted: data.isDeleted ?? false,
    };

    if (data.priceListId > 0) {
        await apiClient.put(`${endpoint}/${data.priceListId}`, payload);
    } else {
        await apiClient.post(endpoint, payload);
    }
};

export const deletePriceList = async (id: number): Promise<void> => {
    await apiClient.delete(`${endpoint}/${id}`);
};