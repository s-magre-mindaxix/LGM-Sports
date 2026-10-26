import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ShipmentStatusReportDto } from "./types";

const ENDPOINT = API_ENDPOINTS.Report;

export const getShipmentStatusReport = async (): Promise<ShipmentStatusReportDto[]> => {
    const res = await apiClient.get(`${ENDPOINT}/shipment-status`);
    return res.data;
};