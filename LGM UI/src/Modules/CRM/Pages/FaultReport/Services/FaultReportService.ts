import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { FaultReport } from "./types";

// Note: No FormData is needed since FaultReports do not have file attachments.
export const getFaultReports = async (): Promise<FaultReport[]> => {
    const response = await apiClient.get<FaultReport[]>(API_ENDPOINTS.FaultReports);
    return response.data;
};

export const getFaultReportById = async (id: number): Promise<FaultReport> => {
    const response = await apiClient.get<FaultReport>(`${API_ENDPOINTS.FaultReports}/${id}`);
    return response.data;
};

// export const createFaultReport = async (data: FaultReport): Promise<FaultReport> => {
//     const response = await apiClient.post<FaultReport>(API_ENDPOINTS.FaultReports, data, {
//         headers: { 'Content-Type': 'application/json' },
//     });
//     return response.data;
// };

const createFaultReportFormData = (data: FaultReport): FormData => {
  const formData = new FormData();

  formData.append("Id", data.id.toString());
  formData.append("Device", data.device || "");
  formData.append("CustomerId", data.customerId.toString());
  formData.append("CustomerName", data.customerName || ""); // ✅ ADD THIS

  formData.append("SerialNumber", data.serialNumber || "");
  formData.append("Firmware", data.firmware || "");
  formData.append("Software", data.software || "");
  formData.append("SoftwareVersion", data.softwareVersion || "");
  formData.append("SpecialSoftware", data.specialSoftware || "");
  formData.append("Configuration", data.configuration || "");
  formData.append("PowerSource", data.powerSource || "");
  formData.append("CabelsConnected", data.cabelsConnected || "");
  formData.append("ModulesConnected", data.modulesConnected || "");
  formData.append("ModulesFirmware", data.modulesFirmware || "");
  formData.append("Voltage", data.voltage || "");
  formData.append("LED", data.led || "");
  formData.append("InternalBattery", data.internalBattery || "");
  formData.append("GpsBattery", data.gpsBattery || "");

  formData.append("ColdStarted", String(data.coldStarted));
  formData.append("DefaultReset", String(data.defaultReset));
  formData.append("SettingChecked", String(data.settingChecked));
  formData.append("FirmwareUpdated", String(data.firmwareUpdated));

  formData.append("Notes", data.notes || "");
  formData.append("Comments", data.comments || "");

  // ✅ IMPORTANT FIX (Backend requires it)
  formData.append("UploadedFiles", data.uploadedFiles || "");

  // ✅ FILES
  if (data.reportFiles?.length) {
    data.reportFiles.forEach((file) => {
      formData.append("ReportFiles", file);
    });
  }

  return formData;
};

export const createFaultReport = async (data: FaultReport) => {
  const formData = createFaultReportFormData(data);

  return await apiClient.post(API_ENDPOINTS.FaultReports, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// export const updateFaultReport = async (id: number, data: FaultReport): Promise<void> => {
//     await apiClient.put(`${API_ENDPOINTS.FaultReports}/${id}`, data, {
//         headers: { 'Content-Type': 'application/json' },
//     });
// };

export const updateFaultReport = async (id: number, data: FaultReport) => {
  const formData = createFaultReportFormData(data);

  await apiClient.put(`${API_ENDPOINTS.FaultReports}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteFaultReport = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.FaultReports}/${id}`);
};

// Dropdown Data Services 
export const getAllCustomers = async (): Promise<{ id: number; customerName: string }[]> => {
    const response = await apiClient.get<{ id: number; customerName: string }[]>(API_ENDPOINTS.Customer);
    return response.data;
};