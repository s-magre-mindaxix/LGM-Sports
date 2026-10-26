import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";


export interface WorkLocation {
  id: number;
  locationName: string;
  locationCode: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface WorkLocationDto {
  locationName: string;
  locationCode: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

export const getAllLocations = async (): Promise<WorkLocation[]> => {
  const response = await apiClient.get<WorkLocation[]>(
    API_ENDPOINTS.WorkLocations
  );
  return response.data;
};

export const createLocation = async (
  data: WorkLocationDto
): Promise<WorkLocation> => {
  const response = await apiClient.post<WorkLocation>(
    API_ENDPOINTS.WorkLocations,
    data
  );
  return response.data;
};

export const updateLocation = async (id: number, data: WorkLocationDto): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.WorkLocations}/${id}`, data);
};

export const deleteLocation = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.WorkLocations}/${id}`);
};
