export interface ShipmentStatusReportDto {
    shipmentInitiateId: number;
    shipmentNo: string;
    customerName: string | null;
    invoiceNo: string | null;
    invoiceValue: number | null;
    currencyName: string | null;
    shipmentDate: string;
    status: string;
    totalNetWeightKg: number;
    totalGrossWeightKg: number;
    totalCBM: number;
}

export interface ShipmentStatusSummary {
    totalShipments: number;
     shipmentInitiated: number;
  shipmentInTransit: number;
  shipmentClosed: number;
}