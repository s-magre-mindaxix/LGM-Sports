export interface ShipmentTransitStatusReportDto {
    shipmentNo: string;
    customerName: string;
    containerNo: string | null;
    vesselFlightNo: string | null;
    portOfLoading: string | null;
    portOfDischarge: string | null;
    destination: string | null;
    departureDate: string | null;
    expectedArrivalDate: string | null;
    finalDeliveryDate: string | null;
    status: string;
}

export interface ShipmentTransitSummary {
    totalShipments: number;
    inTransit: number;
    delivered: number;
    pending: number;
}