import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Warehouse, WarehouseListItem } from "./types";

// Get all warehouses
export const getWarehouses = async (): Promise<WarehouseListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Warehouse);
    return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
};

// Generate a code from the first word of the warehouse name.
// Examples: "Pune Warehouse" -> PUNE001, "Central Storage" -> CENT001.
export const getGeneratedWarehouseCode = async (
    warehouseName: string,
    excludeWarehouseId = 0,
): Promise<string> => {
    const firstWord = warehouseName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const warehouses = await getWarehouses();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = warehouses
        .filter((warehouse) => warehouse.warehouseId !== excludeWarehouseId)
        .map((warehouse) => warehouse.warehouseCode?.match(codePattern))
        .filter(
            (match): match is RegExpMatchArray =>
                match !== null && match !== undefined,
        )
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

// Get warehouse by ID
export const getWarehouseById = async (id: number): Promise<Warehouse> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Warehouse}/${id}`);
    return res.data;
};

// Create or update warehouse
export const saveWarehouse = async (data: Warehouse): Promise<void> => {
    const warehouseCode =
        data.warehouseId > 0
            ? data.warehouseCode
            : data.warehouseCode ||
              await getGeneratedWarehouseCode(data.warehouseName);

    const payload = {
        warehouseId: data.warehouseId || 0,
        branchId: data.branchId,
        warehouseCode,
        warehouseName: data.warehouseName,
        type: data.type,
        isActive: data.isActive,
    };

    if (data.warehouseId > 0) {
        await apiClient.put(
            `${API_ENDPOINTS.Warehouse}/${data.warehouseId}`,
            payload,
        );
    } else {
        await apiClient.post(API_ENDPOINTS.Warehouse, payload);
    }
};

// Delete warehouse
export const deleteWarehouse = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Warehouse}/${id}`);
};