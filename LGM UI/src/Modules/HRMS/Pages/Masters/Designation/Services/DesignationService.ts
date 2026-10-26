import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface Designation {
  id: number;
  designationName: string;
}

export interface DesignationCreatePayload {
  designationName: string;
}

export const getAllDesignations = async (): Promise<Designation[]> => {
  const response = await apiClient.get<Designation[]>(API_ENDPOINTS.Designations);
  return response.data.map(d => ({ id: d.id, designationName: d.designationName }));
};

export const createDesignation = async (payload: DesignationCreatePayload): Promise<Designation> => {
  const response = await apiClient.post<Designation>(API_ENDPOINTS.Designations, payload);
  return { id: response.data.id, designationName: response.data.designationName };
};

export const updateDesignation = async (id: number, payload: DesignationCreatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Designations}/${id}`, payload);
};

export const deleteDesignation = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Designations}/${id}`);
};