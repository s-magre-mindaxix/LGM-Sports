import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";


export interface Department {
  id: number;
  departmentName: string;
}

export interface DepartmentCreatePayload {
  departmentName: string;
}

export const getAllDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<Department[]>(API_ENDPOINTS.Departments);
  return response.data.map(d => ({ id: d.id, departmentName: d.departmentName }));
};

export const createDepartment = async (payload: DepartmentCreatePayload): Promise<Department> => {
  const response = await apiClient.post<Department>(API_ENDPOINTS.Departments, payload);
  return { id: response.data.id, departmentName: response.data.departmentName };
};

export const updateDepartment = async (id: number, payload: DepartmentCreatePayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Departments}/${id}`, payload);
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Departments}/${id}`);
};