import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { PaymentMethod, PaymentMethodListItem } from "./types";

const endpoint = API_ENDPOINTS.PaymentMethod;

export const getPaymentMethods = async (): Promise<PaymentMethodListItem[]> => {
    const response = await apiClient.get(endpoint);
    const data = response.data?.data ?? response.data;

    return Array.isArray(data) ? data : [];
};

export const getGeneratedPaymentMethodCode = async (
    name: string,
    excludePaymentMethodId = 0,
): Promise<string> => {
    const firstWord = name
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const methods = await getPaymentMethods();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = methods
        .filter((method) => method.paymentMethodId !== excludePaymentMethodId)
        .map((method) => method.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getPaymentMethodById = async (
    id: number,
): Promise<PaymentMethod> => {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data?.data ?? response.data;
};

export const savePaymentMethod = async (
    data: PaymentMethod,
): Promise<void> => {
    const code =
        data.paymentMethodId > 0
            ? data.code.trim()
            : data.code.trim() ||
              await getGeneratedPaymentMethodCode(data.name);

    const payload = {
        paymentMethodId: data.paymentMethodId || 0,
        code,
        name: data.name.trim(),
        isActive: data.isActive,
        isDeleted: data.isDeleted ?? false,
    };

    if (data.paymentMethodId > 0) {
        await apiClient.put(
            `${endpoint}/${data.paymentMethodId}`,
            payload,
        );
    } else {
        await apiClient.post(endpoint, payload);
    }
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
    await apiClient.delete(`${endpoint}/${id}`);
};