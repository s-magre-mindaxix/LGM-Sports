export interface DispatchSelectionDto {
    orderAcceptanceId: number;
    dispatchNo: string;
    customerName: string;
    isSelected: boolean;
}

export interface DispatchDto {
    dispatchId: number;
    shipmentInitiateId: number;
    shipmentNo: string;
    customerId?: number;
    customerName?: string;
    dispatchDate?: string;
    materialDispatch: boolean;
    docketNo?: string;
    deliveredDate?: string;
    deliveredOnDate: boolean;
    remarks?: string;
    status: string;

    dispatchDetails: DispatchSelectionDto[];
    dispatchItems: ShipmentItemDto[];
    stockItems: CreateDispatchStockItemDto[];
}

export interface CreateDispatchDto {
    shipmentInitiateId: number;
    dispatchDate?: string;
    materialDispatch: boolean;
    docketNo?: string;
    deliveredDate?: string;
    deliveredOnDate: boolean;
    remarks?: string;
    dispatchDetails?: DispatchSelectionDto[];
    dispatchItems?: ShipmentItemDto[];
}

export interface UpdateDispatchDto extends CreateDispatchDto {
    dispatchId: number;
    status: string;
}

export interface DispatchShipmentDropdownDto {
    shipmentInitiateId: number;
    shipmentNo: string;
}

export interface ShipmentItemDto {
    shipmentItemId: number;
    boxNo: string;
    netWeightKg: number;
    grossWeightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    cbm: number;
    remarks: string;
}

export interface DispatchShipmentDetailsDto {
    shipmentInitiateId: number;
    shipmentNo: string;
     dispatches: DispatchSelectionDto[]; 
    items: ShipmentItemDto[];
}

export interface CreateDispatchStockItemDto {
    itemType: string;
    productId?: number;
    accessoryId?: number;
    itemCode?: string;
    description?: string;
    qty: number;
}