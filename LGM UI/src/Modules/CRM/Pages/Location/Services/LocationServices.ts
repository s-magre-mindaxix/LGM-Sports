import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Location, LocationListItem } from "./types";

const normalizeLocation = (item: any): LocationListItem => ({
    ...item,
    locationId: item.locationId ?? item.LocationId ?? 0,
    warehouseId: item.warehouseId ?? item.WarehouseId ?? 0,
    code:
        item.locationCode ??
        item.LocationCode ??
        item.code ??
        item.Code ??
        "",
    zone: item.zone ?? item.Zone ?? "",
    rack: item.rack ?? item.Rack ?? "",
    shelf: item.shelf ?? item.Shelf ?? "",
    bin: item.bin ?? item.Bin ?? "",
    isActive: item.isActive ?? item.IsActive ?? true,
});

// Get all locations
export const getLocations = async (): Promise<LocationListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Location);
    const items = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

    return items.map(normalizeLocation);
};

// Generate a code from the first word of the zone.
// Examples: "North Zone" -> NORTH001, "Pune" -> PUNE001.
export const getGeneratedLocationCode = async (
    zone: string,
    excludeLocationId = 0,
): Promise<string> => {
    const firstWord = zone
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const locations = await getLocations();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = locations
        .filter((location) => location.locationId !== excludeLocationId)
        .map((location) => location.code?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match != null)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

// Get location by ID
export const getLocationById = async (id: number): Promise<Location> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Location}/${id}`);
    return normalizeLocation(res.data) as Location;
};

// Create or update location
export const saveLocation = async (data: Location): Promise<void> => {
    const locationCode =
        data.locationId > 0
            ? data.code.trim()
            : data.code.trim() ||
              await getGeneratedLocationCode(data.zone ?? "");

    const payload = {
        locationId: data.locationId || 0,
        warehouseId: data.warehouseId,
        locationCode,
        zone: data.zone?.trim() || null,
        rack: data.rack?.trim() || null,
        shelf: data.shelf?.trim() || null,
        bin: data.bin?.trim() || null,
        isActive: data.isActive,
    };

    if (data.locationId > 0) {
        await apiClient.put(
            `${API_ENDPOINTS.Location}/${data.locationId}`,
            payload,
        );
    } else {
        await apiClient.post(API_ENDPOINTS.Location, payload);
    }
};

// Delete location
export const deleteLocation = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Location}/${id}`);
};
