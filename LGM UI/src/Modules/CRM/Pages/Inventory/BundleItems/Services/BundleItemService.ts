import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { BundleItem, BundleItemListItem } from "./types";

const endpoint = API_ENDPOINTS.BundleItem;
export const getBundleItems = async (): Promise<BundleItemListItem[]> => (await apiClient.get(endpoint)).data;
export const getBundleItemById = async (id: number): Promise<BundleItem> => (await apiClient.get(`${endpoint}/${id}`)).data;
export const saveBundleItem = async (data: BundleItem): Promise<void> => {
  const payload = {
    bundleItemId: data.bundleItemId || 0,
    bundleId: Number(data.bundleId),
    quantity: Number(data.quantity),
    pricingType: data.pricingType.trim(),
    allocatedPrice: Number(data.allocatedPrice),
    isOptional: data.isOptional,
    isDeleted: data.isDeleted ?? false,
    accessoriesId: data.accessoriesId ? Number(data.accessoriesId) : null,
  };
  if (data.bundleItemId > 0) await apiClient.put(`${endpoint}/${data.bundleItemId}`, payload);
  else await apiClient.post(endpoint, payload);
};
export const deleteBundleItem = async (id: number): Promise<void> => { await apiClient.delete(`${endpoint}/${id}`); };
