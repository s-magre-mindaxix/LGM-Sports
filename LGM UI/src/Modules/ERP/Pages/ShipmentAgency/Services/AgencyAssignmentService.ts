import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {ShipmentAgencyAssignment, Agency, ShipmentDropdowns } from "./types";

export const getAssignments = async (): Promise<ShipmentAgencyAssignment[]> => {
    const res = await apiClient.get(API_ENDPOINTS.ShipmentAgencyAssignment);
    return Array.isArray(res.data) ? res.data : (res.data.data || []);
};

export const createAssignment = async (data: any) => {
    return await apiClient.post(API_ENDPOINTS.ShipmentAgencyAssignment, data);
};

export const updateAssignment = async (data: any) => {
    return await apiClient.put(API_ENDPOINTS.ShipmentAgencyAssignment, data);
};

export const deleteAssignment = async (id: number) => {
    await apiClient.delete(`${API_ENDPOINTS.ShipmentAgencyAssignment}/${id}`);
};

// To fill the dropdowns in the form
export const getAgenciesForDropdown = async (): Promise<Agency[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Agency); // Ensure this endpoint exists
    return Array.isArray(res.data) ? res.data : (res.data.data || []);
};

export const getShipmentsForDropdown = async (): Promise<ShipmentDropdowns[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentAgencyAssignment}/shipment-dropdown`); 
        return Array.isArray(res.data) ? res.data : (res.data.data || []);
};

export const getShipmentDetails = async (id: number): Promise<any> => {
    const res = await apiClient.get(`${API_ENDPOINTS.ShipmentAgencyAssignment}/shipment-details/${id}`);
    return res.data;
};

export const getAgencyDetails = async (agencyId: number) => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ShipmentAgencyAssignment}/GetAgencyDetails/${agencyId}`
  );

  return response.data;
};

export const uploadAgencyDocument = async (
  agencyId: number,
    shipmentInitiateId: number,
  files: File[]
) => {
  const formData = new FormData();

  formData.append("AgencyId", agencyId.toString());
  formData.append("ShipmentInitiateId",  shipmentInitiateId.toString());




  files.forEach((file) => {
    formData.append("Documents", file);
  });

  return await apiClient.post(
    `${API_ENDPOINTS.ShipmentAgencyAssignment}/UploadAgencyDocument`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};