export interface ShipmentItem {
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

// Added for dynamic dropdowns
export interface ShipmentMode {
    id: number;
    modeName: string;
}

// Added for dynamic dropdowns
export interface ShipmentType {
    id: number;
    typeName: string;
}

export interface ShipmentInitiate {
    shipmentInitiateId: number;
    shipmentNo: string;
    sourceType: "ORDERACCEPTANCE" | "PURCHASEORDER" | "";
    orderAcceptanceId?: number;
    purchaseOrderId?: number;
    sourceDocumentNo?: string;
    customerId?: number;
    customerName?: string;
    email?: string;
    gstNo?: string;
    consigneeAddress?: string;
    shipperAddress?: string;
    invoiceValue?: number;
    currencyId?: number;
    currencyName?: string;
    shipmentModeId: number;
    shipmentModeName?: string;
    importPackingList: string;
    importPackingDate: string | null;
    invoiceNo: string;
    invoiceDate: string | null;
    containerNo: string;
    blNo: string;
    awbNo: string;
    shipmentDate: string;
    remarks: string;
    status: string;
    items: ShipmentItem[];
    sourceItems: ShipmentSourceItem[];
}

export interface ShipmentAutoFill {
    customerId?: number;
    customerName?: string;
    gstNo?: string;
    consigneeAddress?: string;
    shipperAddress?: string;
    invoiceValue?: number;
    currencyId?: number;
    currencyName?: string;
    sourceItems?: ShipmentSourceItem[];
}

export interface ShipmentDropdown {
    id: number;
    number: string;
}

export interface ShipmentTabProps {
    data: ShipmentInitiate;
    setData: React.Dispatch<React.SetStateAction<ShipmentInitiate>>;
}


export interface ShipmentSourceItem {
    shipmentSourceItemId?: number;

    itemType: string;
    productId?: number;
    accessoryId?: number;

    itemCode: string;
     partNo?: string;
    itemName: string;

    quantity: number;
    unit: string;
}