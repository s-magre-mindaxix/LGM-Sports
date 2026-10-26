import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface State {
  id: number;
  stateName: string;
  countryId: number;
}

export const getAllStates = async (): Promise<State[]> => {
  const res = await apiClient.get(API_ENDPOINTS.State);
  return res.data;
};

export const createState = async (payload: { stateName: string; countryId: number }) => {
  await apiClient.post(API_ENDPOINTS.State, payload);
};

export const updateState = async (id: number, payload: any) => {
  await apiClient.put(`${API_ENDPOINTS.State}/${id}`, payload);
};

export const deleteState = async (id: number) => {
  await apiClient.delete(`${API_ENDPOINTS.State}/${id}`);
};
