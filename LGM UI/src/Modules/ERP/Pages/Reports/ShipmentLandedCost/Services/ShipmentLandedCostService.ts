import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { ShipmentLandedCostResponseDto } from "./types";

const ENDPOINT = API_ENDPOINTS.Report;

export const getShipmentLandedCostReport = async (): Promise<ShipmentLandedCostResponseDto> => {
    const res = await apiClient.get(
        `${ENDPOINT}/shipment-landed-cost`
    );

    return res.data;
};