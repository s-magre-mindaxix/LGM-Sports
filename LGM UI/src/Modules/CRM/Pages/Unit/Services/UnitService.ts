import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Unit, UnitListItem } from "./types";

const normalizeUnit = (item: any): Unit => ({
    unitId: item.unitId ?? item.UnitId ?? 0,
    code: item.code ?? item.Code ?? item.unitCode ?? item.UnitCode ?? "",
    name: item.name ?? item.Name ?? item.unitName ?? item.UnitName ?? "",
    decimalAllowed:
        item.decimalAllowed ?? item.DecimalAllowed ?? false,
    isActive: item.isActive ?? item.IsActive ?? true,
});

export const getUnits = async (): Promise<UnitListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Unit);
    const data = res.data?.data ?? res.data;

    return Array.isArray(data) ? data.map(normalizeUnit) : [];
};

// Generate a code from the first word of the unit name.
// Examples: "Kilogram Weight" -> KILO001, "Meter" -> METER001.
export const getGeneratedUnitCode = async (
    unitName: string,
    excludeUnitId = 0,
): Promise<string> => {
    const firstWord = unitName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const units = await getUnits();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = units
        .filter((unit) => unit.unitId !== excludeUnitId)
        .map((unit) => unit.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getUnitById = async (id: number): Promise<Unit> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Unit}/${id}`);
    const item = res.data?.data ?? res.data;

    if (!item || typeof item !== "object") {
        throw new Error("Unit details were not returned by the API.");
    }

    return normalizeUnit(item);
};

export const saveUnit = async (data: Unit): Promise<void> => {
    const unitCode =
        data.unitId > 0
            ? data.code.trim()
            : data.code.trim() || await getGeneratedUnitCode(data.name);

    const payload = {
        unitId: data.unitId || 0,
        unitCode,
        unitName: data.name.trim(),
        decimalAllowed: data.decimalAllowed,
        isActive: data.isActive,
    };

    if (data.unitId > 0) {
        await apiClient.put(`${API_ENDPOINTS.Unit}/${data.unitId}`, payload);
    } else {
        await apiClient.post(API_ENDPOINTS.Unit, payload);
    }
};

export const deleteUnit = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Unit}/${id}`);
};