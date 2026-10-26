export interface InventoryItem {
    itemId: number;
    itemType: 'Product' | 'Accessory';
    name: string;
    description: string;
    code: string;
    currentStock: number;
    warningLimit: number;
}

export interface ScrapRecord {
    id: number;
    itemId: number;
    itemType: string;
    itemName: string; // Mapped from backend join
    quantity: number;
    reason: string;
    scrapDate: string;
}

export interface StockAdjustmentPayload {
    itemId: number;
    itemType: string;
    quantity: number;
    action: 'Add' | 'Subtract';
    remarks: string;
}

export interface ScrapRequestPayload {
    itemId: number;
    itemType: string;
    quantity: number;
    reason: string;
}