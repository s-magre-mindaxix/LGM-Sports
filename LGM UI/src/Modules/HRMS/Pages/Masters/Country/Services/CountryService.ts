import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface Country {
  id: number;
  countryName: string;
  countryCode: string;
}

export interface CountryPayload {
  countryName: string;
  countryCode: string;
}

export const getAllCountries = async (): Promise<Country[]> => {
  const res = await apiClient.get<Country[]>(API_ENDPOINTS.Country);
  return res.data;
};

export const createCountry = async (payload: CountryPayload) => {
  await apiClient.post(API_ENDPOINTS.Country, payload);
};

export const updateCountry = async (id: number, payload: CountryPayload) => {
  await apiClient.put(`${API_ENDPOINTS.Country}/${id}`, payload);
};

export const deleteCountry = async (id: number) => {
  await apiClient.delete(`${API_ENDPOINTS.Country}/${id}`);
};
