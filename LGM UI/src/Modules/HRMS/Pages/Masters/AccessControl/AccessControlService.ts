import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface Permission {
  id: number;
  roleId: string;  
  systemName: string;
  formName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const getPermissionsByRole = async (
  roleId: string,
  systemName: string
): Promise<Permission[]> => {
  const response = await apiClient.get<Permission[]>(
    `${API_ENDPOINTS.AccessControl}/${roleId}?systemName=${systemName}`
  );
  return response.data;
};


export const deletePermission = async (
  roleId: string,
  systemName: string,
  formName: string
): Promise<void> => {
  await apiClient.delete(
    `${API_ENDPOINTS.AccessControl}/${roleId}?systemName=${systemName}&formName=${formName}`
  );
};

export const updatePermissions = async (
  roleId: string,
  systemName: string,
  permissions: Permission[]
): Promise<{ message: string }> => {
  const response = await apiClient.put(
    `${API_ENDPOINTS.AccessControl}/${roleId}`,
    {
      systemName: systemName,
      permissions: permissions,
    }
  );
  return response.data;
};


