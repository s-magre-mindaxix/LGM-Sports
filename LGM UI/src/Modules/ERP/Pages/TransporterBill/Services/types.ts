export interface TransporterBillListDto {
    transporterBillId: number;
    shipmentNo: string;
    agencyName: string;
    billNo: string;
    billDate?: string;
    billAmount: number;
    gstAmount: number;
    totalAmount: number;
    paymentStatus: string;
}

export interface TransporterBillDetailsDto {
    transporterBillId: number;
    shipmentInitiateId: number;
    shipmentAgencyAssignmentId: number;
    shipmentNo: string;
    agencyName: string;
    billNo: string;
    billDate?: string;
    billAmount: number;
    gstAmount: number;
    totalAmount: number;
    receivingDate?: string;
    paymentDate?: string;
    paymentStatus: string;
    remarks?: string;
}

export interface CreateTransporterBillDto {
    shipmentInitiateId: number;
    shipmentAgencyAssignmentId: number;
    billNo: string;
    billDate?: string;
    billAmount: number;
    gstAmount: number;
    receivingDate?: string;
    paymentDate?: string;
    remarks?: string;
}

export interface EligibleShipmentDto {
    shipmentInitiateId: number;
    shipmentAgencyAssignmentId: number;
    shipmentNo: string;
    agencyName: string;
}