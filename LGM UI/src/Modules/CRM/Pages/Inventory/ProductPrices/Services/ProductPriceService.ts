import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ProductPrice, ProductPriceListItem } from "./types";

const endpoint = API_ENDPOINTS.ProductPrice;
export const getProductPrices = async (): Promise<ProductPriceListItem[]> => (await apiClient.get(endpoint)).data;
export const getProductPriceById = async (id: number): Promise<ProductPrice> => (await apiClient.get(`${endpoint}/${id}`)).data;
export const saveProductPrice = async (data: ProductPrice): Promise<void> => {
  const payload = {
    productPriceId: data.productPriceId || 0,
    priceListId: Number(data.priceListId),
    productId: Number(data.productId),
    priceType: data.priceType.trim(),
    amount: Number(data.amount),
    minQty: Number(data.minQty),
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo || null,
    isActive: data.isActive,
    isDeleted: data.isDeleted ?? false,
  };
  if (data.productPriceId > 0) await apiClient.put(`${endpoint}/${data.productPriceId}`, payload);
  else await apiClient.post(endpoint, payload);
};
export const deleteProductPrice = async (id: number): Promise<void> => { await apiClient.delete(`${endpoint}/${id}`); };
