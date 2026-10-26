// /Masters/ShipmentType/Services/types.ts


export interface ShipmentType {
    id: number;
    shipmentModeId: number;
    shipmentModeName?: string;
    typeName: string;
    typeCode: string;
   // For displaying the mode name in lists
}

export interface ShipmentTypeFormProps {
    data: ShipmentType;
    setData: React.Dispatch<React.SetStateAction<ShipmentType>>;
}