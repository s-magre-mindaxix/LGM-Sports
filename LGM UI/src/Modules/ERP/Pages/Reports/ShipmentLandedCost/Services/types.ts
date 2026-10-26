export interface ShipmentLandedCostFilterDto {
    shipmentNo?: string;
    customerName?: string;
    fromDate?: string;
    toDate?: string;
}

export interface ShipmentLandedCostReportDto {
    shipmentInitiateId: number;
    shipmentNo: string;
    customerName: string;
    invoiceNo: string;
    shipmentDate: string;
    invoiceValue: number;
    boeExchangeRate: number;
    invoiceValueInINR: number;
    customDuty: number;
    igst: number;
    forwardingExpense: number;
    clearingExpense: number;
    transportationExpense: number;
    otherCharges: number;
    totalLandedCost: number;
}

export interface ShipmentLandedCostSummaryDto {
    totalShipments: number;
    totalInvoiceValue: number;
    totalForwardingExpense: number;
    totalClearingExpense: number;
    totalTransportationExpense: number;
    totalCustomDuty: number;
    totalIGST: number;
    totalOtherCharges: number;
    grandTotalLandedCost: number;
}

export interface ShipmentLandedCostResponseDto {
    reports: ShipmentLandedCostReportDto[];
    summary: ShipmentLandedCostSummaryDto;
}