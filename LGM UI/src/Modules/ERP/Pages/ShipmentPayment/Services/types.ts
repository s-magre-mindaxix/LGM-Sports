export interface ShipmentPaymentListDto {
    shipmentPaymentId: number;
    shipmentUnderTransitId: number;
    shipmentNo: string;
    customerName: string;
    invoiceNo: string;
    deliveredDate: string;
    pendingDays: number;
    paymentCompleted: boolean;
    paymentCompletedDate?: string;
    status: string;
    financeRemarks?: string;
}

export interface ShipmentPaymentDetailsDto {
    shipmentPaymentId: number;
    shipmentUnderTransitId: number;
    shipmentNo: string;
    customerName: string;
    invoiceNo: string;
    invoiceValue: number;
    currencyName: string;
    deliveredDate: string;
    pendingDays: number;
    paymentCompleted: boolean;
    paymentCompletedDate?: string;
    financeRemarks?: string;
    status: string;
}

export interface UpdateShipmentPaymentDto {
    shipmentPaymentId: number;
    deliveredDate: string;
    paymentCompletedDate?: string;
    paymentCompleted: boolean;
    financeRemarks?: string;
}

export interface CreateShipmentPaymentDto {
    shipmentUnderTransitId: number;
    deliveredDate: string;
    financeRemarks?: string;
}

// Helper for the selection dropdown in Wizard
export interface EligibleTransitDto {
    shipmentUnderTransitId: number;
    shipmentNo: string;
    customerName: string;
    invoiceNo: string;
}