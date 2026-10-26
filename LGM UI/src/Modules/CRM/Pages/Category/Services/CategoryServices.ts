import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Category, CategoryListItem } from "./types";

const endpoint = API_ENDPOINTS.Category;

const normalizeCategory = (item: any): CategoryListItem => ({
  categoryId: Number(item?.categoryId ?? item?.CategoryId ?? 0),
  code: String(item?.code ?? item?.Code ?? ""),
  categoryName: String(
    item?.categoryName ?? item?.CategoryName ?? item?.name ?? item?.Name ?? "",
  ),
  parentCategoryId: item?.parentCategoryId ?? item?.ParentCategoryId ?? null,
  parentCategoryName:
    item?.parentCategoryName ??
    item?.ParentCategoryName ??
    item?.parentCategory?.categoryName ??
    item?.ParentCategory?.CategoryName ??
    null,
  description: String(item?.description ?? item?.Description ?? ""),
  isActive: item?.isActive ?? item?.IsActive ?? true,
  isDeleted: item?.isDeleted ?? item?.IsDeleted ?? false,
});

const getResponseData = (response: any): any =>
  response?.data?.data ??
  response?.data?.items ??
  response?.data?.Items ??
  response?.data;

export const getCategories = async (): Promise<CategoryListItem[]> => {
  const response = await apiClient.get(endpoint);
  const result = getResponseData(response);
  return Array.isArray(result) ? result.map(normalizeCategory) : [];
};

// Generate a unique code from the first word in the category name.
// Examples: "Electrical Parts" -> ELEC001, "Safety Equipment" -> SAFET001.
export const getGeneratedCategoryCode = async (
  categoryName: string,
  excludeCategoryId = 0,
): Promise<string> => {
  const firstWord =
    categoryName.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

  if (!firstWord) return "";

  const prefix = firstWord
    .slice(0, firstWord.length <= 4 ? 4 : 5)
    .toUpperCase();
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const codePattern = new RegExp(`^${escapedPrefix}(\\d+)$`, "i");
  const categories = await getCategories();

  const usedNumbers = categories
    .filter((category) => category.categoryId !== excludeCategoryId)
    .map((category) => category.code.match(codePattern))
    .filter(
      (match): match is RegExpMatchArray =>
        match !== null && match !== undefined,
    )
    .map((match) => Number(match[1]))
    .filter((number) => Number.isFinite(number));

  let nextNumber = 1;
  while (usedNumbers.includes(nextNumber)) nextNumber += 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getCategoryById = async (
  id: number,
): Promise<CategoryListItem> => {
  const response = await apiClient.get(`${endpoint}/${id}`);
  const result = getResponseData(response);

  if (!result || typeof result !== "object") {
    throw new Error("Category details were not returned by the API.");
  }

  return normalizeCategory(result);
};

export const saveCategory = async (data: Category): Promise<void> => {
  const code =
    data.categoryId > 0
      ? data.code.trim()
      : data.code.trim() ||
        (await getGeneratedCategoryCode(data.categoryName));

  const payload = {
    categoryId: data.categoryId || 0,
    code,
    categoryName: data.categoryName.trim(),
    parentCategoryId: data.parentCategoryId || null,
    description: data.description.trim() || null,
    isActive: data.isActive,
    isDeleted: data.isDeleted ?? false,
  };

  if (data.categoryId > 0) {
    await apiClient.put(`${endpoint}/${data.categoryId}`, payload);
  } else {
    await apiClient.post(endpoint, payload);
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`${endpoint}/${id}`);
};

