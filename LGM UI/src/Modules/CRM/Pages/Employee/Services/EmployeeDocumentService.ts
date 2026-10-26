// src/components/EmployeeMaster/EmployeeDocumentService.ts
import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

export interface EmployeeDocument {
  id: number;
  employeeID: number;
  documentName: string;
  filePath: string; 
  uploadedDate: string;
}

export const getDocumentsByEmployeeId = async (
  employeeId: number
): Promise<EmployeeDocument[]> => {
  try {
    const response = await apiClient.get<EmployeeDocument[]>(
      `${API_ENDPOINTS.EmployeeDocuments}/by-employee/${employeeId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch documents for employee ${employeeId}:`,
      error
    );
    throw new Error("Could not fetch documents.");
  }
};

export const uploadDocument = async (
  payload: FormData
): Promise<EmployeeDocument> => {
  try {
    const response = await apiClient.post<EmployeeDocument>(
      `${API_ENDPOINTS.EmployeeDocuments}/upload`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload document:", error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to upload document.");
  }
};

export const deleteDocument = async (
  documentId: number
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.EmployeeDocuments}/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to delete document ${documentId}:`, error);
    throw new Error("Failed to delete document.");
  }
};

export const downloadDocument = async (documentId: number): Promise<Blob> => {
    try {
        const response = await apiClient.get<Blob>(`${API_ENDPOINTS.EmployeeDocuments}/download/${documentId}`, {
            responseType: 'blob', 
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to download document ${documentId}:`, error);
        throw new Error("Could not download the document.");
    }
};

export const updateDocumentName = async (documentId: number, newDocumentName: string): Promise<{ message: string }> => {
    try {
        const payload = { newDocumentName };
        const response = await apiClient.put<{ message: string }>(`${API_ENDPOINTS.EmployeeDocuments}/${documentId}/update-name`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update name for document ${documentId}:`, error);
        throw new Error("Failed to update document name.");
    }
};