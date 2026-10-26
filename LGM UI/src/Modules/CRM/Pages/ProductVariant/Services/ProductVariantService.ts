import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ProductVariant, ProductVariantListItem } from "./types";

const ENDPOINT = API_ENDPOINTS.ProductVariant || "/ProductVariants";

export const getProductVariants = async (): Promise<ProductVariantListItem[]> => {
  const response = await apiClient.get(ENDPOINT);
  const data = Array.isArray(response.data)
    ? response.data
    : response.data?.data ?? [];

  return data.map((item: Record<string, unknown>) => ({
    id: Number(item.id ?? item.Id ?? 0),
    productId: Number(item.productId ?? item.ProductId ?? 0),
    productName: String(item.productName ?? item.ProductName ?? ""),
    variantName: String(item.variantName ?? item.VariantName ?? ""),
    variantCode: String(item.variantCode ?? item.VariantCode ?? ""),
    attributes: String(item.attributes ?? item.Attributes ?? ""),
    active: Boolean(item.active ?? item.Active ?? true),
    isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
  })).filter((item: ProductVariantListItem) => !item.isDeleted);
};

export const getProductVariantById = async (id: number): Promise<ProductVariant> => {
  const response = await apiClient.get(`${ENDPOINT}/${id}`);
  const item = response.data;
  return {
    id: Number(item.id ?? item.Id ?? 0),
    productId: Number(item.productId ?? item.ProductId ?? 0),
    variantName: String(item.variantName ?? item.VariantName ?? ""),
    variantCode: String(item.variantCode ?? item.VariantCode ?? ""),
    attributes: item.attributes ?? item.Attributes ?? "",
    active: Boolean(item.active ?? item.Active ?? true),
    isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
  };
};

export const saveProductVariant = async (data: ProductVariant): Promise<void> => {
  const payload = {
    id: data.id || 0,
    productId: data.productId,
    variantName: data.variantName.trim(),
    variantCode: data.variantCode.trim(),
    attributes: data.attributes?.trim() || null,
    active: data.active,
    isDeleted: data.isDeleted ?? false,
  };

  if (data.id > 0) {
    await apiClient.put(`${ENDPOINT}/${data.id}`, payload);
  } else {
    await apiClient.post(ENDPOINT, payload);
  }
};

export const deleteProductVariant = async (id: number): Promise<void> => {
  await apiClient.delete(`${ENDPOINT}/${id}`);
};
