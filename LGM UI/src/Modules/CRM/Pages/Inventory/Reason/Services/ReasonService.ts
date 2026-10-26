import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { Reason, ReasonListItem } from "./types";

const endpoint = API_ENDPOINTS.Reason;

export const getReasons = async (): Promise<ReasonListItem[]> => {
    const response = await apiClient.get(endpoint);
    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
};

// Generate a code from the first word of the reason name.
export const getGeneratedReasonCode = async (
    reasonName: string,
    excludeReasonId = 0,
): Promise<string> => {
    const firstWord = reasonName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const reasons = await getReasons();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = reasons
        .filter((reason) => reason.reasonId !== excludeReasonId)
        .map((reason) => reason.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getReasonById = async (id: number): Promise<Reason> => {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data?.data ?? response.data;
};

export const saveReason = async (data: Reason): Promise<void> => {
    const code =
        data.reasonId > 0
            ? data.code.trim()
            : data.code.trim() || await getGeneratedReasonCode(data.name);

    const payload = {
        reasonId: data.reasonId || 0,
        code,
        name: data.name.trim(),
        reasonType: data.reasonType.trim(),
        isActive: data.isActive,
        isDeleted: data.isDeleted ?? false,
    };

    if (data.reasonId > 0) {
        await apiClient.put(`${endpoint}/${data.reasonId}`, payload);
    } else {
        await apiClient.post(endpoint, payload);
    }
};

export const deleteReason = async (id: number): Promise<void> => {
    await apiClient.delete(`${endpoint}/${id}`);
};