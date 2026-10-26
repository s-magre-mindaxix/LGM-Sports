import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { AccessoryPrice, AccessoryPriceListItem } from "./types";

const endpoint = API_ENDPOINTS.AccessoryPrice;

export const getAccessoryPrices = async (): Promise<AccessoryPriceListItem[]> => {
  const response = await apiClient.get(endpoint);
  return response.data;
};

export const getAccessoryPriceById = async (id: number): Promise<AccessoryPrice> => {
  const response = await apiClient.get(`${endpoint}/${id}`);
  return response.data;
};

export const saveAccessoryPrice = async (data: AccessoryPrice): Promise<void> => {
  const payload = {
    accessoryPriceId: data.accessoryPriceId || 0,
    priceListId: data.priceListId,
    accessoryId: data.accessoryId,
    accessoriesId: data.accessoriesId,
    priceType: data.priceType.trim(),
    amount: Number(data.amount),
    minQty: Number(data.minQty),
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo || null,
    isActive: data.isActive,
    isDeleted: data.isDeleted ?? false,
  };

  if (data.accessoryPriceId > 0) {
    await apiClient.put(`${endpoint}/${data.accessoryPriceId}`, payload);
  } else {
    await apiClient.post(endpoint, payload);
  }
};

export const deleteAccessoryPrice = async (id: number): Promise<void> => {
  await apiClient.delete(`${endpoint}/${id}`);
};


