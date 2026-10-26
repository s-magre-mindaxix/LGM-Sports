import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ShipmentTransitStatusReportDto } from "./types";

const ENDPOINT = API_ENDPOINTS.Report;

export const getShipmentTransitStatusReport = async (): Promise<ShipmentTransitStatusReportDto[]> => {
    const res = await apiClient.get(`${ENDPOINT}/shipment-transit-status`);
    return res.data;
};