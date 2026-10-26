import { AxiosError } from "axios";
import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface Role {
  id: string;
  name: string;
}

export interface RoleCreatePayload {
  name: string;
}
export interface RoleUpdatePayload {
  name: string;
}

export const getAllRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>(API_ENDPOINTS.Roles);
  return response.data;
};

export const createRole = async (payload: RoleCreatePayload): Promise<Role> => {
  const response = await apiClient.post<{ role: Role }>(API_ENDPOINTS.Roles, payload);
  return response.data.role;
};
export const updateRole = async (id: string, payload: RoleUpdatePayload): Promise<void> => {
    try {
        await apiClient.put(`${API_ENDPOINTS.Roles}/${id}`, payload);
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.data?.errors) {
            const messages = error.response.data.errors.join(', ');
            throw new Error(messages);
        }
        throw new Error("An unexpected error occurred while updating the role.");
    }
};


export const deleteRole = async (roleName: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Roles}/${roleName}`);
};