
export interface Location {
    locationId: number;
    warehouseId: number;
    code: string;
    zone: string;
    rack: string;
    shelf: string;
    bin: string;
    isActive: boolean;
}

export interface LocationListItem {
    locationId: number;
    warehouseId: number;
    code: string;
    zone: string;
    rack: string;
    shelf: string;
    bin: string;
    isActive: boolean;
}
