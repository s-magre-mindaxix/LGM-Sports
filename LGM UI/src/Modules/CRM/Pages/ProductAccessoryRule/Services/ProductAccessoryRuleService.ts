import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ProductAccessoryRule, ProductAccessoryRuleListItem } from "./types";

const endpoint = API_ENDPOINTS.ProductAccessoryRule;
export const getProductAccessoryRules = async (): Promise<ProductAccessoryRuleListItem[]> => (await apiClient.get(endpoint)).data;
export const getProductAccessoryRuleById = async (id: number): Promise<ProductAccessoryRule> => (await apiClient.get(`${endpoint}/${id}`)).data;
export const saveProductAccessoryRule = async (data: ProductAccessoryRule): Promise<void> => {
  const payload = {
    id: data.id || 0,
    productId: Number(data.productId),
    accessoriesId: Number(data.accessoriesId),
    quantity: Number(data.quantity),
    mandatoryOptional: data.mandatoryOptional.trim(),
    pricingType: data.pricingType.trim(),
    defaultPrice: Number(data.defaultPrice),
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo || null,
    active: data.active,
    isDeleted: data.isDeleted ?? false,
  };
  if (data.id > 0) await apiClient.put(`${endpoint}/${data.id}`, payload);
  else await apiClient.post(endpoint, payload);
};
export const deleteProductAccessoryRule = async (id: number): Promise<void> => { await apiClient.delete(`${endpoint}/${id}`); };
