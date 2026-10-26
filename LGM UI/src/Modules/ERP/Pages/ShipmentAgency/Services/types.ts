export interface Agency {
    id: number;
    agencyName: string;
    agencyCode?: string;
    agencyTypeName?: string;
}

export interface ShipmentAgencyAssignment {
    shipmentAgencyAssignmentId: number;
    shipmentInitiateId: number;
    shipmentNo?: string;
    agencyId: number;
    agencyName?: string;
    agencyType?: string;
    assignedDate: string;
    remarks: string;
}

export interface CreateAgencyAssignmentDto {
    shipmentInitiateId: number;
    agencyId: number;
    remarks: string;
}

export interface ShipmentDropdowns {
    shipmentInitiateId: number; 
    shipmentNo: string;        
}