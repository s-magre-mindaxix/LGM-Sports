import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { DocumentSeries, DocumentSeriesListItem } from "./types";

const endpoint = API_ENDPOINTS.DocumentSeries;
export const getDocumentSeries = async (): Promise<DocumentSeriesListItem[]> => (await apiClient.get(endpoint)).data;
export const getDocumentSeriesById = async (id: number): Promise<DocumentSeries> => (await apiClient.get(`${endpoint}/${id}`)).data;
export const saveDocumentSeries = async (data: DocumentSeries): Promise<void> => {
  const payload = {
    documentSeriesId: data.documentSeriesId || 0,
    documentType: data.documentType.trim(),
    prefix: data.prefix.trim(),
    nextNumber: Number(data.nextNumber),
    financialYear: data.financialYear.trim(),
    branchId: Number(data.branchId),
    isDeleted: data.isDeleted ?? false,
  };
  if (data.documentSeriesId > 0) await apiClient.put(`${endpoint}/${data.documentSeriesId}`, payload);
  else await apiClient.post(endpoint, payload);
};
export const deleteDocumentSeries = async (id: number): Promise<void> => { await apiClient.delete(`${endpoint}/${id}`); };
