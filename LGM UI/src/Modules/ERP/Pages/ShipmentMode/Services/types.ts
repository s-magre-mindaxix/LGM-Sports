export interface ShipmentMode {
    id: number;
    modeName: string;
    modeCode: string;
}

export interface ShipmentModeFormProps {
    data: ShipmentMode;
    setData: React.Dispatch<React.SetStateAction<ShipmentMode>>;
}