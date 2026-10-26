
export interface Warehouse {
    warehouseId: number;
    branchId: number;
    warehouseCode: string;
    warehouseName: string;
    type: string;
    isActive: boolean;
}

export interface WarehouseListItem {
    warehouseId: number;
    branchId: number;
    warehouseCode: string;
    warehouseName: string;
    type: string;
    isActive: boolean;
}
